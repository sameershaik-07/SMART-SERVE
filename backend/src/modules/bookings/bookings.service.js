const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

const createBooking = async (userId, bookingData) => {
    const customer = await prisma.customer.findUnique({
        where: { userId }
    });

    if (!customer) {
        throw ApiError.badRequest("Customer profile not found. Only registered customers can make bookings.");
    }

    const { providerId, serviceId, slotId, serviceDate, location, latitude, longitude } = bookingData;

    // Verify provider exists
    const provider = await prisma.serviceProvider.findUnique({
        where: { id: providerId },
        include: { user: true }
    });

    if (!provider) {
        throw ApiError.notFound("Provider not found");
    }

    let totalPrice = 0;
    if (serviceId) {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            throw ApiError.notFound("Service not found");
        }
        if (service.providerId !== provider.id) {
            throw ApiError.badRequest("The selected service does not belong to this service provider");
        }
        totalPrice = service.price;
    }

    const dateObj = new Date(serviceDate);
    if (isNaN(dateObj.getTime())) {
        throw ApiError.badRequest("Invalid service date");
    }

    // Prevent double booking on slot if slotId provided
    if (slotId) {
        const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
        if (!slot || slot.isBooked || slot.providerId !== provider.id) {
            throw ApiError.conflict("Selected time slot is unavailable or already booked.");
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
                latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
                longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
                totalPrice,
                status: "PENDING"
            },
            include: {
                provider: {
                    include: { user: { select: { name: true, phone: true } }, category: true }
                },
                service: true
            }
        });

        // Generate in-app Notification
        await tx.notification.create({
            data: {
                bookingId: booking.id,
                message: `New booking request from customer #${customer.id} on ${dateObj.toLocaleDateString()}`,
                type: "BOOKING_CREATED"
            }
        });

        return booking;
    });
};

const getCustomerBookings = async (userId) => {
    const customer = await prisma.customer.findUnique({ where: { userId } });

    if (!customer) {
        throw ApiError.notFound("Customer profile not found");
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
        throw ApiError.notFound("Provider profile not found");
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
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

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
        throw ApiError.notFound("Booking not found");
    }

    // Role-based authorization check
    if (user.role === "CUSTOMER" && booking.customer.userId !== user.userId) {
        throw ApiError.forbidden("Unauthorized to view this booking");
    }
    if (user.role === "PROVIDER" && booking.provider.userId !== user.userId) {
        throw ApiError.forbidden("Unauthorized to view this booking");
    }

    let tracking = null;
    try {
        const mapService = require("../../services/map.service");
        tracking = await mapService.getBookingTracking(id, user);
    } catch (e) {
        // non-blocking fallback
    }

    return {
        ...booking,
        tracking
    };
};

const updateBookingStatus = async (user, bookingId, status) => {
    const id = parseInt(bookingId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: true,
            provider: true
        }
    });

    if (!booking) {
        throw ApiError.notFound("Booking not found");
    }

    // Role authorization check
    if (user.role === "PROVIDER" && booking.provider.userId !== user.userId) {
        throw ApiError.forbidden("Unauthorized to modify this booking");
    }

    if (user.role === "CUSTOMER" && booking.customer.userId !== user.userId) {
        throw ApiError.forbidden("Unauthorized to modify this booking");
    }

    // Immutable terminal states
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "REJECTED") {
        throw ApiError.badRequest(`Cannot modify booking in terminal status: ${booking.status}`);
    }

    // Role-specific permitted transitions
    if (user.role === "CUSTOMER") {
        if (status !== "CANCELLED") {
            throw ApiError.forbidden("Customers can only cancel bookings.");
        }
        const hoursDiff = (new Date(booking.serviceDate) - new Date()) / (1000 * 60 * 60);
        if (hoursDiff < 2) {
            throw ApiError.badRequest("Bookings cannot be cancelled less than 2 hours before scheduled service date.");
        }
    } else if (user.role === "PROVIDER") {
        const allowed = ["ACCEPTED", "REJECTED", "COMPLETED"];
        if (!allowed.includes(status)) {
            throw ApiError.badRequest(`Providers cannot transition booking to ${status}`);
        }
        if (booking.status === "PENDING" && status === "COMPLETED") {
            throw ApiError.badRequest("Booking must be accepted before it can be marked completed.");
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
                payment: true,
                provider: { include: { user: true } },
                customer: { include: { user: true } }
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

const updateBookingLocation = async (user, bookingId, locationData) => {
    const id = parseInt(bookingId);
    if (isNaN(id)) {
        throw ApiError.badRequest("Invalid booking ID");
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!booking) {
        throw ApiError.notFound("Booking not found");
    }

    if (user.role === "CUSTOMER" && booking.customer.userId !== user.userId) {
        throw ApiError.forbidden("Unauthorized to modify this booking's location");
    }

    if (user.role === "PROVIDER") {
        throw ApiError.forbidden("Providers cannot modify the customer's delivery destination");
    }

    const { location, latitude, longitude } = locationData;

    const updated = await prisma.booking.update({
        where: { id },
        data: {
            ...(location && { location }),
            ...(latitude !== undefined && latitude !== null && { latitude: parseFloat(latitude) }),
            ...(longitude !== undefined && longitude !== null && { longitude: parseFloat(longitude) })
        }
    });

    const mapService = require("../../services/map.service");
    const tracking = await mapService.getBookingTracking(id, user);

    return { booking: updated, tracking };
};

module.exports = {
    createBooking,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    updateBookingLocation
};
