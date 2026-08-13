const prisma = require("../../config/prisma");

const createBooking = async (userId, bookingData) => {
    const customer = await prisma.customer.findUnique({
        where: { userId }
    });

    if (!customer) {
        throw new Error("Customer profile not found. Only registered customers can make bookings.");
    }

    const { providerId, serviceId, slotId, serviceDate, location } = bookingData;

    // Verify provider exists and is verified
    const provider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: { user: true }
    });

    if (!provider) {
        throw new Error("Provider not found");
    }

    let totalPrice = 0;
    if (serviceId) {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (service) {
            totalPrice = service.price;
        }
    }

    const dateObj = new Date(serviceDate);

    // Prevent double booking on slot if slotId provided
    if (slotId) {
        const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
        if (!slot || slot.isBooked) {
            throw new Error("Selected time slot is unavailable or already booked.");
        }
    }

    // Execute in transaction: create booking and mark slot booked if slotId provided
    return prisma.$transaction(async (tx) => {
        if (slotId) {
            await tx.availabilitySlot.update({
                where: { id: slotId },
                data: { isBooked: true }
            });
        }

        const booking = await tx.booking.create({
            data: {
                customerId: customer.id,
                providerId: provider.id,
                serviceId: serviceId || null,
                slotId: slotId || null,
                serviceDate: dateObj,
                location,
                totalPrice,
                status: "PENDING"
            },
            include: {
                provider: {
                    include: { user: { select: { name: true, phone: true } } }
                },
                service: true
            }
        });

        // Generate in-app Notification
        await tx.notification.create({
            data: {
                bookingId: booking.id,
                message: `New booking request from ${customer.id} for service on ${dateObj.toLocaleDateString()}`,
                type: "BOOKING_CREATED"
            }
        });

        return booking;
    });
};

const getCustomerBookings = async (userId) => {
    const customer = await prisma.customer.findUnique({ where: { userId } });

    if (!customer) {
        throw new Error("Customer profile not found");
    }

    return prisma.booking.findMany({
        where: { customerId: customer.id },
        include: {
            provider: {
                include: {
                    user: { select: { name: true, email: true, phone: true } },
                    category: true
                }
            },
            service: true,
            payment: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const getProviderBookings = async (userId) => {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId } });

    if (!provider) {
        throw new Error("Provider profile not found");
    }

    return prisma.booking.findMany({
        where: { providerId: provider.id },
        include: {
            customer: {
                include: {
                    user: { select: { name: true, email: true, phone: true } }
                }
            },
            service: true,
            payment: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const getBookingById = async (user, bookingId) => {
    const id = parseInt(bookingId);
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: { include: { user: true } },
            provider: { include: { user: true, category: true } },
            service: true,
            payment: true
        }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Role-based authorization check
    if (user.role === "CUSTOMER" && booking.customer.userId !== user.userId) {
        throw new Error("Unauthorized to view this booking");
    }
    if (user.role === "PROVIDER" && booking.provider.userId !== user.userId) {
        throw new Error("Unauthorized to view this booking");
    }

    return booking;
};

const updateBookingStatus = async (user, bookingId, status) => {
    const id = parseInt(bookingId);
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: true,
            provider: true
        }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // State machine & permission checks
    if (user.role === "PROVIDER" && booking.provider.userId !== user.userId) {
        throw new Error("Unauthorized to modify this booking");
    }

    if (user.role === "CUSTOMER" && booking.customer.userId !== user.userId) {
        throw new Error("Unauthorized to modify this booking");
    }

    // Cancellation policy check for customer (24 hour window recommendation)
    if (status === "CANCELLED" && user.role === "CUSTOMER") {
        const hoursDiff = (new Date(booking.serviceDate) - new Date()) / (1000 * 60 * 60);
        if (hoursDiff < 2) {
            throw new Error("Bookings cannot be cancelled less than 2 hours before scheduled service date.");
        }
    }

    return prisma.$transaction(async (tx) => {
        // If status cancelled or rejected, release slot if associated
        if ((status === "CANCELLED" || status === "REJECTED") && booking.slotId) {
            await tx.availabilitySlot.update({
                where: { id: booking.slotId },
                data: { isBooked: false }
            });
        }

        const updated = await tx.booking.update({
            where: { id },
            data: { status },
            include: {
                service: true,
                payment: true
            }
        });

        await tx.notification.create({
            data: {
                bookingId: id,
                message: `Booking #${id} status changed to ${status}`,
                type: `BOOKING_${status}`
            }
        });

        return updated;
    });
};

module.exports = {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus
};
