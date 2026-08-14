const prisma = require("../../config/prisma");

const createReview = async (userId, reviewData) => {
    const { bookingId, rating, comment } = reviewData;

    // Find the customer profile of the logged-in user
    const customer = await prisma.customer.findUnique({
        where: {
            userId: userId
        }
    });

    if (!customer) {
        throw new Error("Customer profile not found");
    }

    // Check whether the booking exists
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Check whether this booking belongs to the logged-in customer
    if (booking.customerId !== customer.id) {
        throw new Error("You can only review your own booking");
    }

    // Review only completed bookings
    if (booking.status !== "COMPLETED") {
        throw new Error("You can only review a completed booking");
    }

    // Check whether the booking already has a review
    const existingReview = await prisma.review.findUnique({
        where: {
            bookingId: bookingId
        }
    });

    if (existingReview) {
        throw new Error("This booking has already been reviewed");
    }

    // Create the review
    const review = await prisma.review.create({
        data: {
            customerId: customer.id,
            bookingId: bookingId,
            rating: rating,
            comment: comment
        }
    });

    return review;
};

module.exports = {
    createReview
};