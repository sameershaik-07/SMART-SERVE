const { updateProviderProfileSchema, providerSearchQuerySchema } = require("./providers.validation");
const providerService = require("./providers.service");

const getProviders = async (req, res, next) => {
    try {
        const query = providerSearchQuerySchema.parse(req.query);
        const result = await providerService.listProviders(query);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getProviderById = async (req, res, next) => {
    try {
        const provider = await providerService.getProviderById(req.params.id);

        return res.status(200).json(provider);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = updateProviderProfileSchema.parse(req.body);
        const updated = await providerService.updateProviderProfile(userId, validatedData);

        return res.status(200).json({
            message: "Provider profile updated successfully",
            provider: updated
        });
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const stats = await providerService.getProviderDashboardStats(userId);

        return res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProviders,
    getProviderById,
    updateProfile,
    getDashboardStats
};
