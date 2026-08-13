const { createBookingSchema, updateBookingStatusSchema } = require("./bookings.validation");
const bookingService = require("./bookings.service");

const create = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = createBookingSchema.parse(req.body);
        const booking = await bookingService.createBooking(userId, validatedData);

        return res.status(201).json({
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        next(error);
    }
};

const getCustomerBookings = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const bookings = await bookingService.getCustomerBookings(userId);

        return res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

const getProviderBookings = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const bookings = await bookingService.getProviderBookings(userId);

        return res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const user = req.user;
        const booking = await bookingService.getBookingById(user, req.params.id);

        return res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const user = req.user;
        const { status } = updateBookingStatusSchema.parse(req.body);
        const updated = await bookingService.updateBookingStatus(user, req.params.id, status);

        return res.status(200).json({
            message: `Booking status updated to ${status}`,
            booking: updated
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getCustomerBookings,
    getProviderBookings,
    getById,
    updateStatus
};
