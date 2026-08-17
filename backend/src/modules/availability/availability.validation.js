const { z } = require("zod");

const createSlotSchema = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date string" }),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:MM"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format must be HH:MM")
});

const updateSlotSchema = z.object({
    isBooked: z.boolean().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional()
});

module.exports = {
    createSlotSchema,
    updateSlotSchema
};
