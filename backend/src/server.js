const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
initSocket(server);

server.listen(PORT, () => {
    console.log(`🚀 SMART-SERVE Backend running on http://localhost:${PORT}`);
    console.log(`⚡ Socket.io gateway initialized on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down SMART-SERVE backend...`);
    server.close(async () => {
        console.log("HTTP & Socket.io servers closed.");
        try {
            await prisma.$disconnect();
            console.log("Prisma PostgreSQL connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error during database disconnection:", err);
            process.exit(1);
        }
    });

    // Force shutdown if cleanup hangs
    setTimeout(() => {
        console.error("Shutdown timed out, forcefully exiting.");
        process.exit(1);
    }, 5000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
