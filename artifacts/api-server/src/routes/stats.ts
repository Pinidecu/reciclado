import { Router } from "express";
import { db, ordersTable, merchantProfilesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/stats/public", async (_req, res): Promise<void> => {
  const [merchantsResult, ordersResult] = await Promise.all([
    db.select({ count: count() }).from(merchantProfilesTable),
    db.select({ total: count(), revenue: sql<number>`coalesce(sum(total), 0)` }).from(ordersTable).where(eq(ordersTable.paymentStatus, "PAID")),
  ]);

  const merchantsCount = Number(merchantsResult[0]?.count ?? 0);
  const totalOrders = Number(ordersResult[0]?.total ?? 0);
  // Estimate: avg 0.8kg per order, 2.5kg CO2 per kg food rescued
  const kgRescued = Math.round(totalOrders * 0.8 * 10) / 10;
  const co2Avoided = Math.round(kgRescued * 2.5 * 10) / 10;

  res.json({
    kgRescued,
    totalOrders,
    merchantsCount,
    co2Avoided,
  });
});

export default router;
