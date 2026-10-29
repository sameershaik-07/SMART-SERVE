const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

const createReview = async (userId, reviewData) => {
    const { bookingId, rating, comment } = reviewData;

    // Find the customer profile of the logged-in user
    const customer = await prisma.customer.findUnique({
        where: { userId }
    });

    if (!customer) {
        throw ApiError.notFound("Customer profile not found");
    }

    // Check whether the booking exists
    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) }
    });

    if (!booking) {
        throw ApiError.notFound("Booking not found");
    }

    // Check whether this booking belongs to the logged-in customer
    if (booking.customerId !== customer.id) {
        throw ApiError.forbidden("You can only review your own booking");
    }

    // Review only completed bookings
    if (booking.status !== "COMPLETED") {
        throw ApiError.badRequest("You can only review a completed booking");
    }

    // Check whether the booking already has a review
    const existingReview = await prisma.review.findUnique({
        where: { bookingId: parseInt(bookingId) }
    });

    if (existingReview) {
        throw ApiError.conflict("This booking has already been reviewed");
    }

    // Create the review and recalculate provider's average rating in a transaction
    return prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                customerId: customer.id,
                bookingId: parseInt(bookingId),
                rating: parseInt(rating),
                comment: comment ? comment.trim() : null
            }
        });

        // Compute new average rating for the provider
        const allProviderReviews = await tx.review.findMany({
            where: {
                booking: { providerId: booking.providerId }
            },
            select: { rating: true }
        });

        if (allProviderReviews.length > 0) {
            const sum = allProviderReviews.reduce((acc, r) => acc + r.rating, 0);
            const avgRating = Number((sum / allProviderReviews.length).toFixed(1));

            await tx.serviceProvider.update({
                where: { id: booking.providerId },
                data: { rating: avgRating }
            });
        }

        return review;
    });
};

module.exports = {
    createReview
};
