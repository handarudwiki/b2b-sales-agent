-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MARKETING', 'SALES', 'MANAGEMENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessSegment" AS ENUM ('NEW_BRAND', 'UMKM', 'BEAUTY_CLINIC', 'HERBAL_STORE', 'INFLUENCER', 'PRIVATE_LABEL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'MEETING_SCHEDULED', 'NOT_A_FIT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('UNQUALIFIED', 'EARLY_STAGE', 'QUALIFIED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED', 'FOLLOW_UP', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('WHATSAPP_SIMULATED', 'WHATSAPP', 'WEB');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('PROSPECT', 'AI', 'HUMAN');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('COMPANY_PROFILE', 'SERVICE_CATALOG', 'PROCESS', 'LEGALITY', 'FAQ', 'CLAIM_GUIDELINE');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "segment" "BusinessSegment" NOT NULL DEFAULT 'OTHER',
    "website" TEXT,
    "location" TEXT,
    "contactChannel" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "fitIndication" TEXT,
    "priorityScore" INTEGER,
    "scoreReason" TEXT,
    "dataSource" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "isIncomplete" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "dedupeKey" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectNote" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "channel" "ConversationChannel" NOT NULL DEFAULT 'WHATSAPP_SIMULATED',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "leadStatus" "LeadStatus" NOT NULL DEFAULT 'UNQUALIFIED',
    "productInterest" TEXT,
    "businessStage" TEXT,
    "targetMarket" TEXT,
    "developmentReadiness" TEXT,
    "timeline" TEXT,
    "budgetReadiness" TEXT,
    "decisionAuthority" TEXT,
    "needsSummary" TEXT,
    "handoffRequested" BOOLEAN NOT NULL DEFAULT false,
    "handoffReason" TEXT,
    "prospectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstResponseMs" INTEGER,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "groundedOnIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeEntry" (
    "id" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL DEFAULT 'FAQ',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "prospectId" TEXT,
    "conversationId" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "segment" "BusinessSegment" NOT NULL DEFAULT 'OTHER',
    "goal" TEXT,
    "body" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "headings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faqPairs" JSONB,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "geoScore" INTEGER,
    "claimsValidated" BOOLEAN NOT NULL DEFAULT false,
    "claimNotes" TEXT,
    "authorId" TEXT,
    "reviewerId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "attributedLeads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "detail" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_dedupeKey_key" ON "Prospect"("dedupeKey");

-- CreateIndex
CREATE INDEX "Prospect_segment_idx" ON "Prospect"("segment");

-- CreateIndex
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");

-- CreateIndex
CREATE INDEX "ProspectNote_prospectId_idx" ON "ProspectNote"("prospectId");

-- CreateIndex
CREATE INDEX "Conversation_leadStatus_idx" ON "Conversation"("leadStatus");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "KnowledgeEntry_category_idx" ON "KnowledgeEntry"("category");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "Content"("status");

-- CreateIndex
CREATE INDEX "Content_segment_idx" ON "Content"("segment");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectNote" ADD CONSTRAINT "ProspectNote_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectNote" ADD CONSTRAINT "ProspectNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
