-- CreateTable
CREATE TABLE "MonthlyBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalance_month_key" ON "MonthlyBalance"("month");
