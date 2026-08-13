const { createSlotSchema, updateSlotSchema } = require("./availability.validation");
const availabilityService = require("./availability.service");

const create = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = createSlotSchema.parse(req.body);
        const slot = await availabilityService.createSlot(userId, validatedData);

        return res.status(201).json({
            message: "Availability slot created successfully",
            slot
        });
    } catch (error) {
        next(error);
    }
};

const getProviderSlots = async (req, res, next) => {
    try {
        const slots = await availabilityService.getProviderSlots(req.params.providerId);
        return res.status(200).json(slots);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const validatedData = updateSlotSchema.parse(req.body);
        const updated = await availabilityService.updateSlot(userId, req.params.id, validatedData);

        return res.status(200).json({
            message: "Slot updated successfully",
            slot: updated
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await availabilityService.deleteSlot(userId, req.params.id);

        return res.status(200).json({
            message: "Slot removed successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getProviderSlots,
    update,
    remove
};
