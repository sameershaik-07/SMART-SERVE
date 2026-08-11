const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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


const loginUser = async (userData) => {

    const user = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Remove password before returning
    const { password, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token
    };
};


module.exports = {
    registerUser,
    loginUser
};