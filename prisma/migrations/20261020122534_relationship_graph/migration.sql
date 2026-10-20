-- CreateEnum
CREATE TYPE "ContactKind" AS ENUM ('TEAM', 'PAST_CLIENT', 'PARTNER', 'COMMUNITY', 'PERSON');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('COLLEAGUE', 'FRIEND', 'FORMER_CLIENT', 'BUSINESS', 'COMMUNITY', 'FAMILY', 'REFERRAL');

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "warmIntroPath" TEXT,
ADD COLUMN     "warmIntroReason" TEXT,
ADD COLUMN     "warmIntroScore" INTEGER;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ContactKind" NOT NULL DEFAULT 'PERSON',
    "org" TEXT,
    "role" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "prospectId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "RelationshipType" NOT NULL DEFAULT 'BUSINESS',
    "strength" INTEGER NOT NULL DEFAULT 50,
    "reason" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_kind_idx" ON "Contact"("kind");

-- CreateIndex
CREATE INDEX "Contact_prospectId_idx" ON "Contact"("prospectId");

-- CreateIndex
CREATE INDEX "Relationship_fromId_idx" ON "Relationship"("fromId");

-- CreateIndex
CREATE INDEX "Relationship_toId_idx" ON "Relationship"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_fromId_toId_key" ON "Relationship"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
