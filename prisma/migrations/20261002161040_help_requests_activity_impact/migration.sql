-- CreateEnum
CREATE TYPE "HelpKind" AS ENUM ('SOS', 'WIDOW', 'OTHER');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "category" TEXT,
ADD COLUMN     "impact" JSONB;

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "kind" "HelpKind" NOT NULL DEFAULT 'SOS',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "nature" TEXT NOT NULL,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);
