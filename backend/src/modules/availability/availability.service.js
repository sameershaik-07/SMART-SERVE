const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

const createSlot = async (userId, slotData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const dateObj = new Date(slotData.date);

    // Prevent duplicate slot for same provider date & start time
    const existing = await prisma.availabilitySlot.findFirst({
        where: {
            providerId: provider.id,
            date: dateObj,
            startTime: slotData.startTime
        }
    });

    if (existing) {
        throw ApiError.conflict("An availability slot for this date and time already exists.");
    }

    return prisma.availabilitySlot.create({
        data: {
            providerId: provider.id,
            date: dateObj,
            startTime: slotData.startTime,
            endTime: slotData.endTime
        }
    });
};

const getProviderSlots = async (providerId) => {
    const id = parseInt(providerId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid provider ID");
    }

    // Set to start of today so slots created for today are included
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return prisma.availabilitySlot.findMany({
        where: {
            providerId: id,
            isBooked: false,
            date: { gte: startOfToday }
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });
};

const updateSlot = async (userId, slotId, updateData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const id = parseInt(slotId);
    const existing = await prisma.availabilitySlot.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw ApiError.notFound("Slot not found or unauthorized");
    }

    return prisma.availabilitySlot.update({
        where: { id },
        data: updateData
    });
};

const deleteSlot = async (userId, slotId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const id = parseInt(slotId);
    const existing = await prisma.availabilitySlot.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw ApiError.notFound("Slot not found or unauthorized");
    }

    if (existing.isBooked) {
        throw ApiError.badRequest("Cannot delete a slot that is already booked.");
    }

    return prisma.availabilitySlot.delete({
        where: { id }
    });
};

const getMySlots = async (userId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    return prisma.availabilitySlot.findMany({
        where: { providerId: provider.id },
        orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });
};

module.exports = {
    createSlot,
    getProviderSlots,
    updateSlot,
    deleteSlot,
    getMySlots
};
