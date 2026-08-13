const { z } = require("zod");

const createBookingSchema = z.object({
    providerId: z.number().int().positive("Provider ID is required"),
    serviceId: z.number().int().positive().optional(),
    slotId: z.number().int().positive().optional(),
    serviceDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid service date" }),
    location: z.string().trim().min(5, "Location address must be at least 5 characters")
});

const updateBookingStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"])
});

module.exports = {
    createBookingSchema,
    updateBookingStatusSchema
};
