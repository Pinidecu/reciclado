import { pgTable, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const buyerProfilesTable = pgTable("buyer_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBuyerProfileSchema = createInsertSchema(buyerProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBuyerProfile = z.infer<typeof insertBuyerProfileSchema>;
export type BuyerProfile = typeof buyerProfilesTable.$inferSelect;
