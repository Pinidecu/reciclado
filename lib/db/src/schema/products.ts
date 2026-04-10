import { pgTable, text, boolean, timestamp, decimal, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productStatusEnum = pgEnum("product_status", ["DRAFT", "AVAILABLE", "PAUSED", "SOLD_OUT", "EXPIRED", "DELETED"]);

export const productsTable = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  merchantId: text("merchant_id").notNull(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  originalPrice: decimal("original_price", { precision: 12, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 12, scale: 2 }).notNull(),
  quantityAvailable: integer("quantity_available").notNull().default(1),
  unit: text("unit"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  pickupDeadline: timestamp("pickup_deadline", { withTimezone: true }),
  pickupAddress: text("pickup_address"),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 7 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 10, scale: 7 }),
  status: productStatusEnum("status").notNull().default("AVAILABLE"),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
