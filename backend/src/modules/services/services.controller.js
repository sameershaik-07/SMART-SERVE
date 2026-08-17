const { createServiceSchema, updateServiceSchema } = require("./services.validation");
const servicesService = require("./services.service");

const create = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = createServiceSchema.parse(req.body);
        const service = await servicesService.createService(userId, validatedData);

        return res.status(201).json({
            message: "Service created successfully",
            service
        });
    } catch (error) {
        next(error);
    }
};

const getProviderServices = async (req, res, next) => {
    try {
        const services = await servicesService.getProviderServices(req.params.providerId);
        return res.status(200).json(services);
    } catch (error) {
        next(error);
    }
};

const getAllServices = async (req, res, next) => {
    try {
        const services = await servicesService.getAllServices(req.query);
        return res.status(200).json(services);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = updateServiceSchema.parse(req.body);
        const updated = await servicesService.updateService(userId, req.params.id, validatedData);

        return res.status(200).json({
            message: "Service updated successfully",
            service: updated
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await servicesService.deleteService(userId, req.params.id);

        return res.status(200).json({
            message: "Service deactivated successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getProviderServices,
    getAllServices,
    update,
    remove
};
