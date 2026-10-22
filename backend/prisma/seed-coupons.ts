import { prisma } from "../src/lib/prisma";

const COUPONS = [
  {
    code: "HEALTH10",
    description: "10% instant discount on orders above ₹249",
    type: "PERCENT" as const,
    value: 10,
    maxDiscount: 100,
    minOrderValue: 249,
    isActive: true,
  },
  {
    code: "DOCTOR15",
    description: "15% clinical care discount on orders above ₹499",
    type: "PERCENT" as const,
    value: 15,
    maxDiscount: 150,
    minOrderValue: 499,
    isActive: true,
  },
  {
    code: "FIRST50",
    description: "Flat ₹50 off on first order above ₹199",
    type: "FLAT" as const,
    value: 50,
    maxDiscount: 50,
    minOrderValue: 199,
    isActive: true,
  },
  {
    code: "WELLNESS20",
    description: "20% off on family orders above ₹899",
    type: "PERCENT" as const,
    value: 20,
    maxDiscount: 250,
    minOrderValue: 899,
    isActive: true,
  },
  {
    code: "WELCOME50",
    description: "50% off up to ₹150 on your first order above ₹299",
    type: "PERCENT" as const,
    value: 50,
    maxDiscount: 150,
    minOrderValue: 299,
    isActive: true,
  },
  {
    code: "SAVE10",
    description: "10% off up to ₹250 on orders above ₹499",
    type: "PERCENT" as const,
    value: 10,
    maxDiscount: 250,
    minOrderValue: 499,
    isActive: true,
  },
  {
    code: "FREESHIP",
    description: "Free delivery on orders above ₹399",
    type: "FREE_SHIPPING" as const,
    value: 50,
    maxDiscount: 50,
    minOrderValue: 399,
    isActive: true,
  },
];

async function main() {
  console.log("Seeding coupons...");
  for (const c of COUPONS) {
    const existing = await prisma.coupon.findFirst({
      where: { code: { equals: c.code, mode: "insensitive" } },
    });
    if (existing) {
      await prisma.coupon.update({
        where: { id: existing.id },
        data: {
          description: c.description,
          type: c.type,
          value: c.value,
          maxDiscount: c.maxDiscount,
          minOrderValue: c.minOrderValue,
          isActive: true,
          startsAt: null,
          expiresAt: null,
          usageLimit: null,
        },
      });
      console.log(`Updated coupon: ${c.code}`);
    } else {
      await prisma.coupon.create({
        data: {
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          maxDiscount: c.maxDiscount,
          minOrderValue: c.minOrderValue,
          isActive: true,
        },
      });
      console.log(`Created coupon: ${c.code}`);
    }
  }
  console.log("Coupons seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
