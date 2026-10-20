-- CreateEnum
CREATE TYPE "DiscoverySource" AS ENUM ('SIMULATION', 'GOOGLE_PLACES', 'APOLLO', 'MANUAL');

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "discoveryRunId" TEXT,
ADD COLUMN     "isSimulated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DiscoveryRun" (
    "id" TEXT NOT NULL,
    "segment" "BusinessSegment" NOT NULL DEFAULT 'OTHER',
    "area" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minScore" INTEGER NOT NULL DEFAULT 0,
    "source" "DiscoverySource" NOT NULL DEFAULT 'SIMULATION',
    "candidatesFound" INTEGER NOT NULL DEFAULT 0,
    "duplicatesSkipped" INTEGER NOT NULL DEFAULT 0,
    "qualifiedCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscoveryRun_segment_idx" ON "DiscoveryRun"("segment");

-- CreateIndex
CREATE INDEX "DiscoveryRun_createdAt_idx" ON "DiscoveryRun"("createdAt");
