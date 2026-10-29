const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

const getPendingProviders = async () => {
    return prisma.serviceProvider.findMany({
        where: { verified: false },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            category: true
        },
        orderBy: { id: "asc" }
    });
};

const getProviders = async () => {
    const providers = await prisma.serviceProvider.findMany({
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
            category: true,
            services: { select: { id: true, title: true, isActive: true } },
            bookings: { select: { id: true, status: true, review: { select: { id: true } } } }
        },
        orderBy: { user: { createdAt: "desc" } }
    });

    return providers.map((p) => ({
        ...p,
        name: p.user?.name || "Professional",
        categoryName: p.category?.categoryName || "General Services",
        reviewCount: p.bookings ? p.bookings.filter(b => b.review).length : 0,
        jobsCompleted: p.bookings ? p.bookings.filter(b => b.status === "COMPLETED").length : 0
    }));
};

const getUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isEmailVerified: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const verifyProvider = async (userId, providerId) => {
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
        throw ApiError.forbidden("Admin profile required for verification action");
    }

    const id = parseInt(providerId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid provider ID");
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.serviceProvider.update({
            where: { id },
            data: { verified: true }
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                actionType: "PROVIDER_VERIFIED",
                targetEntity: `ServiceProvider:${id}`,
                details: `Approved verification for provider id ${id}`
            }
        });

        return updated;
    });
};

const rejectProvider = async (userId, providerId, reason) => {
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
        throw ApiError.forbidden("Admin profile required");
    }

    const id = parseInt(providerId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid provider ID");
    }

    return prisma.$transaction(async (tx) => {
        const updated = await tx.serviceProvider.update({
            where: { id },
            data: { verified: false }
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                actionType: "PROVIDER_REJECTED",
                targetEntity: `ServiceProvider:${id}`,
                details: reason || "Verification rejected by admin"
            }
        });

        return updated;
    });
};

const createCategory = async (userId, data) => {
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
        throw ApiError.forbidden("Admin profile required");
    }

    return prisma.$transaction(async (tx) => {
        const category = await tx.serviceCategory.create({
            data: {
                categoryName: data.categoryName,
                description: data.description
            }
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                actionType: "CATEGORY_CREATED",
                targetEntity: `ServiceCategory:${category.id}`,
                details: `Created category: ${category.categoryName}`
            }
        });

        return category;
    });
};

const updateCategory = async (categoryId, data) => {
    const id = parseInt(categoryId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid category ID");
    }

    return prisma.serviceCategory.update({
        where: { id },
        data
    });
};

const deleteCategory = async (categoryId) => {
    const id = parseInt(categoryId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid category ID");
    }

    return prisma.serviceCategory.delete({
        where: { id }
    });
};

const getCategories = async () => {
    return prisma.serviceCategory.findMany({
        orderBy: { categoryName: "asc" }
    });
};

const getAnalyticsOverview = async () => {
    const [
        totalUsers,
        totalCustomers,
        totalProviders,
        activeProviders,
        pendingVerifications,
        totalBookings,
        successfulPayments
    ] = await Promise.all([
        prisma.user.count(),
        prisma.customer.count(),
        prisma.serviceProvider.count(),
        prisma.serviceProvider.count({ where: { verified: true } }),
        prisma.serviceProvider.count({ where: { verified: false } }),
        prisma.booking.count(),
        prisma.payment.findMany({ where: { status: "SUCCESS" } })
    ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
        totalUsers,
        totalCustomers,
        totalProviders,
        activeProviders,
        pendingVerifications,
        totalBookings,
        totalRevenue
    };
};

const getAnalyticsTrends = async (days = 7) => {
    const safeDays = Math.min(Math.max(parseInt(days) || 7, 1), 31);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (safeDays - 1));

    const [bookings, payments] = await Promise.all([
        prisma.booking.findMany({
            where: { createdAt: { gte: start } },
            select: { createdAt: true }
        }),
        prisma.payment.findMany({
            where: { status: "SUCCESS", createdAt: { gte: start } },
            select: { amount: true, createdAt: true }
        })
    ]);

    const dateKey = (value) => {
        const date = new Date(value);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const series = Array.from({ length: safeDays }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
            date: dateKey(date),
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            bookings: 0,
            revenue: 0
        };
    });
    const byDate = new Map(series.map((item) => [item.date, item]));

    bookings.forEach((booking) => {
        const bucket = byDate.get(dateKey(booking.createdAt));
        if (bucket) bucket.bookings += 1;
    });
    payments.forEach((payment) => {
        const bucket = byDate.get(dateKey(payment.createdAt));
        if (bucket) bucket.revenue += payment.amount;
    });

    return {
        days: safeDays,
        totalBookings: bookings.length,
        totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
        series
    };
};

const getBookings = async () => {
    return prisma.booking.findMany({
        include: {
            customer: {
                include: { user: { select: { name: true, email: true } } }
            },
            provider: {
                include: { user: { select: { name: true, email: true } } }
            },
            service: { select: { title: true } },
            payment: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const getAuditLogs = async () => {
    return prisma.auditLog.findMany({
        include: {
            admin: {
                include: {
                    user: { select: { name: true, email: true } }
                }
            }
        },
        orderBy: { timestamp: "desc" }
    });
};

module.exports = {
    getPendingProviders,
    getProviders,
    getUsers,
    verifyProvider,
    rejectProvider,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getAnalyticsOverview,
    getAnalyticsTrends,
    getBookings,
    getAuditLogs
};
