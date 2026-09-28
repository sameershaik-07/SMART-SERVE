const prisma = require("../../config/prisma");

const ALLOWED_MARKETPLACE_CATEGORY_NAMES = [
    "Home Services",
    "Repairs",
    "Beauty",
    "Automotive",
    "Tutors",
    "Health & Wellness",
    "Events",
    "Pet Care"
];

const ensureProviderProfile = async (userId) => {
    let provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (provider) return provider;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user || user.role !== "PROVIDER") {
        throw new Error("Provider profile required to create services");
    }

    const fallbackCategory = await prisma.serviceCategory.findFirst({
        where: { categoryName: { in: ALLOWED_MARKETPLACE_CATEGORY_NAMES } }
    });

    provider = await prisma.serviceProvider.create({
        data: {
            userId,
            categoryId: fallbackCategory?.id || 1,
            verified: false,
            availability: true,
            bio: "Provider profile created automatically. Please update your profile details."
        }
    });

    return provider;
};

const createService = async (userId, serviceData) => {
    const provider = await ensureProviderProfile(userId);

    // Restrict service publication to the official 8 marketplace categories required by the UI.
    if (serviceData.categoryId) {
        const category = await prisma.serviceCategory.findUnique({
            where: { id: parseInt(serviceData.categoryId) }
        });

        if (!category || !ALLOWED_MARKETPLACE_CATEGORY_NAMES.includes(category.categoryName)) {
            throw new Error("Please select one of the 8 marketplace categories before publishing.");
        }

        await prisma.serviceProvider.update({
            where: { id: provider.id },
            data: { categoryId: parseInt(serviceData.categoryId) }
        });
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
        provider: {
            is: {
                verified: true,
                user: {
                    is: {
                        isEmailVerified: true
                    }
                }
            }
        },
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
            provider: {
                is: {
                    verified: true,
                    categoryId: parseInt(categoryId)
                }
            }
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

const getMyServices = async (userId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile required");
    }

    return prisma.service.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" }
    });
};

const getServiceById = async (serviceId) => {
    const id = parseInt(serviceId);
    const service = await prisma.service.findFirst({
        where: { id, isActive: true },
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true, email: true } },
                    category: true
                }
            }
        }
    });
    return service; // null if not found
};

module.exports = {
    createService,
    getProviderServices,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
    getMyServices
};
