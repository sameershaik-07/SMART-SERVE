const { createOrderSchema, verifyPaymentSchema } = require("./payments.validation");
const paymentService = require("./payments.service");

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { bookingId } = createOrderSchema.parse(req.body);
        const order = await paymentService.createPaymentOrder(userId, bookingId);

        return res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

const verify = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = verifyPaymentSchema.parse(req.body);
        const result = await paymentService.verifyPayment(userId, validatedData);

        return res.status(200).json({
            message: "Payment verified successfully",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const getByBooking = async (req, res, next) => {
    try {
        const payment = await paymentService.getPaymentByBookingId(req.params.bookingId);
        return res.status(200).json(payment);
    } catch (error) {
        next(error);
    }
};

const refund = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await paymentService.processRefund(userId, req.params.bookingId);

        return res.status(200).json({
            message: "Refund processed successfully",
            payment: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    verify,
    getByBooking,
    refund
};
