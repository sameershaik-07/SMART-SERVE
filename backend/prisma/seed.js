require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
    console.log("🌱 Starting SMART-SERVE Database Seed...");

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 1. Seed Service Categories (ensure the marketplace defaults exist)
    console.log("--> Seeding Categories...");
    const defaultCategories = [
        { categoryName: "Home Services", description: "Deep cleaning, plumbing, painting & home maintenance" },
        { categoryName: "Repairs", description: "AC, refrigerator, washing machine & appliance repair" },
        { categoryName: "Beauty", description: "Salon at home, skincare, spa massage & grooming" },
        { categoryName: "Automotive", description: "Car servicing, detailing, tyre care & roadside help" },
        { categoryName: "Tutors", description: "Academic tutoring, test preparation & skill coaching" },
        { categoryName: "Health & Wellness", description: "Fitness, yoga, physiotherapy & personal wellness" },
        { categoryName: "Events", description: "Photography, decoration, catering & event support" },
        { categoryName: "Pet Care", description: "Pet grooming, walking, training & veterinary support" }
    ];

    const createdCategories = {};
    for (const cat of defaultCategories) {
        const record = await prisma.serviceCategory.upsert({
            where: { categoryName: cat.categoryName },
            update: {},
            create: cat
        });
        createdCategories[cat.categoryName] = record;
    }
    // pick a sensible default category for provider seeding
    const cleaningCategory = createdCategories['Home Services'];

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

    // 3. Skip demo provider seeding to prevent fake services in the marketplace.
    // Real providers must be created by signing up or through admin approval.

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
