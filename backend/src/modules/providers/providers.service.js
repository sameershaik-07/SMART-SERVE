const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

const formatProviderResponse = (provider, reviewCount = 0, jobsCompleted = 0) => {
    if (!provider) return null;
    const categoryName = provider.category?.categoryName || "General Services";

    return {
        ...provider,
        name: provider.user?.name || "Verified Professional",
        categoryName,
        category: provider.category
            ? {
                  ...provider.category,
                  name: provider.category.categoryName
              }
            : { name: categoryName, categoryName },
        location: provider.address || provider.user?.address || "Macherla, Andhra Pradesh",
        reviewCount: reviewCount || (provider.bookings ? provider.bookings.filter(b => b.review).length : 0),
        jobsCompleted: jobsCompleted || (provider.bookings ? provider.bookings.filter(b => b.status === "COMPLETED").length : 0)
    };
};

const listProviders = async (queryParams) => {
    const { search, categoryId, minRating, verified, page = 1, limit = 10 } = queryParams;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // By default, list verified providers for customer discovery unless explicitly filtered
    const isVerified = verified !== undefined ? verified === "true" || verified === true : true;

    const whereClause = {
        ...(isVerified && { verified: true }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(minRating && { rating: { gte: parseFloat(minRating) } }),
        ...(search && {
            OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { bio: { contains: search, mode: "insensitive" } },
                { category: { categoryName: { contains: search, mode: "insensitive" } } }
            ]
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
                },
                bookings: {
                    select: { id: true, status: true, review: { select: { id: true } } }
                }
            },
            skip,
            take: limitNum,
            orderBy: [{ rating: "desc" }, { id: "asc" }]
        }),
        prisma.serviceProvider.count({ where: whereClause })
    ]);

    const formattedProviders = providers.map((p) => {
        const reviewCount = p.bookings?.filter(b => b.review).length || 0;
        const jobsCompleted = p.bookings?.filter(b => b.status === "COMPLETED").length || 0;
        const { bookings, ...rest } = p;
        return formatProviderResponse(rest, reviewCount, jobsCompleted);
    });

    return {
        providers: formattedProviders,
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
    if (isNaN(providerId)) {
        throw ApiError.badRequest("Invalid provider ID");
    }

    const provider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true }
            },
            category: true,
            services: { where: { isActive: true } },
            availabilitySlots: {
                where: {
                    isBooked: false,
                    date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                },
                orderBy: [{ date: "asc" }, { startTime: "asc" }]
            }
        }
    });

    if (!provider) {
        throw ApiError.notFound("Service provider not found");
    }

    const [completedBookings, reviews] = await Promise.all([
        prisma.booking.count({ where: { providerId, status: "COMPLETED" } }),
        prisma.review.count({ where: { booking: { providerId } } })
    ]);

    return formatProviderResponse(provider, reviews, completedBookings);
};

const updateProviderProfile = async (userId, data) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
    }

    const updated = await prisma.serviceProvider.update({
        where: { userId },
        data: {
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.documents && { documents: data.documents }),
            ...(data.availability !== undefined && { availability: data.availability }),
            ...(data.address !== undefined && { address: data.address })
        },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            category: true
        }
    });

    return formatProviderResponse(updated);
};

const getProviderDashboardStats = async (userId) => {
    const provider = await prisma.serviceProvider.findUnique({
        where: { userId }
    });

    if (!provider) {
        throw ApiError.notFound("Provider profile not found");
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
