const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

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
        throw ApiError.forbidden("Provider profile required to create services");
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

const formatServiceResponse = (service) => {
    if (!service) return null;
    const categoryName = service.provider?.category?.categoryName || "Home Services";

    return {
        ...service,
        category: categoryName,
        categoryName,
        providerName: service.provider?.user?.name || "Verified Specialist",
        rating: service.provider?.rating || 4.8,
        reviewCount: 150, // default baseline for marketplace display
        image: service.images?.[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    };
};

const createService = async (userId, serviceData) => {
    const provider = await ensureProviderProfile(userId);

    if (serviceData.categoryId) {
        const category = await prisma.serviceCategory.findUnique({
            where: { id: parseInt(serviceData.categoryId) }
        });

        if (!category || !ALLOWED_MARKETPLACE_CATEGORY_NAMES.includes(category.categoryName)) {
            throw ApiError.badRequest("Please select one of the 8 valid marketplace categories before publishing.");
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
            price: parseFloat(serviceData.price),
            durationMinutes: serviceData.durationMinutes || 60,
            images: serviceData.images || []
        },
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    category: true
                }
            }
        }
    });

    return formatServiceResponse(service);
};

const getProviderServices = async (providerId) => {
    const services = await prisma.service.findMany({
        where: {
            providerId: parseInt(providerId),
            isActive: true
        },
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    category: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return services.map(formatServiceResponse);
};

const getAllServices = async (queryParams = {}) => {
    const { categoryId, minPrice, maxPrice, search } = queryParams;

    const providerFilter = {
        // Services shown if provider is active
        availability: true
    };

    if (categoryId) {
        providerFilter.categoryId = parseInt(categoryId);
    }

    const whereClause = {
        isActive: true,
        provider: {
            is: providerFilter
        },
        ...(minPrice || maxPrice ? {
            price: {
                ...(minPrice && { gte: parseFloat(minPrice) }),
                ...(maxPrice && { lte: parseFloat(maxPrice) })
            }
        } : {}),
        ...(search ? {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
            ]
        } : {})
    };

    const services = await prisma.service.findMany({
        where: whereClause,
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    category: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return services.map(formatServiceResponse);
};

const updateService = async (userId, serviceId, serviceData) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const id = parseInt(serviceId);
    const existing = await prisma.service.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw ApiError.notFound("Service not found or unauthorized");
    }

    const updated = await prisma.service.update({
        where: { id },
        data: {
            ...(serviceData.title && { title: serviceData.title }),
            ...(serviceData.description !== undefined && { description: serviceData.description }),
            ...(serviceData.price !== undefined && { price: parseFloat(serviceData.price) }),
            ...(serviceData.durationMinutes !== undefined && { durationMinutes: parseInt(serviceData.durationMinutes) }),
            ...(serviceData.images && { images: serviceData.images })
        },
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    category: true
                }
            }
        }
    });

    return formatServiceResponse(updated);
};

const deleteService = async (userId, serviceId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const id = parseInt(serviceId);
    const existing = await prisma.service.findFirst({
        where: { id, providerId: provider.id }
    });

    if (!existing) {
        throw ApiError.notFound("Service not found or unauthorized");
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
        throw ApiError.notFound("Provider profile required");
    }

    const services = await prisma.service.findMany({
        where: { providerId: provider.id },
        include: {
            provider: {
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    category: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return services.map(formatServiceResponse);
};

const getServiceById = async (serviceId) => {
    const id = parseInt(serviceId);
    if (isNaN(id)) return null;

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

    return formatServiceResponse(service);
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
