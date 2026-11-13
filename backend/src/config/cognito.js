const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");

const region = process.env.AWS_REGION || process.env.COGNITO_REGION || "ap-south-1";
const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
const clientId = process.env.COGNITO_CLIENT_ID || "";
const enabled = process.env.COGNITO_RESET_ENABLED !== "false";

const isConfigured = Boolean(enabled && userPoolId && clientId);

const client = new CognitoIdentityProviderClient({ region });

module.exports = {
    client,
    region,
    userPoolId,
    clientId,
    enabled,
    isConfigured
};
