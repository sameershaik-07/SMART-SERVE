const resend = require("../config/resend");

const sendOTPEmail = async (email, otp) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV MODE] OTP Email for ${email}: ${otp}`);
            return;
        }
        await resend.emails.send({
            from: "SMART-SERVE <no-reply@smartserve.com>",
            to: [email],
            subject: "Your Email Verification OTP - SMART-SERVE",
            html: `<p>Your email verification OTP code is: <strong>${otp}</strong>. Valid for 15 minutes.</p>`
        });
    } catch (err) {
        console.error("Failed to send OTP email via Resend:", err.message);
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] Password Reset Token for ${email}: ${resetToken}`);
        return false;
    }

    const frontendUrl = (process.env.FRONTEND_URL || "https://main.d36sahe4s27718.amplifyapp.com").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    try {
        await resend.emails.send({
            from: "SMART-SERVE <no-reply@smartserve.com>",
            to: [email],
            subject: "Reset your SmartServ password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2b2723;">
                    <h2>Reset your SmartServ password</h2>
                    <p>We received a request to reset the password for your SmartServ account.</p>
                    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#c25a3a;color:#fff;text-decoration:none;border-radius:6px;">Reset password</a></p>
                    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
                    <p style="font-size:12px;color:#6b6258;">If the button does not work, copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                </div>
            `
        });
        return true;
    } catch (err) {
        console.error("Failed to send Password Reset email via Resend:", err.message);
        throw err;
    }
};

module.exports = {
    sendOTPEmail,
    sendPasswordResetEmail
};
