const { updateProfileSchema, changePasswordSchema } = require("./users.validation");
const userService = require("./users.service");

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await userService.getUserProfile(userId);

        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = updateProfileSchema.parse(req.body);
        const updated = await userService.updateUserProfile(userId, validatedData);

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updated
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const result = await userService.changePassword(userId, currentPassword, newPassword);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
