import { pgTable, text, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const merchantProfilesTable = pgTable("merchant_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  businessName: text("business_name").notNull(),
  legalName: text("legal_name"),
  cuit: text("cuit"),
  category: text("category").notNull(),
  description: text("description"),
  phone: text("phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  pickupHours: text("pickup_hours"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  isOpen: boolean("is_open").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMerchantProfileSchema = createInsertSchema(merchantProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMerchantProfile = z.infer<typeof insertMerchantProfileSchema>;
export type MerchantProfile = typeof merchantProfilesTable.$inferSelect;
