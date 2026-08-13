const prisma = require("../../config/prisma");

const listProviders = async (queryParams) => {
    const { search, categoryId, minRating, page = 1, limit = 10 } = queryParams;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {
        verified: true, // List verified providers publicly by default
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(minRating && { rating: { gte: parseFloat(minRating) } }),
        ...(search && {
            user: {
                name: { contains: search, mode: "insensitive" }
            }
        })
    };

    const [providers, total] = await Promise.all([
        prisma.serviceProvider.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                category: true,
                services: {
                    where: { isActive: true }
                }
            },
            skip,
            take: limitNum
        }),
        prisma.serviceProvider.count({ where: whereClause })
    ]);

    return {
        providers,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        }
    };
};

const getProviderById = async (id) => {
    const providerId = parseInt(id);
    const provider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true }
            },
            category: true,
            services: { where: { isActive: true } },
            availabilitySlots: { where: { isBooked: false } }
        }
    });

    if (!provider) {
        throw new Error("Service provider not found");
    }

    return provider;
};

const updateProviderProfile = async (userId, data) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    const updated = await prisma.serviceProvider.update({
        where: { userId },
        data: {
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.documents && { documents: data.documents }),
            ...(data.availability !== undefined && { availability: data.availability })
        },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            category: true
        }
    });

    return updated;
};

const getProviderDashboardStats = async (userId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    const [totalBookings, completedBookings, pendingBookings, payments] = await Promise.all([
        prisma.booking.count({ where: { providerId: provider.id } }),
        prisma.booking.count({ where: { providerId: provider.id, status: "COMPLETED" } }),
        prisma.booking.count({ where: { providerId: provider.id, status: "PENDING" } }),
        prisma.payment.findMany({
            where: {
                booking: { providerId: provider.id, status: "COMPLETED" },
                status: "SUCCESS"
            }
        })
    ]);

    const totalEarnings = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
        providerId: provider.id,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalEarnings,
        averageRating: provider.rating,
        verified: provider.verified,
        availability: provider.availability
    };
};

module.exports = {
    listProviders,
    getProviderById,
    updateProviderProfile,
    getProviderDashboardStats
};
