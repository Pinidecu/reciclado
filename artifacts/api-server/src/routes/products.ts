import { Router } from "express";
import { db, productsTable, merchantProfilesTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { CreateProductBody, UpdateProductBody, ListProductsQueryParams, GetProductParams } from "@workspace/api-zod";
import { formatMerchant } from "./auth.js";

const router = Router();

function makeSlug(name: string): string {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();
}

function formatProduct(p: typeof productsTable.$inferSelect, merchant: typeof merchantProfilesTable.$inferSelect, category: typeof categoriesTable.$inferSelect) {
  const original = parseFloat(p.originalPrice);
  const sale = parseFloat(p.salePrice);
  const discount = original > 0 ? Math.round(((original - sale) / original) * 100) : 0;
  return {
    id: p.id,
    merchantId: p.merchantId,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    originalPrice: original,
    salePrice: sale,
    discountPercent: discount,
    quantityAvailable: p.quantityAvailable,
    unit: p.unit ?? null,
    expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
    pickupDeadline: p.pickupDeadline ? p.pickupDeadline.toISOString() : null,
    pickupAddress: p.pickupAddress ?? null,
    pickupLatitude: p.pickupLatitude ? parseFloat(p.pickupLatitude) : null,
    pickupLongitude: p.pickupLongitude ? parseFloat(p.pickupLongitude) : null,
    status: p.status,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    merchant: formatMerchant(merchant),
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon ?? null,
      isActive: category.isActive,
    },
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const qp = ListProductsQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(productsTable.status, "AVAILABLE")];
  if (params.search) {
    conditions.push(ilike(productsTable.name, `%${params.search}%`));
  }
  if (params.categoryId) {
    conditions.push(eq(productsTable.categoryId, params.categoryId));
  }
  if (params.minPrice != null) {
    conditions.push(gte(productsTable.salePrice, String(params.minPrice)));
  }
  if (params.maxPrice != null) {
    conditions.push(lte(productsTable.salePrice, String(params.maxPrice)));
  }
  if (params.featured) {
    conditions.push(eq(productsTable.isFeatured, true));
  }

  const [countResult, products] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(and(...conditions)),
    db.select().from(productsTable)
      .leftJoin(merchantProfilesTable, eq(productsTable.merchantId, merchantProfilesTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(productsTable.isFeatured, productsTable.createdAt),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const formatted = products.filter(r => r.merchant_profiles && r.product_categories).map(r => formatProduct(r.products, r.merchant_profiles!, r.product_categories!));

  res.json({ products: formatted, total, page, limit });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await db.select().from(productsTable)
    .leftJoin(merchantProfilesTable, eq(productsTable.merchantId, merchantProfilesTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id))
    .limit(1);

  const row = result[0];
  if (!row || !row.merchant_profiles || !row.product_categories) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  res.json(formatProduct(row.products, row.merchant_profiles, row.product_categories));
});

router.post("/products", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, parsed.data.categoryId)).limit(1);
  if (!category) {
    res.status(400).json({ error: "Categoría inválida" });
    return;
  }

  const slug = makeSlug(parsed.data.name);
  const [product] = await db.insert(productsTable).values({
    merchantId: merchant.id,
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    originalPrice: String(parsed.data.originalPrice),
    salePrice: String(parsed.data.salePrice),
    quantityAvailable: parsed.data.quantityAvailable,
    unit: parsed.data.unit ?? null,
    expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
    pickupDeadline: parsed.data.pickupDeadline ? new Date(parsed.data.pickupDeadline) : null,
    pickupAddress: parsed.data.pickupAddress ?? merchant.addressLine,
    pickupLatitude: parsed.data.pickupLatitude ? String(parsed.data.pickupLatitude) : merchant.latitude,
    pickupLongitude: parsed.data.pickupLongitude ? String(parsed.data.pickupLongitude) : merchant.longitude,
    isFeatured: parsed.data.isFeatured ?? false,
    status: (parsed.data.status as "DRAFT" | "AVAILABLE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DELETED") ?? "AVAILABLE",
    publishedAt: new Date(),
  }).returning();

  res.status(201).json(formatProduct(product, merchant, category));
});

router.patch("/products/:id", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(and(eq(productsTable.id, params.data.id), eq(productsTable.merchantId, merchant.id))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name != null) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.categoryId != null) updates.categoryId = parsed.data.categoryId;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.originalPrice != null) updates.originalPrice = String(parsed.data.originalPrice);
  if (parsed.data.salePrice != null) updates.salePrice = String(parsed.data.salePrice);
  if (parsed.data.quantityAvailable != null) updates.quantityAvailable = parsed.data.quantityAvailable;
  if (parsed.data.unit !== undefined) updates.unit = parsed.data.unit;
  if (parsed.data.expiryDate !== undefined) updates.expiryDate = parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null;
  if (parsed.data.pickupDeadline !== undefined) updates.pickupDeadline = parsed.data.pickupDeadline ? new Date(parsed.data.pickupDeadline) : null;
  if (parsed.data.pickupAddress !== undefined) updates.pickupAddress = parsed.data.pickupAddress;
  if (parsed.data.pickupLatitude !== undefined) updates.pickupLatitude = parsed.data.pickupLatitude ? String(parsed.data.pickupLatitude) : null;
  if (parsed.data.pickupLongitude !== undefined) updates.pickupLongitude = parsed.data.pickupLongitude ? String(parsed.data.pickupLongitude) : null;
  if (parsed.data.isFeatured != null) updates.isFeatured = parsed.data.isFeatured;
  if (parsed.data.status != null) updates.status = parsed.data.status;

  const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, existing.id)).returning();

  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, updated.categoryId)).limit(1);
  res.json(formatProduct(updated, merchant, category!));
});

router.delete("/products/:id", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(and(eq(productsTable.id, params.data.id), eq(productsTable.merchantId, merchant.id))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  await db.update(productsTable).set({ status: "DELETED" }).where(eq(productsTable.id, existing.id));
  res.sendStatus(204);
});

export { formatProduct };
export default router;
