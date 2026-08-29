-- Add nullable unique slug column to Item
ALTER TABLE "Item" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");
