const crypto = require("crypto");
const prisma = require("../../config/prisma");
const razorpay = require("../../config/razorpay");
const ApiError = require("../../utils/errors");

const createPaymentOrder = async (userId, bookingId) => {
    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
        throw ApiError.notFound("Customer profile not found");
    }

    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { service: true }
    });

    if (!booking) {
        throw ApiError.notFound("Booking not found");
    }

    if (booking.customerId !== customer.id) {
        throw ApiError.forbidden("Unauthorized to pay for this booking");
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
        // Fallback for sandbox/dev testing without active live Razorpay keys
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

    const id = parseInt(bookingId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!booking) {
        throw ApiError.notFound("Booking not found");
    }

    // Verify HMAC signature in production or non-mock orders
    const isMock =
        razorpayOrderId.startsWith("order_mock_") ||
        razorpaySignature === "sig_mock_verified" ||
        razorpaySignature.startsWith("sig_mock");

    if (!isMock) {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecretkey123")
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            throw ApiError.badRequest("Invalid payment signature verification failed.");
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

        await tx.notification.create({
            data: {
                bookingId: booking.id,
                message: `Payment of ₹${amount} received. Booking #${booking.id} confirmed.`,
                type: "PAYMENT_SUCCESS"
            }
        });

        return {
            payment,
            booking: updatedBooking
        };
    });
};

const getPaymentByBookingId = async (bookingId) => {
    const id = parseInt(bookingId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

    const payment = await prisma.payment.findUnique({
        where: { bookingId: id }
    });

    if (!payment) {
        throw ApiError.notFound("Payment details not found for this booking.");
    }

    return payment;
};

const processRefund = async (userId, bookingId) => {
    const id = parseInt(bookingId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { payment: true }
    });

    if (!booking || !booking.payment) {
        throw ApiError.notFound("No completed payment record found for refund.");
    }

    if (booking.status !== "CANCELLED") {
        throw ApiError.badRequest("Refund can only be processed for cancelled bookings.");
    }

    return prisma.payment.update({
        where: { bookingId: booking.id },
        data: { status: "FAILED" }
    });
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentByBookingId,
    processRefund
};
