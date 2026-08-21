-- CreateEnum
CREATE TYPE "CatalogAttributeType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAttribute" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "CatalogAttributeType" NOT NULL DEFAULT 'TEXT',
    "unit" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" INTEGER,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItemAttributeValue" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "CatalogItemAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_isActive_order_idx" ON "Category"("isActive", "order");
CREATE UNIQUE INDEX "CategoryAttribute_categoryId_key_key" ON "CategoryAttribute"("categoryId", "key");
CREATE INDEX "CategoryAttribute_categoryId_order_idx" ON "CategoryAttribute"("categoryId", "order");
CREATE UNIQUE INDEX "CatalogItem_categoryId_name_key" ON "CatalogItem"("categoryId", "name");
CREATE INDEX "CatalogItem_categoryId_isActive_order_idx" ON "CatalogItem"("categoryId", "isActive", "order");
CREATE UNIQUE INDEX "CatalogItemAttributeValue_itemId_attributeId_key" ON "CatalogItemAttributeValue"("itemId", "attributeId");
CREATE INDEX "CatalogItemAttributeValue_attributeId_idx" ON "CatalogItemAttributeValue"("attributeId");

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CatalogItemAttributeValue" ADD CONSTRAINT "CatalogItemAttributeValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogItemAttributeValue" ADD CONSTRAINT "CatalogItemAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "CategoryAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the initial component taxonomy and a deliberately small attribute set.
INSERT INTO "Category" ("id", "name", "slug", "description", "order", "isActive", "updatedAt") VALUES
('cat-piedras-naturales', 'Piedras naturales', 'piedras-naturales', 'Piedras pulidas, facetadas o en formas irregulares.', 10, true, CURRENT_TIMESTAMP),
('cat-cristales-roca', 'Cristales de roca', 'cristales-de-roca', 'Cristales y cuentas facetadas para pulseras y collares.', 20, true, CURRENT_TIMESTAMP),
('cat-mostacillas', 'Mostacillas', 'mostacillas', 'Mostacillas y mostacillones de distintos tamaños y acabados.', 30, true, CURRENT_TIMESTAMP),
('cat-dijes', 'Dijes', 'dijes', 'Dijes, conectores y piezas centrales.', 40, true, CURRENT_TIMESTAMP),
('cat-separadores', 'Separadores', 'separadores', 'Piezas para separar y ordenar cuentas.', 50, true, CURRENT_TIMESTAMP),
('cat-cadenas', 'Cadenas', 'cadenas', 'Cadenas por tramo o por metro.', 60, true, CURRENT_TIMESTAMP),
('cat-hilos', 'Hilos', 'hilos', 'Hilos y cordones para el armado.', 70, true, CURRENT_TIMESTAMP),
('cat-tanza', 'Tanza', 'tanza', 'Tanzas de nylon, elásticas o de acero recubierto.', 80, true, CURRENT_TIMESTAMP),
('cat-mosquetones', 'Mosquetones', 'mosquetones', 'Cierres y mosquetones para terminaciones.', 90, true, CURRENT_TIMESTAMP);

