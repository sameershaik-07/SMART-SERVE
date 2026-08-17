const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "Missing DATABASE_URL in backend/.env. Set it before starting the server."
    );
}

console.log("DATABASE_URL loaded: YES");

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error", "warn"]
});

module.exports = prisma;