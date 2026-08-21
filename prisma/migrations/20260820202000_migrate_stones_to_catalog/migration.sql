-- Preserve the legacy energy information as an optional category attribute.
INSERT INTO "CategoryAttribute" (
    "id",
    "categoryId",
    "name",
    "key",
    "type",
    "unit",
    "isRequired",
    "options",
    "order",
    "createdAt",
    "updatedAt"
)
VALUES (
    'attr-pn-energias',
    'cat-piedras-naturales',
    'Etiquetas de energía',
    'etiquetas-de-energia',
    'TEXT',
    NULL,
    false,
    ARRAY[]::TEXT[],
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Copy each legacy stone into the new catalog without removing or changing Stone.
-- Reusing the legacy id makes the migration traceable and avoids duplicate copies.
INSERT INTO "CatalogItem" (
    "id",
    "categoryId",
    "name",
    "description",
    "imageUrl",
    "price",
    "stock",
    "isActive",
    "order",
    "createdAt",
    "updatedAt"
)
SELECT
    stone."id",
    'cat-piedras-naturales',
    stone."name",
    stone."description",
    stone."imageUrl",
    NULL,
    NULL,
    true,
    ROW_NUMBER() OVER (ORDER BY stone."name")::INTEGER * 10,
    stone."createdAt",
    stone."updatedAt"
FROM "Stone" AS stone
ON CONFLICT DO NOTHING;

-- Copy the existing energy tags into the new dynamic attribute when present.
INSERT INTO "CatalogItemAttributeValue" (
    "id",
    "itemId",
    "attributeId",
    "value"
)
SELECT
    'energy-' || stone."id",
    stone."id",
    'attr-pn-energias',
    array_to_string(stone."energyTags", ', ')
FROM "Stone" AS stone
INNER JOIN "CatalogItem" AS item ON item."id" = stone."id"
WHERE cardinality(stone."energyTags") > 0
ON CONFLICT DO NOTHING;
