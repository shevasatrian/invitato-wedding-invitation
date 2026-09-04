-- CreateEnum
CREATE TYPE "Attendance" AS ENUM ('ATTENDING', 'NOT_ATTENDING');

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "guestName" VARCHAR(80) NOT NULL,
    "attendance" "Attendance" NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rsvp_createdAt_idx" ON "Rsvp"("createdAt");

-- CreateIndex
CREATE INDEX "Wish_createdAt_idx" ON "Wish"("createdAt" DESC);
