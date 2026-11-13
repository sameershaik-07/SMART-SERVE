-- Reconcile the migration history with the current Prisma schema.
--
-- Several schema changes were previously applied with `prisma db push` and
-- never captured as migrations, which made a fresh `prisma migrate deploy`
-- database unusable (for example, ServiceProvider.latitude/longitude).
-- This migration brings a migrated database in line with schema.prisma.

-- Required by the GIN trigram indexes on Service.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "AvailabilitySlot" ADD COLUMN     "endsAt" TIMESTAMPTZ(6),
ADD COLUMN     "startsAt" TIMESTAMPTZ(6),
ADD COLUMN     "timezone" TEXT DEFAULT 'Asia/Kolkata';

-- AlterTable
-- Convert the existing TEXT column in place so chat history is preserved.
ALTER TABLE "ChatMessage" ADD COLUMN     "attachments" JSONB DEFAULT '[]';
ALTER TABLE "ChatMessage" ALTER COLUMN "messageType" DROP DEFAULT;
ALTER TABLE "ChatMessage" ALTER COLUMN "messageType" TYPE "MessageType" USING ("messageType"::text::"MessageType");
ALTER TABLE "ChatMessage" ALTER COLUMN "messageType" SET DEFAULT 'TEXT'::"MessageType";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CancellationPolicy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "minHoursBefore" INTEGER NOT NULL DEFAULT 2,
    "refundPercent" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "raisedBy" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" SERIAL NOT NULL,
    "aggregate" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderVerification" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CancellationPolicy_name_key" ON "CancellationPolicy"("name");

-- CreateIndex
CREATE INDEX "Dispute_bookingId_idx" ON "Dispute"("bookingId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "OutboxEvent_processedAt_createdAt_idx" ON "OutboxEvent"("processedAt", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderVerification_providerId_idx" ON "ProviderVerification"("providerId");

-- CreateIndex
CREATE INDEX "ProviderVerification_status_idx" ON "ProviderVerification"("status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_providerId_startsAt_idx" ON "AvailabilitySlot"("providerId", "startsAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_id_idx" ON "ChatMessage"("conversationId", "id");

-- CreateIndex
CREATE INDEX "Conversation_bookingId_idx" ON "Conversation"("bookingId");

-- CreateIndex
CREATE INDEX "Conversation_customerId_updatedAt_idx" ON "Conversation"("customerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Conversation_providerId_updatedAt_idx" ON "Conversation"("providerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_customerId_providerId_bookingId_key" ON "Conversation"("customerId", "providerId", "bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Service_desc_trgm_idx" ON "Service" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Service_title_trgm_idx" ON "Service" USING GIN ("title" gin_trgm_ops);

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderVerification" ADD CONSTRAINT "ProviderVerification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
