-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('CAR', 'HOUSE', 'GENERIC');

-- CreateEnum
CREATE TYPE "MaintenanceRuleType" AS ENUM ('DISTANCE', 'TIME', 'DISTANCE_OR_TIME');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'ALEXA', 'OCR', 'IMPORT');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metadata" JSONB,
    "visualKind" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceComponent" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ruleType" "MaintenanceRuleType" NOT NULL,
    "intervalKm" INTEGER,
    "intervalDays" INTEGER,
    "warningKm" INTEGER,
    "warningDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceEvent" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mileageKm" INTEGER,
    "notes" TEXT,
    "cost" DOUBLE PRECISION,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "itemId" TEXT,
    "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL',
    "receiptImageUrl" TEXT,
    "externalRef" TEXT,
    "recurringRuleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringRule" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "itemId" TEXT,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportMerchantRule" (
    "id" TEXT NOT NULL,
    "matchText" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportMerchantRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "subdivisionCode" TEXT,
    "subdivisionName" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceAnchor" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "amount" DOUBLE PRECISION NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyBalance" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseLine" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_categoryId_name_key" ON "Subcategory"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");

-- CreateIndex
CREATE INDEX "MaintenanceComponent_itemId_idx" ON "MaintenanceComponent"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceEvent_transactionId_key" ON "MaintenanceEvent"("transactionId");

-- CreateIndex
CREATE INDEX "MaintenanceEvent_componentId_idx" ON "MaintenanceEvent"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_externalRef_key" ON "Transaction"("externalRef");

-- CreateIndex
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- CreateIndex
CREATE INDEX "Transaction_itemId_idx" ON "Transaction"("itemId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_recurringRuleId_idx" ON "Transaction"("recurringRuleId");

-- CreateIndex
CREATE INDEX "RecurringRule_categoryId_idx" ON "RecurringRule"("categoryId");

-- CreateIndex
CREATE INDEX "RecurringRule_nextRunDate_idx" ON "RecurringRule"("nextRunDate");

-- CreateIndex
CREATE UNIQUE INDEX "ImportMerchantRule_matchText_key" ON "ImportMerchantRule"("matchText");

-- CreateIndex
CREATE INDEX "Trip_countryCode_idx" ON "Trip"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalance_month_key" ON "MonthlyBalance"("month");

-- CreateIndex
CREATE INDEX "ExpenseLine_transactionId_idx" ON "ExpenseLine"("transactionId");

-- CreateIndex
CREATE INDEX "ExpenseLine_productName_idx" ON "ExpenseLine"("productName");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceComponent" ADD CONSTRAINT "MaintenanceComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceEvent" ADD CONSTRAINT "MaintenanceEvent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MaintenanceComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceEvent" ADD CONSTRAINT "MaintenanceEvent_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "RecurringRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringRule" ADD CONSTRAINT "RecurringRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringRule" ADD CONSTRAINT "RecurringRule_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringRule" ADD CONSTRAINT "RecurringRule_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportMerchantRule" ADD CONSTRAINT "ImportMerchantRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportMerchantRule" ADD CONSTRAINT "ImportMerchantRule_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseLine" ADD CONSTRAINT "ExpenseLine_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
