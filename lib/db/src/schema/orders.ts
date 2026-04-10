import { pgTable, text, timestamp, decimal, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["PENDING", "READY", "DELIVERED", "CANCELLED"]);

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  buyerId: text("buyer_id").notNull(),
  productId: text("product_id").notNull(),
  merchantId: text("merchant_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  buyerFee: decimal("buyer_fee", { precision: 12, scale: 2 }).notNull(),
  merchantFee: decimal("merchant_fee", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
  deliveryStatus: deliveryStatusEnum("delivery_status").notNull().default("PENDING"),
  qrCode: text("qr_code").notNull(),
  pickupCode: text("pickup_code").notNull().unique(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
