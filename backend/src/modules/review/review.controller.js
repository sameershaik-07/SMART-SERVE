const { createReviewSchema } = require("./review.validation");
const { createReview } = require("./review.service");

const createReviewController = async (req, res, next) => {
    try {
        const validatedData = createReviewSchema.parse(req.body);
        const userId = req.user.userId;

        const review = await createReview(userId, validatedData);

        return res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReviewController
};
