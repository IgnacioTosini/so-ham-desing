-- Categories need a simulator behavior so structural pieces are not treated as beads.
CREATE TYPE "CatalogCategoryRole" AS ENUM ('BEAD', 'CHARM', 'BASE', 'CLASP');

ALTER TABLE "Category"
ADD COLUMN "role" "CatalogCategoryRole" NOT NULL DEFAULT 'BEAD';

UPDATE "Category" SET "role" = 'CHARM' WHERE "id" = 'cat-dijes';
UPDATE "Category" SET "role" = 'BASE' WHERE "id" IN ('cat-cadenas', 'cat-hilos', 'cat-tanza');
UPDATE "Category" SET "role" = 'CLASP' WHERE "id" = 'cat-mosquetones';

-- Existing designs remain valid; new designs can also remember their base and clasp.
ALTER TABLE "SharedDesign"
ADD COLUMN "configuration" JSONB;
