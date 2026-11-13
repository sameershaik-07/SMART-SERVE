#!/usr/bin/env bash
#
# Provision the SmartServ Cognito password-reset email flow.
#
# Creates:
#   - a dedicated Cognito user pool (admin-create-only, no hosted UI)
#   - a public app client with no secret
#   - a CustomMessage Lambda that replaces the forgot-password email body
#   - a least-privilege IAM user for the backend
#
# Required tools: awscli v2, jq, zip.
# The script is safe to re-run, but an IAM access key secret is only returned
# once. If a key already exists it is not recreated.

set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
POOL_NAME="${COGNITO_POOL_NAME:-smartserve-password-reset}"
CLIENT_NAME="${COGNITO_CLIENT_NAME:-smartserve-backend}"
LAMBDA_NAME="${COGNITO_LAMBDA_NAME:-smartserve-cognito-forgot-password}"
LAMBDA_ROLE_NAME="${COGNITO_LAMBDA_ROLE_NAME:-smartserve-cognito-custom-message-role}"
BACKEND_IAM_USER="${BACKEND_IAM_USER:-smartserve-backend-cognito}"
FRONTEND_URL="${FRONTEND_URL:-https://main.d36sahe4s27718.amplifyapp.com}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/opencode/smartserve-cognito-backend.env}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/custom-message"

for command in aws jq zip; do
    command -v "$command" >/dev/null 2>&1 || {
        echo "Missing required command: $command" >&2
        exit 1
    }
done

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
echo "AWS account: $ACCOUNT_ID"
echo "Region:      $REGION"

# ---------------------------------------------------------------------------
# User pool
# ---------------------------------------------------------------------------
POOL_ID="$(aws cognito-idp list-user-pools --max-results 60 --region "$REGION" \
    --query "UserPools[?Name=='$POOL_NAME'].Id | [0]" --output text)"

if [ -z "$POOL_ID" ] || [ "$POOL_ID" = "None" ]; then
    echo "Creating Cognito user pool: $POOL_NAME"
    POOL_ID="$(aws cognito-idp create-user-pool \
        --pool-name "$POOL_NAME" \
        --region "$REGION" \
        --username-attributes email \
        --auto-verified-attributes email \
        --mfa-configuration OFF \
        --account-recovery-setting '{"RecoveryMechanisms":[{"Name":"verified_email","Priority":1}]}' \
        --admin-create-user-config '{"AllowAdminCreateUserOnly":true}' \
        --email-configuration '{"EmailSendingAccount":"COGNITO_DEFAULT"}' \
        --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":false,"RequireLowercase":false,"RequireNumbers":false,"RequireSymbols":false}}' \
        --query 'UserPool.Id' --output text)"
else
    echo "Using existing Cognito user pool: $POOL_ID"
fi

POOL_ARN="arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${POOL_ID}"

# ---------------------------------------------------------------------------
# App client
# ---------------------------------------------------------------------------
CLIENT_ID="$(aws cognito-idp list-user-pool-clients --user-pool-id "$POOL_ID" --region "$REGION" \
    --query "UserPoolClients[?ClientName=='$CLIENT_NAME'].ClientId | [0]" --output text)"

if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "None" ]; then
    echo "Creating Cognito app client: $CLIENT_NAME"
    CLIENT_ID="$(aws cognito-idp create-user-pool-client \
        --user-pool-id "$POOL_ID" \
        --client-name "$CLIENT_NAME" \
        --no-generate-secret \
        --region "$REGION" \
        --query 'UserPoolClient.ClientId' --output text)"
else
    echo "Using existing Cognito app client: $CLIENT_ID"
fi

# ---------------------------------------------------------------------------
# Lambda execution role
# ---------------------------------------------------------------------------
ROLE_ARN="$(aws iam get-role --role-name "$LAMBDA_ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || true)"

if [ -z "$ROLE_ARN" ] || [ "$ROLE_ARN" = "None" ]; then
    echo "Creating Lambda execution role: $LAMBDA_ROLE_NAME"
    TRUST_POLICY="$(mktemp)"
    cat > "$TRUST_POLICY" <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
JSON
    ROLE_ARN="$(aws iam create-role \
        --role-name "$LAMBDA_ROLE_NAME" \
        --assume-role-policy-document "file://$TRUST_POLICY" \
        --query 'Role.Arn' --output text)"
    rm -f "$TRUST_POLICY"

    aws iam attach-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    echo "Waiting for the Lambda role to propagate..."
    sleep 10
else
    echo "Using existing Lambda execution role: $ROLE_ARN"
fi

# ---------------------------------------------------------------------------
# Lambda function
# ---------------------------------------------------------------------------
TMP_DIR="$(mktemp -d)"
ZIP_FILE="$TMP_DIR/function.zip"
(cd "$LAMBDA_DIR" && zip -q "$ZIP_FILE" index.mjs)

if aws lambda get-function --function-name "$LAMBDA_NAME" --region "$REGION" >/dev/null 2>&1; then
    echo "Updating Lambda function: $LAMBDA_NAME"
    aws lambda update-function-code \
        --function-name "$LAMBDA_NAME" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$REGION" >/dev/null
    aws lambda wait function-updated --function-name "$LAMBDA_NAME" --region "$REGION"
    aws lambda update-function-configuration \
        --function-name "$LAMBDA_NAME" \
        --runtime nodejs20.x \
        --handler index.handler \
        --timeout 10 \
        --memory-size 128 \
        --environment "Variables={FRONTEND_URL=$FRONTEND_URL}" \
        --region "$REGION" >/dev/null
    aws lambda wait function-updated --function-name "$LAMBDA_NAME" --region "$REGION"
