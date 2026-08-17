CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Customer" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "address" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE "Admin" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "ServiceCategory" (
    "id" SERIAL PRIMARY KEY,
    "categoryName" TEXT UNIQUE NOT NULL,
    "description" TEXT
);

CREATE TABLE "ServiceProvider" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "categoryId" INTEGER NOT NULL REFERENCES "ServiceCategory"("id"),
    "bio" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availability" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Service" (
    "id" SERIAL PRIMARY KEY,
    "providerId" INTEGER NOT NULL REFERENCES "ServiceProvider"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AvailabilitySlot" (
    "id" SERIAL PRIMARY KEY,
    "providerId" INTEGER NOT NULL REFERENCES "ServiceProvider"("id") ON DELETE CASCADE,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Booking" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL REFERENCES "Customer"("id"),
    "providerId" INTEGER NOT NULL REFERENCES "ServiceProvider"("id"),
    "serviceId" INTEGER REFERENCES "Service"("id"),
    "slotId" INTEGER,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Payment" (
    "id" SERIAL PRIMARY KEY,
    "bookingId" INTEGER UNIQUE NOT NULL REFERENCES "Booking"("id"),
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Review" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL REFERENCES "Customer"("id"),
    "bookingId" INTEGER UNIQUE NOT NULL REFERENCES "Booking"("id"),
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Notification" (
    "id" SERIAL PRIMARY KEY,
    "bookingId" INTEGER UNIQUE NOT NULL REFERENCES "Booking"("id"),
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
    "id" SERIAL PRIMARY KEY,
    "adminId" INTEGER NOT NULL REFERENCES "Admin"("id"),
    "actionType" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EmailOTP" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PasswordResetToken" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
