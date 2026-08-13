const prisma = require("../../config/prisma");

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

const verifyProvider = async (userId, providerId) => {
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
        throw new Error("Admin profile required for verification action");
    }

    const id = parseInt(providerId);

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
        throw new Error("Admin profile required");
    }

    const id = parseInt(providerId);

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
        throw new Error("Admin profile required");
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
    return prisma.serviceCategory.update({
        where: { id },
        data
    });
};

const deleteCategory = async (categoryId) => {
    const id = parseInt(categoryId);
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
    const [totalUsers, totalCustomers, totalProviders, totalBookings, successfulPayments] = await Promise.all([
        prisma.user.count(),
        prisma.customer.count(),
        prisma.serviceProvider.count(),
        prisma.booking.count(),
        prisma.payment.findMany({ where: { status: "SUCCESS" } })
    ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalBookings,
        totalRevenue
    };
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
    verifyProvider,
    rejectProvider,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getAnalyticsOverview,
    getAuditLogs
};
