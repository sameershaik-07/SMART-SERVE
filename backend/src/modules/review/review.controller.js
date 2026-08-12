const { createReviewSchema } = require("./review.validation");
const { createReview } = require("./review.service");

const createReviewController = async (req, res) => {
    try {
        // Validate request body
        const validatedData = createReviewSchema.parse(req.body);

        // userId comes from the authentication middleware
        const userId = req.user.userId;

        // Create the review
        const review = await createReview(userId, validatedData);

        res.status(201).json({
            message: "Review created successfully",
            review
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createReviewController
};