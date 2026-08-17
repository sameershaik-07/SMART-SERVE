require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
    console.log("🌱 Starting SMART-SERVE Database Seed...");

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 1. Seed Service Categories
    console.log("--> Seeding Categories...");
    const cleaningCategory = await prisma.serviceCategory.upsert({
        where: { categoryName: "Home Cleaning" },
        update: {},
        create: {
            categoryName: "Home Cleaning",
            description: "Deep house cleaning, kitchen & bathroom sanitization"
        }
    });

    const plumbingCategory = await prisma.serviceCategory.upsert({
        where: { categoryName: "Plumbing" },
        update: {},
        create: {
            categoryName: "Plumbing",
            description: "Pipe leak repairs, drain unblocking, faucet installation"
        }
    });

    const electricalCategory = await prisma.serviceCategory.upsert({
        where: { categoryName: "Electrical" },
        update: {},
        create: {
            categoryName: "Electrical",
            description: "Wiring, switchboard fixes, fixture installations"
        }
    });

    // 2. Seed Admin User
    console.log("--> Seeding Admin User...");
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@smartserve.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@smartserve.com",
            password: hashedPassword,
            phone: "+1999888777",
            role: "ADMIN",
            isEmailVerified: true,
            admin: {
                create: {}
            }
        }
    });

    // 3. Seed Provider User
    console.log("--> Seeding Service Provider...");
    const providerUser = await prisma.user.upsert({
        where: { email: "provider@smartserve.com" },
        update: {},
        create: {
            name: "Alex Pro Services",
            email: "provider@smartserve.com",
            password: hashedPassword,
            phone: "+1555444333",
            role: "PROVIDER",
            isEmailVerified: true,
            provider: {
                create: {
                    categoryId: cleaningCategory.id,
                    bio: "Top rated professional home cleaning service with 5+ years experience.",
                    verified: true,
                    rating: 4.8,
                    availability: true
                }
            }
        },
        include: { provider: true }
    });

    // Seed Services for Provider
    if (providerUser.provider) {
        console.log("--> Seeding Services...");
        const existingService = await prisma.service.findFirst({
            where: { providerId: providerUser.provider.id, title: "Full House Deep Clean" }
        });

        if (!existingService) {
            await prisma.service.create({
                data: {
                    providerId: providerUser.provider.id,
                    title: "Full House Deep Clean",
                    description: "Complete 3-bedroom house deep sanitization and dusting.",
                    price: 1499.0,
                    durationMinutes: 120,
                    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952"]
                }
            });
        }

        // Seed Availability Slots
        console.log("--> Seeding Availability Slots...");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await prisma.availabilitySlot.createMany({
            data: [
                {
                    providerId: providerUser.provider.id,
                    date: tomorrow,
                    startTime: "09:00",
                    endTime: "11:00",
                    isBooked: false
                },
                {
                    providerId: providerUser.provider.id,
                    date: tomorrow,
                    startTime: "14:00",
                    endTime: "16:00",
                    isBooked: false
                }
            ],
            skipDuplicates: true
        });
    }

    // 4. Seed Customer User
    console.log("--> Seeding Customer User...");
    await prisma.user.upsert({
        where: { email: "customer@smartserve.com" },
        update: {},
        create: {
            name: "John Customer",
            email: "customer@smartserve.com",
            password: hashedPassword,
            phone: "+1222333444",
            role: "CUSTOMER",
            isEmailVerified: true,
            customer: {
                create: {
                    address: "123 Main Street, Suite 400",
                    walletBalance: 2500.0
                }
            }
        }
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("-----------------------------------------");
    console.log("🔑 Test Credentials:");
    console.log("ADMIN:    email: admin@smartserve.com    / password: Password123!");
    console.log("PROVIDER: email: provider@smartserve.com / password: Password123!");
    console.log("CUSTOMER: email: customer@smartserve.com / password: Password123!");
    console.log("-----------------------------------------");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
