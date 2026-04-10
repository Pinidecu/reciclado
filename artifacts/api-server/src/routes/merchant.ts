import { Router } from "express";
import { db, productsTable, merchantProfilesTable, ordersTable, buyerProfilesTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { UpdateMerchantProfileBody, ValidateOrderBody, ListMerchantOrdersQueryParams } from "@workspace/api-zod";
import { formatMerchant } from "./auth.js";
import { formatProduct } from "./products.js";
import { formatOrder } from "./orders.js";

const router = Router();

router.get("/merchant/profile", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(404).json({ error: "Perfil de comercio no encontrado" });
    return;
  }
  res.json(formatMerchant(merchant));
});

router.patch("/merchant/profile", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const parsed = UpdateMerchantProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(404).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.businessName != null) updates.businessName = d.businessName;
  if (d.legalName !== undefined) updates.legalName = d.legalName;
  if (d.cuit !== undefined) updates.cuit = d.cuit;
  if (d.category != null) updates.category = d.category;
  if (d.description !== undefined) updates.description = d.description;
  if (d.phone != null) updates.phone = d.phone;
  if (d.addressLine != null) updates.addressLine = d.addressLine;
  if (d.city != null) updates.city = d.city;
  if (d.province != null) updates.province = d.province;
  if (d.postalCode !== undefined) updates.postalCode = d.postalCode;
  if (d.latitude !== undefined) updates.latitude = d.latitude != null ? String(d.latitude) : null;
  if (d.longitude !== undefined) updates.longitude = d.longitude != null ? String(d.longitude) : null;
  if (d.pickupHours !== undefined) updates.pickupHours = d.pickupHours;
  if (d.logoUrl !== undefined) updates.logoUrl = d.logoUrl;
  if (d.isOpen != null) updates.isOpen = d.isOpen;

  const [updated] = await db.update(merchantProfilesTable).set(updates).where(eq(merchantProfilesTable.id, merchant.id)).returning();
  res.json(formatMerchant(updated));
});

router.get("/merchant/products", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const products = await db.select().from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.merchantId, merchant.id)));

  const formatted = products
    .filter(r => r.product_categories)
    .map(r => formatProduct(r.products, merchant, r.product_categories!));

  res.json(formatted);
});

router.get("/merchant/orders", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const qp = ListMerchantOrdersQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const conditions = [eq(ordersTable.merchantId, merchant.id)];
  if (params.status) {
    conditions.push(eq(ordersTable.paymentStatus, params.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED"));
  }

  const orders = await db.select().from(ordersTable)
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(buyerProfilesTable, eq(ordersTable.buyerId, buyerProfilesTable.id))
    .where(and(...conditions))
    .orderBy(ordersTable.createdAt);

  const formatted = orders
    .filter(r => r.products && r.product_categories && r.buyer_profiles)
    .map(r => formatOrder(r.orders, r.products!, r.product_categories!, merchant, r.buyer_profiles!));

  res.json(formatted);
});

router.post("/merchant/orders/validate", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const parsed = ValidateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.pickupCode, parsed.data.pickupCode), eq(ordersTable.merchantId, merchant.id)))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Orden no encontrada" });
    return;
  }

  if (order.paymentStatus !== "PAID") {
    res.status(400).json({ error: "La orden no está pagada aún" });
    return;
  }

  if (order.deliveryStatus === "DELIVERED") {
    res.status(400).json({ error: "La orden ya fue entregada" });
    return;
  }

  if (order.deliveryStatus === "CANCELLED") {
    res.status(400).json({ error: "La orden fue cancelada" });
    return;
  }

  const [updated] = await db.update(ordersTable).set({
    deliveryStatus: "DELIVERED",
    deliveredAt: new Date(),
  }).where(eq(ordersTable.id, order.id)).returning();

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId)).limit(1);
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product!.categoryId)).limit(1);
  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.id, order.buyerId)).limit(1);

  res.json(formatOrder(updated, product!, category!, merchant, buyer!));
});

router.get("/merchant/stats", authenticate, requireRole("MERCHANT"), async (req, res): Promise<void> => {
  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, req.user!.userId)).limit(1);
  if (!merchant) {
    res.status(403).json({ error: "Perfil de comercio no encontrado" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    soldOutProducts,
    ordersToday,
    ordersMonth,
    pendingPickup,
    delivered,
  ] = await Promise.all([
    db.select({ count: count() }).from(productsTable).where(and(eq(productsTable.merchantId, merchant.id))),
    db.select({ count: count() }).from(productsTable).where(and(eq(productsTable.merchantId, merchant.id), eq(productsTable.status, "AVAILABLE"))),
    db.select({ count: count() }).from(productsTable).where(and(eq(productsTable.merchantId, merchant.id), eq(productsTable.status, "SOLD_OUT"))),
    db.select({ total: sql<number>`sum(total)`, cnt: count() }).from(ordersTable).where(and(eq(ordersTable.merchantId, merchant.id), eq(ordersTable.paymentStatus, "PAID"), gte(ordersTable.createdAt, today))),
    db.select({ total: sql<number>`sum(total)`, cnt: count() }).from(ordersTable).where(and(eq(ordersTable.merchantId, merchant.id), eq(ordersTable.paymentStatus, "PAID"), gte(ordersTable.createdAt, firstOfMonth))),
    db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.merchantId, merchant.id), eq(ordersTable.paymentStatus, "PAID"), eq(ordersTable.deliveryStatus, "READY"))),
    db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.merchantId, merchant.id), eq(ordersTable.deliveryStatus, "DELIVERED"))),
  ]);

  const revenueToday = Number(ordersToday[0]?.total ?? 0);
  const revenueMonth = Number(ordersMonth[0]?.total ?? 0);
  const MERCHANT_FEE_RATE = 0.05;

  res.json({
    totalProducts: Number(totalProducts[0]?.count ?? 0),
    activeProducts: Number(activeProducts[0]?.count ?? 0),
    soldOutProducts: Number(soldOutProducts[0]?.count ?? 0),
    totalOrdersToday: Number(ordersToday[0]?.cnt ?? 0),
    totalOrdersMonth: Number(ordersMonth[0]?.cnt ?? 0),
    revenueToday,
    revenueMonth,
    pendingPickup: Number(pendingPickup[0]?.count ?? 0),
    delivered: Number(delivered[0]?.count ?? 0),
    platformCommission: revenueMonth * MERCHANT_FEE_RATE,
  });
});

export default router;