else
    echo "Creating Lambda function: $LAMBDA_NAME"
    aws lambda create-function \
        --function-name "$LAMBDA_NAME" \
        --runtime nodejs20.x \
        --handler index.handler \
        --role "$ROLE_ARN" \
        --zip-file "fileb://$ZIP_FILE" \
        --timeout 10 \
        --memory-size 128 \
        --environment "Variables={FRONTEND_URL=$FRONTEND_URL}" \
        --region "$REGION" >/dev/null
    aws lambda wait function-active --function-name "$LAMBDA_NAME" --region "$REGION"
fi

rm -rf "$TMP_DIR"

LAMBDA_ARN="$(aws lambda get-function --function-name "$LAMBDA_NAME" --region "$REGION" \
    --query 'Configuration.FunctionArn' --output text)"

# Cognito must be allowed to invoke the function. Re-running the script should
# not fail if the permission already exists.
aws lambda remove-permission \
    --function-name "$LAMBDA_NAME" \
    --statement-id "cognito-${POOL_ID}" \
    --region "$REGION" >/dev/null 2>&1 || true

aws lambda add-permission \
    --function-name "$LAMBDA_NAME" \
    --statement-id "cognito-${POOL_ID}" \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn "$POOL_ARN" \
    --region "$REGION" >/dev/null

# ---------------------------------------------------------------------------
# Attach the custom message trigger and keep the pool configuration intact.
# update-user-pool is a full replacement for the fields it manages, so every
# setting is sent together. Partial updates can silently clear AutoVerified
# attributes, admin-create-only, or the Lambda trigger.
# ---------------------------------------------------------------------------
echo "Applying Cognito pool configuration and CustomMessage trigger"
aws cognito-idp update-user-pool \
    --user-pool-id "$POOL_ID" \
    --region "$REGION" \
    --auto-verified-attributes email \
    --mfa-configuration OFF \
    --account-recovery-setting '{"RecoveryMechanisms":[{"Name":"verified_email","Priority":1}]}' \
    --admin-create-user-config '{"AllowAdminCreateUserOnly":true}' \
    --email-configuration '{"EmailSendingAccount":"COGNITO_DEFAULT"}' \
    --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":false,"RequireLowercase":false,"RequireNumbers":false,"RequireSymbols":false}}' \
    --lambda-config "{\"CustomMessage\":\"$LAMBDA_ARN\"}" >/dev/null

# ---------------------------------------------------------------------------
# Least-privilege backend IAM user
# ---------------------------------------------------------------------------
if ! aws iam get-user --user-name "$BACKEND_IAM_USER" >/dev/null 2>&1; then
    echo "Creating backend IAM user: $BACKEND_IAM_USER"
    aws iam create-user --user-name "$BACKEND_IAM_USER" >/dev/null
else
    echo "Using existing backend IAM user: $BACKEND_IAM_USER"
fi

POLICY_FILE="$(mktemp)"
cat > "$POLICY_FILE" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ForgotPassword",
      "Effect": "Allow",
      "Action": ["cognito-idp:ForgotPassword"],
      "Resource": "*"
    },
    {
      "Sid": "AdminUserManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes"
      ],
      "Resource": "$POOL_ARN"
    }
  ]
}
JSON

aws iam put-user-policy \
    --user-name "$BACKEND_IAM_USER" \
    --policy-name SmartServeCognitoPasswordReset \
    --policy-document "file://$POLICY_FILE"
rm -f "$POLICY_FILE"

EXISTING_KEY="$(aws iam list-access-keys --user-name "$BACKEND_IAM_USER" \
    --query 'AccessKeyMetadata[0].AccessKeyId' --output text)"

mkdir -p "$(dirname "$OUTPUT_FILE")"

if [ -z "$EXISTING_KEY" ] || [ "$EXISTING_KEY" = "None" ]; then
    echo "Creating backend IAM access key"
    KEY_JSON="$(aws iam create-access-key --user-name "$BACKEND_IAM_USER" --output json)"
    ACCESS_KEY_ID="$(echo "$KEY_JSON" | jq -r '.AccessKey.AccessKeyId')"
    SECRET_ACCESS_KEY="$(echo "$KEY_JSON" | jq -r '.AccessKey.SecretAccessKey')"

    cat > "$OUTPUT_FILE" <<EOF
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=$POOL_ID
COGNITO_CLIENT_ID=$CLIENT_ID
COGNITO_RESET_ENABLED=true
AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY
EOF
    chmod 600 "$OUTPUT_FILE"
else
    echo "An access key already exists for $BACKEND_IAM_USER; not creating another."
    cat > "$OUTPUT_FILE" <<EOF
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=$POOL_ID
COGNITO_CLIENT_ID=$CLIENT_ID
COGNITO_RESET_ENABLED=true
# The existing access key secret cannot be retrieved. Reuse the secret already
# stored in Render, or create a new key manually if it was lost.
AWS_ACCESS_KEY_ID=$EXISTING_KEY
AWS_SECRET_ACCESS_KEY=
EOF
    chmod 600 "$OUTPUT_FILE"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo
echo "Cognito password-reset setup complete."
echo "  User pool:  $POOL_ID"
echo "  App client: $CLIENT_ID"
echo "  Lambda:     $LAMBDA_ARN"
echo "  IAM user:   $BACKEND_IAM_USER"
echo "  Env file:   $OUTPUT_FILE (mode 600; contains the access key secret)"
echo
echo "Next: add the values from $OUTPUT_FILE to the Render backend environment,"
echo "then deploy the backend."
