-- Finished products can be composed of any catalog item, not only legacy stones.
CREATE TABLE "ProductCatalogItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "ProductCatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductCatalogItem_productId_itemId_key"
ON "ProductCatalogItem"("productId", "itemId");

CREATE INDEX "ProductCatalogItem_productId_idx"
ON "ProductCatalogItem"("productId");

CREATE INDEX "ProductCatalogItem_itemId_idx"
ON "ProductCatalogItem"("itemId");

ALTER TABLE "ProductCatalogItem"
ADD CONSTRAINT "ProductCatalogItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductCatalogItem"
ADD CONSTRAINT "ProductCatalogItem_itemId_fkey"
FOREIGN KEY ("itemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The stone-to-catalog migration reused Stone ids, so every valid historical
-- ProductStone relation can be carried over without recreating any data.
INSERT INTO "ProductCatalogItem" ("id", "productId", "itemId")
SELECT relation."id", relation."productId", relation."stoneId"
FROM "ProductStone" AS relation
INNER JOIN "CatalogItem" AS item ON item."id" = relation."stoneId"
ON CONFLICT ("productId", "itemId") DO NOTHING;
