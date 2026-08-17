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
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV MODE] Password Reset Token for ${email}: ${resetToken}`);
            return;
        }
        await resend.emails.send({
            from: "SMART-SERVE <no-reply@smartserve.com>",
            to: [email],
            subject: "Password Reset Request - SMART-SERVE",
            html: `<p>Click here to reset your password: <strong>${resetToken}</strong></p>`
        });
    } catch (err) {
        console.error("Failed to send Password Reset email via Resend:", err.message);
    }
};

module.exports = {
    sendOTPEmail,
    sendPasswordResetEmail
};
