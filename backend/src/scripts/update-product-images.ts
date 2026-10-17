import "dotenv/config";
import { prisma } from "../lib/prisma";

const PRODUCT_IMAGES: Record<string, string> = {
  "kali-phosphoricum-6x-tablets-test": "/Images/Products/lords-kali-phos.jpg",
  "natrum-muriaticum-30c-test": "/Images/Products/sbl-natrum.jpg",
  "arnica-montana-30c-pellets-test": "/Images/Products/boiron-arnica.jpg",
  "alfalfa-q-mother-tincture-test": "/Images/Products/schwabe-alfalfa.jpg",
  "arnica-massage-oil-test": "/Images/Products/bakson-arnica-oil.jpg",
  "r41-memory-and-nerve-drops-test": "/Images/Products/reckeweg-r41.jpg",
  "r89-hair-care-drops-test": "/Images/Products/reckeweg-r89.jpg",
  "calcarea-carbonica-200c-test": "/Images/Products/sbl-calc-carb.jpg",
};

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in DB.`);

  for (const product of products) {
    const imageUrl = PRODUCT_IMAGES[product.slug];
    if (imageUrl) {
      // Remove any existing images for this product or upsert
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });

      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          altText: product.name,
          sortOrder: 0,
        },
      });

      console.log(`Assigned image ${imageUrl} to product "${product.name}" (${product.slug})`);
    } else {
      console.log(`No direct image mapping for product "${product.name}" (${product.slug})`);
    }
  }
  console.log("Done updating product images.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