INSERT INTO "CategoryAttribute" ("id", "categoryId", "name", "key", "type", "unit", "isRequired", "options", "order", "updatedAt") VALUES
('attr-pn-medida', 'cat-piedras-naturales', 'Medida', 'medida', 'NUMBER', 'mm', true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-pn-forma', 'cat-piedras-naturales', 'Forma', 'forma', 'SELECT', NULL, false, ARRAY['Redonda', 'Chips', 'Irregular', 'Gota'], 20, CURRENT_TIMESTAMP),
('attr-pn-color', 'cat-piedras-naturales', 'Color', 'color', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-pn-acabado', 'cat-piedras-naturales', 'Acabado', 'acabado', 'SELECT', NULL, false, ARRAY['Natural', 'Pulido', 'Facetado'], 40, CURRENT_TIMESTAMP),
('attr-cr-medida', 'cat-cristales-roca', 'Medida', 'medida', 'NUMBER', 'mm', true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-cr-forma', 'cat-cristales-roca', 'Forma', 'forma', 'SELECT', NULL, false, ARRAY['Redondo', 'Rondelle', 'Bicono', 'Gota'], 20, CURRENT_TIMESTAMP),
('attr-cr-color', 'cat-cristales-roca', 'Color', 'color', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-cr-acabado', 'cat-cristales-roca', 'Acabado', 'acabado', 'SELECT', NULL, false, ARRAY['Facetado', 'Liso', 'AB'], 40, CURRENT_TIMESTAMP),
('attr-mo-tipo', 'cat-mostacillas', 'Tipo', 'tipo', 'SELECT', NULL, true, ARRAY['Mostacilla', 'Mostacillón'], 10, CURRENT_TIMESTAMP),
('attr-mo-medida', 'cat-mostacillas', 'Medida', 'medida', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-mo-color', 'cat-mostacillas', 'Color', 'color', 'TEXT', NULL, true, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-mo-acabado', 'cat-mostacillas', 'Acabado', 'acabado', 'SELECT', NULL, false, ARRAY['Opaco', 'Translúcido', 'Metalizado', 'Perlado'], 40, CURRENT_TIMESTAMP),
('attr-di-material', 'cat-dijes', 'Material', 'material', 'TEXT', NULL, true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-di-medida', 'cat-dijes', 'Medida aproximada', 'medida', 'TEXT', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-di-motivo', 'cat-dijes', 'Forma o motivo', 'motivo', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-di-union', 'cat-dijes', 'Tipo de unión', 'tipo-de-union', 'SELECT', NULL, false, ARRAY['Argolla', 'Conector', 'Perforado'], 40, CURRENT_TIMESTAMP),
('attr-se-material', 'cat-separadores', 'Material', 'material', 'TEXT', NULL, true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-se-medida', 'cat-separadores', 'Medida', 'medida', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-se-acabado', 'cat-separadores', 'Acabado', 'acabado', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-se-perforacion', 'cat-separadores', 'Perforación', 'perforacion', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 40, CURRENT_TIMESTAMP),
('attr-ca-material', 'cat-cadenas', 'Material', 'material', 'TEXT', NULL, true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-ca-ancho', 'cat-cadenas', 'Ancho', 'ancho', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-ca-eslabon', 'cat-cadenas', 'Tipo de eslabón', 'tipo-de-eslabon', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-ca-unidad', 'cat-cadenas', 'Unidad de venta', 'unidad-de-venta', 'SELECT', NULL, false, ARRAY['Metro', 'Rollo', 'Tramo'], 40, CURRENT_TIMESTAMP),
('attr-hi-material', 'cat-hilos', 'Material', 'material', 'SELECT', NULL, true, ARRAY['Encerado', 'Chino', 'Nylon', 'Elástico', 'Gamuza', 'Algodón'], 10, CURRENT_TIMESTAMP),
('attr-hi-grosor', 'cat-hilos', 'Grosor', 'grosor', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-hi-color', 'cat-hilos', 'Color', 'color', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-hi-largo', 'cat-hilos', 'Largo', 'largo', 'NUMBER', 'm', false, ARRAY[]::TEXT[], 40, CURRENT_TIMESTAMP),
('attr-ta-tipo', 'cat-tanza', 'Tipo', 'tipo', 'SELECT', NULL, true, ARRAY['Nylon', 'Elástica', 'Acero recubierto'], 10, CURRENT_TIMESTAMP),
('attr-ta-grosor', 'cat-tanza', 'Grosor', 'grosor', 'NUMBER', 'mm', false, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-ta-color', 'cat-tanza', 'Color', 'color', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-ta-largo', 'cat-tanza', 'Largo', 'largo', 'NUMBER', 'm', false, ARRAY[]::TEXT[], 40, CURRENT_TIMESTAMP),
('attr-mq-material', 'cat-mosquetones', 'Material', 'material', 'TEXT', NULL, true, ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP),
('attr-mq-medida', 'cat-mosquetones', 'Medida', 'medida', 'NUMBER', 'mm', true, ARRAY[]::TEXT[], 20, CURRENT_TIMESTAMP),
('attr-mq-acabado', 'cat-mosquetones', 'Acabado', 'acabado', 'TEXT', NULL, false, ARRAY[]::TEXT[], 30, CURRENT_TIMESTAMP),
('attr-mq-tipo', 'cat-mosquetones', 'Tipo', 'tipo', 'SELECT', NULL, false, ARRAY['Clásico', 'Perico', 'Llavero'], 40, CURRENT_TIMESTAMP);
