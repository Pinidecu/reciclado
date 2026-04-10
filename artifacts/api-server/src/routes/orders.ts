import { Router } from "express";
import { db, ordersTable, productsTable, merchantProfilesTable, buyerProfilesTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { CreateOrderBody, GetOrderParams, ListBuyerOrdersQueryParams } from "@workspace/api-zod";
import { formatMerchant, formatBuyer } from "./auth.js";
import { formatProduct } from "./products.js";

const router = Router();

const BUYER_FEE_RATE = 0.05;
const MERCHANT_FEE_RATE = 0.05;

function generatePickupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatOrder(
  o: typeof ordersTable.$inferSelect,
  p: typeof productsTable.$inferSelect,
  cat: typeof categoriesTable.$inferSelect,
  m: typeof merchantProfilesTable.$inferSelect,
  b: typeof buyerProfilesTable.$inferSelect,
) {
  return {
    id: o.id,
    buyerId: o.buyerId,
    productId: o.productId,
    merchantId: o.merchantId,
    quantity: o.quantity,
    unitPrice: parseFloat(o.unitPrice),
    subtotal: parseFloat(o.subtotal),
    buyerFee: parseFloat(o.buyerFee),
    merchantFee: parseFloat(o.merchantFee),
    total: parseFloat(o.total),
    paymentStatus: o.paymentStatus,
    deliveryStatus: o.deliveryStatus,
    qrCode: o.qrCode,
    pickupCode: o.pickupCode,
    deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null,
    cancelledAt: o.cancelledAt ? o.cancelledAt.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
    product: formatProduct(p, m, cat),
    merchant: formatMerchant(m),
    buyer: formatBuyer(b),
  };
}

router.post("/orders", authenticate, requireRole("BUYER"), async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, req.user!.userId)).limit(1);
  if (!buyer) {
    res.status(403).json({ error: "Perfil de comprador no encontrado" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }

  if (product.status !== "AVAILABLE") {
    res.status(400).json({ error: "El producto no está disponible" });
    return;
  }

  if (product.quantityAvailable < parsed.data.quantity) {
    res.status(400).json({ error: "Stock insuficiente" });
    return;
  }

  const unitPrice = parseFloat(product.salePrice);
  const subtotal = unitPrice * parsed.data.quantity;
  const buyerFee = Math.round(subtotal * BUYER_FEE_RATE * 100) / 100;
  const merchantFee = Math.round(subtotal * MERCHANT_FEE_RATE * 100) / 100;
  const total = subtotal + buyerFee;

  const pickupCode = generatePickupCode();
  const qrCode = `RA-${pickupCode}-${Date.now()}`;

  const [order] = await db.insert(ordersTable).values({
    buyerId: buyer.id,
    productId: product.id,
    merchantId: product.merchantId,
    quantity: parsed.data.quantity,
    unitPrice: String(unitPrice),
    subtotal: String(subtotal),
    buyerFee: String(buyerFee),
    merchantFee: String(merchantFee),
    total: String(total),
    paymentStatus: "PENDING",
    deliveryStatus: "PENDING",
    qrCode,
    pickupCode,
  }).returning();

  await db.update(productsTable).set({
    quantityAvailable: product.quantityAvailable - parsed.data.quantity,
    status: product.quantityAvailable - parsed.data.quantity <= 0 ? "SOLD_OUT" : "AVAILABLE",
  }).where(eq(productsTable.id, product.id));

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.id, product.merchantId)).limit(1);
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);

  res.status(201).json(formatOrder(order, product, category!, merchant!, buyer));
});

router.get("/orders/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Orden no encontrada" });
    return;
  }

  const userId = req.user!.userId;
  const role = req.user!.role;

  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, userId)).limit(1);
  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, userId)).limit(1);

  if (role === "BUYER" && buyer && order.buyerId !== buyer.id) {
    res.status(403).json({ error: "No autorizado" });
    return;
  }
  if (role === "MERCHANT" && merchant && order.merchantId !== merchant.id) {
    res.status(403).json({ error: "No autorizado" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, order.productId)).limit(1);
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product!.categoryId)).limit(1);
  const [orderMerchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.id, order.merchantId)).limit(1);
  const [orderBuyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.id, order.buyerId)).limit(1);

  res.json(formatOrder(order, product!, category!, orderMerchant!, orderBuyer!));
});

router.post("/orders/:id/pay", authenticate, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Orden no encontrada" });
    return;
  }

  if (order.paymentStatus === "PAID") {
    res.status(400).json({ error: "La orden ya está pagada" });
    return;
  }

  if (order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED") {
    res.status(400).json({ error: "Estado de pago inválido" });
    return;
  }

  // Mock payment — mark as paid immediately
  await db.update(ordersTable).set({
    paymentStatus: "PAID",
    deliveryStatus: "READY",
  }).where(eq(ordersTable.id, order.id));

  res.json({
    orderId: order.id,
    paymentUrl: null,
    isMock: true,
    message: "MODO DEMO: Pago simulado exitosamente. No se realizó ningún cobro real.",
  });
});

router.get("/buyer/orders", authenticate, requireRole("BUYER"), async (req, res): Promise<void> => {
  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, req.user!.userId)).limit(1);
  if (!buyer) {
    res.status(403).json({ error: "Perfil de comprador no encontrado" });
    return;
  }

  const qp = ListBuyerOrdersQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const conditions = [eq(ordersTable.buyerId, buyer.id)];

  const orders = await db.select().from(ordersTable)
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(merchantProfilesTable, eq(ordersTable.merchantId, merchantProfilesTable.id))
    .where(and(...conditions))
    .orderBy(ordersTable.createdAt);

  const formatted = orders
    .filter(r => r.products && r.product_categories && r.merchant_profiles)
    .map(r => formatOrder(r.orders, r.products!, r.product_categories!, r.merchant_profiles!, buyer));

  res.json(formatted);
});

router.get("/buyer/profile", authenticate, requireRole("BUYER"), async (req, res): Promise<void> => {
  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, req.user!.userId)).limit(1);
  if (!buyer) {
    res.status(404).json({ error: "Perfil de comprador no encontrado" });
    return;
  }
  res.json(formatBuyer(buyer));
});

router.patch("/buyer/profile", authenticate, requireRole("BUYER"), async (req, res): Promise<void> => {
  const { UpdateBuyerProfileBody } = await import("@workspace/api-zod");
  const parsed = UpdateBuyerProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, req.user!.userId)).limit(1);
  if (!buyer) {
    res.status(404).json({ error: "Perfil de comprador no encontrado" });
    return;
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.firstName != null) updates.firstName = d.firstName;
  if (d.lastName != null) updates.lastName = d.lastName;
  if (d.phone != null) updates.phone = d.phone;
  if (d.addressLine !== undefined) updates.addressLine = d.addressLine;
  if (d.city !== undefined) updates.city = d.city;
  if (d.province !== undefined) updates.province = d.province;
  if (d.latitude !== undefined) updates.latitude = d.latitude != null ? String(d.latitude) : null;
  if (d.longitude !== undefined) updates.longitude = d.longitude != null ? String(d.longitude) : null;

  const [updated] = await db.update(buyerProfilesTable).set(updates).where(eq(buyerProfilesTable.id, buyer.id)).returning();
  res.json(formatBuyer(updated));
});

export default router;
