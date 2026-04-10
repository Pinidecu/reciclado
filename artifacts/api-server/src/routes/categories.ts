import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).where(eq(categoriesTable.isActive, true));
  res.json(categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? null,
    isActive: c.isActive,
  })));
});

export default router;
