const { categorySchema, rejectProviderSchema } = require("./admin.validation");
const adminService = require("./admin.service");

const getPendingProviders = async (req, res, next) => {
    try {
        const providers = await adminService.getPendingProviders();
        return res.status(200).json(providers);
    } catch (error) {
        next(error);
    }
};

const verifyProvider = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await adminService.verifyProvider(userId, req.params.id);

        return res.status(200).json({
            message: "Provider verified successfully",
            provider: result
        });
    } catch (error) {
        next(error);
    }
};

const rejectProvider = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { reason } = rejectProviderSchema.parse(req.body);
        const result = await adminService.rejectProvider(userId, req.params.id, reason);

        return res.status(200).json({
            message: "Provider verification rejected",
            provider: result
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = categorySchema.parse(req.body);
        const category = await adminService.createCategory(userId, validatedData);

        return res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const validatedData = categorySchema.partial().parse(req.body);
        const category = await adminService.updateCategory(req.params.id, validatedData);

        return res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        await adminService.deleteCategory(req.params.id);

        return res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await adminService.getCategories();
        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const analytics = await adminService.getAnalyticsOverview();
        return res.status(200).json(analytics);
    } catch (error) {
        next(error);
    }
};

const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await adminService.getAuditLogs();
        return res.status(200).json(logs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingProviders,
    verifyProvider,
    rejectProvider,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getAnalytics,
    getAuditLogs
};
