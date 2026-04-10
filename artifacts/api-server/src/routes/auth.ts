import { Router } from "express";
import { db, usersTable, merchantProfilesTable, buyerProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken } from "../lib/auth.js";
import { authenticate } from "../middlewares/authenticate.js";
import { RegisterMerchantBody, RegisterBuyerBody, LoginBody } from "@workspace/api-zod";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect, merchant: typeof merchantProfilesTable.$inferSelect | null, buyer: typeof buyerProfilesTable.$inferSelect | null) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    merchantProfile: merchant ? formatMerchant(merchant) : null,
    buyerProfile: buyer ? formatBuyer(buyer) : null,
  };
}

function formatMerchant(m: typeof merchantProfilesTable.$inferSelect) {
  return {
    id: m.id,
    userId: m.userId,
    businessName: m.businessName,
    legalName: m.legalName ?? null,
    cuit: m.cuit ?? null,
    category: m.category,
    description: m.description ?? null,
    phone: m.phone,
    addressLine: m.addressLine,
    city: m.city,
    province: m.province,
    postalCode: m.postalCode ?? null,
    latitude: m.latitude ? parseFloat(m.latitude) : null,
    longitude: m.longitude ? parseFloat(m.longitude) : null,
    pickupHours: m.pickupHours ?? null,
    logoUrl: m.logoUrl ?? null,
    isVerified: m.isVerified,
    isOpen: m.isOpen,
    createdAt: m.createdAt.toISOString(),
  };
}

function formatBuyer(b: typeof buyerProfilesTable.$inferSelect) {
  return {
    id: b.id,
    userId: b.userId,
    firstName: b.firstName,
    lastName: b.lastName,
    phone: b.phone,
    addressLine: b.addressLine ?? null,
    city: b.city ?? null,
    province: b.province ?? null,
    latitude: b.latitude ? parseFloat(b.latitude) : null,
    longitude: b.longitude ? parseFloat(b.longitude) : null,
    createdAt: b.createdAt.toISOString(),
  };
}

router.post("/auth/register/merchant", async (req, res): Promise<void> => {
  const parsed = RegisterMerchantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, businessName, legalName, cuit, category, phone, addressLine, city, province, postalCode, latitude, longitude, description, pickupHours } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "El email ya está registrado" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, role: "MERCHANT" }).returning();

  const [merchant] = await db.insert(merchantProfilesTable).values({
    userId: user.id,
    businessName,
    legalName: legalName ?? null,
    cuit: cuit ?? null,
    category,
    phone,
    addressLine,
    city,
    province,
    postalCode: postalCode ?? null,
    latitude: latitude ? String(latitude) : null,
    longitude: longitude ? String(longitude) : null,
    description: description ?? null,
    pickupHours: pickupHours ?? null,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: formatUser(user, merchant, null) });
});

router.post("/auth/register/buyer", async (req, res): Promise<void> => {
  const parsed = RegisterBuyerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, firstName, lastName, phone, addressLine, city, province, latitude, longitude } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "El email ya está registrado" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, role: "BUYER" }).returning();

  const [buyer] = await db.insert(buyerProfilesTable).values({
    userId: user.id,
    firstName,
    lastName,
    phone,
    addressLine: addressLine ?? null,
    city: city ?? null,
    province: province ?? null,
    latitude: latitude ? String(latitude) : null,
    longitude: longitude ? String(longitude) : null,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: formatUser(user, null, buyer) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, user.id)).limit(1);
  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, user.id)).limit(1);

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.json({ token, user: formatUser(user, merchant ?? null, buyer ?? null) });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const user = req.user!;
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
  if (!dbUser) {
    res.status(401).json({ error: "Usuario no encontrado" });
    return;
  }

  const [merchant] = await db.select().from(merchantProfilesTable).where(eq(merchantProfilesTable.userId, dbUser.id)).limit(1);
  const [buyer] = await db.select().from(buyerProfilesTable).where(eq(buyerProfilesTable.userId, dbUser.id)).limit(1);

  res.json(formatUser(dbUser, merchant ?? null, buyer ?? null));
});

export { formatMerchant, formatBuyer };
export default router;
