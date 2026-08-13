const prisma = require("../../config/prisma");

const createService = async (userId, serviceData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile required to create services");
    }

    const service = await prisma.service.create({
        data: {
            providerId: provider.id,
            title: serviceData.title,
            description: serviceData.description,
            price: serviceData.price,
            durationMinutes: serviceData.durationMinutes || 60,
            images: serviceData.images || []
        }
    });

    return service;
};

const getProviderServices = async (providerId) => {
    return prisma.service.findMany({
        where: {
            providerId: parseInt(providerId),
            isActive: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const getAllServices = async (queryParams = {}) => {
    const { categoryId, minPrice, maxPrice, search } = queryParams;

    const whereClause = {
        isActive: true,
        ...(minPrice || maxPrice ? {
            price: {
                ...(minPrice && { gte: parseFloat(minPrice) }),
                ...(maxPrice && { lte: parseFloat(maxPrice) })
            }
        } : {}),
        ...(search && {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
            ]
        }),
        ...(categoryId && {
            provider: { categoryId: parseInt(categoryId) }
        })
    };

    return prisma.service.findMany({
        where: whereClause,
        include: {
            provider: {
                include: {
                    user: { select: { name: true, phone: true } },
                    category: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

const updateService = async (userId, serviceId, serviceData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    const id = parseInt(serviceId);
    const existing = await prisma.service.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw new Error("Service not found or unauthorized");
    }

    return prisma.service.update({
        where: { id },
        data: serviceData
    });
};

const deleteService = async (userId, serviceId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    const id = parseInt(serviceId);
    const existing = await prisma.service.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw new Error("Service not found or unauthorized");
    }

    // Soft delete by setting isActive to false
    return prisma.service.update({
        where: { id },
        data: { isActive: false }
    });
};

module.exports = {
    createService,
    getProviderServices,
    getAllServices,
    updateService,
    deleteService
};
