const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));

export const handler = async (event) => {
    if (event.triggerSource !== "CustomMessage_ForgotPassword") {
        return event;
    }

    const resetToken = event.request?.clientMetadata?.resetToken;
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

    if (!resetToken || !frontendUrl) {
        console.error("CustomMessage_ForgotPassword is missing resetToken or FRONTEND_URL");
        return event;
    }

    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const safeUrl = escapeHtml(resetUrl);

    event.response.emailSubject = "Reset your SmartServ password";
    event.response.emailMessage = `
        <div style="margin:0;padding:0;background:#f5f0e8;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f0e8;padding:32px 16px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7dfd2;border-radius:12px;">
                            <tr>
                                <td style="padding:32px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
                                    <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a8178;font-weight:700;">SmartServ</div>
                                    <h1 style="margin:16px 0 0 0;font-size:28px;line-height:1.2;color:#2b2723;font-weight:600;">Reset your password</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5c554d;">
                                    <p style="margin:0 0 16px 0;">We received a request to reset the password for your SmartServ account.</p>
                                    <p style="margin:0 0 24px 0;">Click the button below to choose a new password. This link expires in 1 hour.</p>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;">
                                        <tr>
                                            <td style="border-radius:8px;background:#c25a3a;">
                                                <a href="${safeUrl}" style="display:inline-block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">Reset password</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:0 0 16px 0;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
                                    <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#8a8178;">If the button does not work, copy and paste this link into your browser:</p>
                                    <p style="margin:0 0 24px 0;font-size:12px;line-height:1.6;word-break:break-all;"><a href="${safeUrl}" style="color:#c25a3a;">${safeUrl}</a></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#8a8178;border-top:1px solid #eee7db;">
                                    <p style="margin:16px 0 0 0;">SmartServ · Home services, considered.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <!-- ${event.request?.codeParameter || ""} -->
        </div>
    `;

    return event;
};
