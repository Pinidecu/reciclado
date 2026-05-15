import "dotenv/config";
import { db } from "./src";
import { categoriesTable } from "./src/schema/categories";
import { merchantProfilesTable } from "./src/schema/merchants";
import { productsTable } from "./src/schema/products";

async function seed() {
  console.log("🌱 Seeding categorías...");

  await db.insert(merchantProfilesTable).values([
  {
    userId: "user-panaderia-1",
    businessName: "Panadería Don José",
    legalName: "Panadería Don José SRL",
    cuit: "20-12345678-9",
    category: "panaderia",
    description: "Panadería tradicional con productos del día",
    phone: "3871234567",
    addressLine: "Av. Siempre Viva 123",
    city: "Salta",
    province: "Salta",
    postalCode: "4400",
    latitude: "-24.782126",
    longitude: "-65.423197",
    pickupHours: "08:00 - 20:00",
    logoUrl: "",
    coverImageUrl: "",
    isVerified: true,
    isOpen: true,
  },
  {
    userId: "user-verduleria-1",
    businessName: "Verdulería El Verde",
    legalName: "El Verde SA",
    cuit: "20-87654321-9",
    category: "verduleria",
    description: "Frutas y verduras frescas todos los días",
    phone: "3877654321",
    addressLine: "Calle Falsa 456",
    city: "Salta",
    province: "Salta",
    postalCode: "4400",
    latitude: "-24.785000",
    longitude: "-65.410000",
    pickupHours: "09:00 - 18:00",
    logoUrl: "",
    coverImageUrl: "",
    isVerified: true,
    isOpen: true,
  },
]).onConflictDoNothing();

  await db.insert(categoriesTable).values([
    {
      name: "Panadería",
      slug: "panaderia",
      icon: "bread",
    },
    {
      name: "Verdulería",
      slug: "verduleria",
      icon: "carrot",
    },
    {
      name: "Supermercados",
      slug: "supermercados",
      icon: "shopping-cart",
    },
  ]).onConflictDoNothing(); // evita duplicados

  console.log("✅ Categorías creadas");


  const categories = await db.select().from(categoriesTable);
const merchants = await db.select().from(merchantProfilesTable);

const panaderia = categories.find(c => c.slug === "panaderia");
const verduleria = categories.find(c => c.slug === "verduleria");

const panaderiaMerchant = merchants.find(m => m.category === "panaderia");
const verduleriaMerchant = merchants.find(m => m.category === "verduleria");

if (!panaderia || !verduleria || !panaderiaMerchant || !verduleriaMerchant) {
  throw new Error("Faltan categorías o comercios para crear productos");
}

/* await db.insert(productsTable).values([
  {
    merchantId: panaderiaMerchant.id,
    categoryId: panaderia.id,
    name: "Bolsa de pan surtido",
    slug: "pan-surtido",
    description: "Pan del día en buen estado",
    originalPrice: "1500",
    salePrice: "700",
    quantityAvailable: 10,
    unit: "unidad",
    pickupAddress: panaderiaMerchant.addressLine,
    status: "AVAILABLE",
    isFeatured: true,
    publishedAt: new Date(),
  },
  {
    merchantId: panaderiaMerchant.id,
    categoryId: panaderia.id,
    name: "Facturas del día",
    slug: "facturas-dia",
    originalPrice: "2000",
    salePrice: "900",
    quantityAvailable: 8,
    pickupAddress: panaderiaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: panaderiaMerchant.id,
    categoryId: panaderia.id,
    name: "Pan dulce en oferta",
    slug: "pan-dulce",
    originalPrice: "3000",
    salePrice: "1200",
    quantityAvailable: 5,
    pickupAddress: panaderiaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: panaderiaMerchant.id,
    categoryId: panaderia.id,
    name: "Medialunas",
    slug: "medialunas",
    originalPrice: "1800",
    salePrice: "800",
    quantityAvailable: 12,
    pickupAddress: panaderiaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: panaderiaMerchant.id,
    categoryId: panaderia.id,
    name: "Bizcochos",
    slug: "bizcochos",
    originalPrice: "1200",
    salePrice: "500",
    quantityAvailable: 15,
    pickupAddress: panaderiaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },

  // Verdulería
  {
    merchantId: verduleriaMerchant.id,
    categoryId: verduleria.id,
    name: "Bolsa de verduras mixtas",
    slug: "verduras-mixtas",
    originalPrice: "2500",
    salePrice: "1000",
    quantityAvailable: 10,
    pickupAddress: verduleriaMerchant.addressLine,
    status: "AVAILABLE",
    isFeatured: true,
    publishedAt: new Date(),
  },
  {
    merchantId: verduleriaMerchant.id,
    categoryId: verduleria.id,
    name: "Frutas maduras",
    slug: "frutas-maduras",
    originalPrice: "2200",
    salePrice: "900",
    quantityAvailable: 9,
    pickupAddress: verduleriaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: verduleriaMerchant.id,
    categoryId: verduleria.id,
    name: "Bananas",
    slug: "bananas",
    originalPrice: "1000",
    salePrice: "400",
    quantityAvailable: 20,
    pickupAddress: verduleriaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: verduleriaMerchant.id,
    categoryId: verduleria.id,
    name: "Manzanas",
    slug: "manzanas",
    originalPrice: "1500",
    salePrice: "700",
    quantityAvailable: 14,
    pickupAddress: verduleriaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
  {
    merchantId: verduleriaMerchant.id,
    categoryId: verduleria.id,
    name: "Tomates",
    slug: "tomates",
    originalPrice: "1300",
    salePrice: "600",
    quantityAvailable: 11,
    pickupAddress: verduleriaMerchant.addressLine,
    status: "AVAILABLE",
    publishedAt: new Date(),
  },
]).onConflictDoNothing();
} */

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  });