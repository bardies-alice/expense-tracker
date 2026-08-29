-- CreateTable
CREATE TABLE "BalanceAnchor" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "amount" REAL NOT NULL,
    "asOfDate" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
