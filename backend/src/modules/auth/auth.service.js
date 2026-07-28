const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma");

const registerUser = async (userData) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            role: userData.role
        }
    });

    // Create profile based on role
    if (user.role === "CUSTOMER") {

        await prisma.customer.create({
            data: {
                userId: user.id
            }
        });

    } else if (user.role === "PROVIDER") {

        await prisma.serviceProvider.create({
            data: {
                userId: user.id,
                categoryId: userData.categoryId
            }
        });

    } else if (user.role === "ADMIN") {

        await prisma.admin.create({
            data: {
                userId: user.id
            }
        });

    }

    // Remove password before returning
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
};

module.exports = {
    registerUser
};