// Resend API Client setup
const { Resend } = require("resend");

const resendClient = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_dev");

module.exports = resendClient;
