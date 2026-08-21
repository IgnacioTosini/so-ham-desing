-- Catalog items describe components used by finished products; they are not sold individually.
DROP INDEX IF EXISTS "CatalogItem_categoryId_isActive_order_idx";

ALTER TABLE "CatalogItem"
    DROP COLUMN "price",
    DROP COLUMN "stock",
    DROP COLUMN "order";

CREATE INDEX "CatalogItem_categoryId_isActive_idx" ON "CatalogItem"("categoryId", "isActive");

-- Remove attributes that describe wholesale presentation instead of the component itself.
DELETE FROM "CatalogItemAttributeValue"
WHERE "attributeId" IN ('attr-ca-unidad', 'attr-hi-largo', 'attr-ta-largo');

DELETE FROM "CategoryAttribute"
WHERE "id" IN ('attr-ca-unidad', 'attr-hi-largo', 'attr-ta-largo');
