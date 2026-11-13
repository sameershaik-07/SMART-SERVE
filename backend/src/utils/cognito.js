const crypto = require("crypto");
const {
    AdminCreateUserCommand,
    AdminGetUserCommand,
    AdminSetUserPasswordCommand,
    AdminUpdateUserAttributesCommand,
    ForgotPasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const { client, userPoolId, clientId, isConfigured } = require("../config/cognito");

const randomPassword = () => `Aa1!${crypto.randomBytes(24).toString("base64url")}`;

const isEmailVerified = (user) => {
    const attribute = (user.UserAttributes || []).find((item) => item.Name === "email_verified");
    return attribute?.Value === "true";
};

const needsPasswordReset = (user) =>
    ["FORCE_CHANGE_PASSWORD", "RESET_REQUIRED", "UNCONFIRMED"].includes(user?.UserStatus);

/**
 * Cognito only sends password-reset codes to users that exist in its pool.
 * The application remains the source of truth: this creates a hidden,
 * confirmed Cognito identity that is never used to sign in.
 */
const ensureCognitoUser = async (email) => {
    if (!isConfigured) {
        throw new Error("Cognito password reset is not configured");
    }

    let user = null;

    try {
        user = await client.send(new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: email
        }));
    } catch (error) {
        if (error.name !== "UserNotFoundException") {
            throw error;
        }
    }

    if (!user) {
        try {
            await client.send(new AdminCreateUserCommand({
                UserPoolId: userPoolId,
                Username: email,
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "email_verified", Value: "true" }
                ],
                MessageAction: "SUPPRESS"
            }));
        } catch (error) {
            // Two simultaneous reset requests can race to create the same user.
            if (error.name !== "UsernameExistsException") {
                throw error;
            }
        }

        await client.send(new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: email,
            Password: randomPassword(),
            Permanent: true
        }));

        return;
    }

    if (!isEmailVerified(user)) {
        await client.send(new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [{ Name: "email_verified", Value: "true" }]
        }));
    }

    if (needsPasswordReset(user)) {
        await client.send(new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: email,
            Password: randomPassword(),
            Permanent: true
        }));
    }
};

const sendPasswordResetViaCognito = async (email, resetToken) => {
    if (!isConfigured) {
        throw new Error("Cognito password reset is not configured");
    }

    await ensureCognitoUser(email);

    await client.send(new ForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ClientMetadata: { resetToken }
    }));

    return true;
};

module.exports = {
    ensureCognitoUser,
    sendPasswordResetViaCognito,
    isCognitoConfigured: isConfigured
};
