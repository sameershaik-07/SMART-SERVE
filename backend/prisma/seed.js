require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
    console.log("🌱 Starting SMART-SERVE Database Seed...");

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 1. Seed Service Categories (the 8 marketplace categories)
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

    const homeServicesCat = createdCategories["Home Services"];
    const repairsCat = createdCategories["Repairs"];

    // 2. Seed Admin User
    console.log("--> Seeding Admin User...");
    await prisma.user.upsert({
        where: { email: "admin@smartserve.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@smartserve.com",
            password: hashedPassword,
            phone: "+91 99988 87770",
            role: "ADMIN",
            isEmailVerified: true,
            admin: {
                create: {}
            }
        }
    });

    // 3. Seed Verified Service Provider User
    console.log("--> Seeding Verified Service Provider User...");
    const providerUser = await prisma.user.upsert({
        where: { email: "provider@smartserve.com" },
        update: {},
        create: {
            name: "CoolTech Certified Pro",
            email: "provider@smartserve.com",
            password: hashedPassword,
            phone: "+91 98765 43210",
            role: "PROVIDER",
            isEmailVerified: true,
            provider: {
                create: {
                    categoryId: repairsCat.id,
                    verified: true,
                    rating: 4.9,
                    availability: true,
                    address: "ServiceHub Hub, Market Road, Macherla, Andhra Pradesh 522426",
                    bio: "Certified HVAC & home appliance maintenance specialist with 8+ years experience."
                }
            }
        },
        include: { provider: true }
    });

    // Seed Services for this provider if none exist
    const existingServices = await prisma.service.findMany({
        where: { providerId: providerUser.provider.id }
    });

    if (existingServices.length === 0) {
        console.log("--> Seeding Provider Services...");
        await prisma.service.createMany({
            data: [
                {
                    providerId: providerUser.provider.id,
                    title: "AC Repair & Deep Cleaning Service",
                    description: "Complete indoor and outdoor unit jet-cleaning, gas pressure check, cooling coil inspection and thorough antibacterial sanitization.",
                    price: 599.0,
                    durationMinutes: 60,
                    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"],
                    isActive: true
                },
                {
                    providerId: providerUser.provider.id,
                    title: "Refrigerator Inspection & Gas Refill",
                    description: "Comprehensive compressor diagnostic, thermostat temperature regulation, seal check, and eco-friendly gas recharging.",
                    price: 799.0,
                    durationMinutes: 90,
                    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"],
                    isActive: true
                }
            ]
        });
    }

    // Seed Availability Slots for the provider (upcoming dates)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const slotTimes = [
        { startTime: "09:00 AM", endTime: "10:30 AM" },
        { startTime: "10:30 AM", endTime: "12:00 PM" },
        { startTime: "02:00 PM", endTime: "03:30 PM" },
        { startTime: "04:00 PM", endTime: "05:30 PM" }
    ];

    for (const slot of slotTimes) {
        const slotDate = new Date(tomorrow);
        slotDate.setHours(0, 0, 0, 0);

        const exists = await prisma.availabilitySlot.findFirst({
            where: {
                providerId: providerUser.provider.id,
                date: slotDate,
                startTime: slot.startTime
            }
        });

        if (!exists) {
            await prisma.availabilitySlot.create({
                data: {
                    providerId: providerUser.provider.id,
                    date: slotDate,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isBooked: false
                }
            });
        }
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
            phone: "+91 91234 56789",
            role: "CUSTOMER",
            isEmailVerified: true,
            customer: {
                create: {
                    address: "123 Main Street, Suite 400, Macherla, Andhra Pradesh 522426",
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
