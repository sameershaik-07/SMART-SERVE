const { z } = require("zod");

// Accepts both "14:30" (24-hr) and "02:30 PM" or "2:30 PM" (12-hr with AM/PM)
const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)(\s?(AM|PM|am|pm))?$/i;

const createSlotSchema = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date string" }),
    startTime: z.string().trim().regex(timeRegex, "Time format must be HH:MM or HH:MM AM/PM"),
    endTime: z.string().trim().regex(timeRegex, "Time format must be HH:MM or HH:MM AM/PM")
});

const updateSlotSchema = z.object({
    isBooked: z.boolean().optional(),
    startTime: z.string().trim().regex(timeRegex).optional(),
    endTime: z.string().trim().regex(timeRegex).optional()
});

module.exports = {
    createSlotSchema,
    updateSlotSchema
};
