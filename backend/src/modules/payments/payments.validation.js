const { z } = require("zod");

const createOrderSchema = z.object({
    bookingId: z.number().int().positive("Booking ID is required")
});

const verifyPaymentSchema = z.object({
    bookingId: z.number().int().positive("Booking ID is required"),
    razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
    razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
    razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
    paymentMode: z.string().optional().default("RAZORPAY_SANDBOX")
});

const refundPaymentSchema = z.object({
    reason: z.string().optional()
});

module.exports = {
    createOrderSchema,
    verifyPaymentSchema,
    refundPaymentSchema
};
