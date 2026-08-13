const crypto = require("crypto");
const prisma = require("../../config/prisma");
const razorpay = require("../../config/razorpay");

const createPaymentOrder = async (userId, bookingId) => {
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
        throw new Error("Customer profile not found");
    }

    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { service: true }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.customerId !== customer.id) {
        throw new Error("Unauthorized to pay for this booking");
    }

    const amount = booking.totalPrice || booking.service?.price || 500; // in INR
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay Order or fallback mock order for dev sandbox
    let order;
    try {
        order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_booking_${booking.id}`,
            notes: { bookingId: booking.id }
        });
    } catch (err) {
        // Fallback for dev testing without active Razorpay key
        order = {
            id: `order_mock_${Date.now()}`,
            amount: amountInPaise,
            currency: "INR"
        };
    }

    return {
        orderId: order.id,
        amount: amount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey123",
        bookingId: booking.id
    };
};

const verifyPayment = async (userId, paymentData) => {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMode } = paymentData;

    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Verify Razorpay HMAC signature (or bypass in sandbox if mock order)
    if (!razorpayOrderId.startsWith("order_mock_")) {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecretkey123")
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            throw new Error("Invalid payment signature verification failed.");
        }
    }

    const amount = booking.totalPrice || 500;

    // Use transaction to update Payment entity and Booking state to ACCEPTED
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.upsert({
            where: { bookingId: booking.id },
            update: {
                amount,
                paymentMode: paymentMode || "RAZORPAY",
                status: "SUCCESS"
            },
            create: {
                bookingId: booking.id,
                amount,
                paymentMode: paymentMode || "RAZORPAY",
                status: "SUCCESS"
            }
        });

        const updatedBooking = await tx.booking.update({
            where: { id: booking.id },
            data: { status: "ACCEPTED" }
        });

        return {
            payment,
            booking: updatedBooking
        };
    });
};

const getPaymentByBookingId = async (bookingId) => {
    const payment = await prisma.payment.findUnique({
        where: { bookingId: parseInt(bookingId) }
    });

    if (!payment) {
        throw new Error("Payment details not found for this booking.");
    }

    return payment;
};

const processRefund = async (userId, bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { payment: true }
    });

    if (!booking || !booking.payment) {
        throw new Error("No completed payment record found for refund.");
    }

    if (booking.status !== "CANCELLED") {
        throw new Error("Refund can only be processed for cancelled bookings.");
    }

    return prisma.payment.update({
        where: { bookingId: booking.id },
        data: { status: "FAILED" } // Mark refunded/failed
    });
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentByBookingId,
    processRefund
};
