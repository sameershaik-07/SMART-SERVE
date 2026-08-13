const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");

const getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            customer: true,
            provider: {
                include: {
                    category: true
                }
            },
            admin: true
        }
    });

    if (!user) {
        throw new Error("User profile not found");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const updateUserProfile = async (userId, data) => {
    const { name, phone, address } = data;

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(phone && { phone })
        },
        include: {
            customer: true,
            provider: true
        }
    });

    if (address && user.role === "CUSTOMER" && user.customer) {
        await prisma.customer.update({
            where: { userId },
            data: { address }
        });
    }

    return getUserProfile(userId);
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return { message: "Password updated successfully" };
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword
};
