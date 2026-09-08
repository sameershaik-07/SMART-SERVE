const { z } = require("zod");

const createBookingSchema = z.object({
    providerId: z.number().int().positive("Provider ID is required"),
    serviceId: z.number().int().positive().optional(),
    slotId: z.number().int().positive().optional(),
    serviceDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid service date" }),
    location: z.string().trim().min(3, "Location address must be at least 3 characters"),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

const updateBookingStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"])
});

module.exports = {
    createBookingSchema,
    updateBookingStatusSchema
};
