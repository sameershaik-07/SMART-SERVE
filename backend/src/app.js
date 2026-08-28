require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");

const reviewRoutes = require("./modules/review/review.routes");
const userRoutes = require("./modules/users/users.routes");
const providerRoutes = require("./modules/providers/providers.routes");
const serviceRoutes = require("./modules/services/services.routes");
const availabilityRoutes = require("./modules/availability/availability.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const errorHandler = require("./middlewares/error.middleware");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Welcome to SMART-SERVE Backend API",
        version: "1.0.0"
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use(errorHandler);



module.exports = app;
