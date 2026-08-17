const prisma = require("../../config/prisma");

const createSlot = async (userId, slotData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
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
        throw new Error("An availability slot for this date and time already exists.");
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
    return prisma.availabilitySlot.findMany({
        where: {
            providerId: parseInt(providerId),
            isBooked: false,
            date: { gte: new Date() }
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });
};

const updateSlot = async (userId, slotId, updateData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    const id = parseInt(slotId);
    const existing = await prisma.availabilitySlot.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw new Error("Slot not found or unauthorized");
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
        throw new Error("Provider profile not found");
    }

    const id = parseInt(slotId);
    const existing = await prisma.availabilitySlot.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw new Error("Slot not found or unauthorized");
    }

    if (existing.isBooked) {
        throw new Error("Cannot delete a slot that is already booked.");
    }

    return prisma.availabilitySlot.delete({
        where: { id }
    });
};

module.exports = {
    createSlot,
    getProviderSlots,
    updateSlot,
    deleteSlot
};
