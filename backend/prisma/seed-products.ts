import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function seedProducts() {
  console.log("Seeding brands, categories, products and inventory...");

  // 1. Brands
  const brandsData = [
    { name: "SBL", slug: "sbl", description: "India's premier homeopathic medicine brand with global pharmacopeia standards." },
    { name: "Dr. Reckeweg", slug: "dr-reckeweg", description: "World-renowned German biological and homeopathic specialties manufactured in Bensheim." },
    { name: "Schwabe India", slug: "schwabe-india", description: "Dr. Willmar Schwabe - leading German homeopathic formulations and mother tinctures." },
    { name: "Boiron", slug: "boiron", description: "World leader in homeopathic medicines, established in France in 1932." },
    { name: "Bakson", slug: "bakson", description: "Trusted Indian homeopathic healthcare and personal care products." },
    { name: "DOC HOMEO", slug: "doc-homeo", description: "DocHomoeo exclusive verified clinical formulations and potency packs." },
    { name: "Lord's", slug: "lords", description: "Lord's Homeopathic Laboratory formulations and biochemic tablets." }
  ];

  const brandMap = new Map<string, number>();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: { name: b.name, slug: b.slug, description: b.description, isActive: true },
    });
    brandMap.set(b.name, brand.id);
  }

  // 2. Categories
  const categoriesData = [
    { name: "First Aid", slug: "first-aid", description: "Emergency care, pain relief, injury, and trauma formulations." },
    { name: "Digestion", slug: "digestion", description: "Acid reflux, gastritis, IBS, and digestive health remedies." },
    { name: "Wellness", slug: "wellness", description: "Stress, sleep, mental clarity, and vitality formulations." },
    { name: "Body Care", slug: "body-care", description: "Topical care, pain relief oils, and botanical balms." },
    { name: "Respiratory", slug: "respiratory", description: "Cough, cold, congestion, and respiratory defense." },
    { name: "Skin Care", slug: "skin-care", description: "Acne, eczema, allergies, and clear skin therapeutics." },
    { name: "Drops & Dilutions", slug: "drops-dilutions", description: "Potentized homeopathic liquid dilutions and drops." },
    { name: "Mother Tinctures", slug: "mother-tinctures", description: "Concentrated whole botanical alcohol extracts." },
    { name: "Biochemic & Tablets", slug: "biochemic-tablets", description: "Schuessler tissue cell salts and compressed trituration tablets." },
  ];

  const catMap = new Map<string, number>();
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description, isActive: true },
    });
    catMap.set(c.name, cat.id);
  }

  // 3. Products
  const productsToCreate = [
    {
      name: "Arnica Montana 30C",
      slug: "arnica-montana-30c",
      brand: "SBL",
      category: "First Aid",
      form: "Dilution",
      shortDescription: "The premier remedy for physical trauma, muscle soreness, bruising, and overexertion.",
      description: "Arnica Montana is prepared from the mountain daisy and is the most renowned homeopathic remedy for trauma, sprains, bruises, and post-surgical muscle soreness. It promotes rapid tissue repair and eases muscular stiffness.",
      composition: "Arnica Montana 30C in extra-neutral alcohol base.",
      indications: ["Bruises", "Muscle soreness", "Physical shock", "Sprains", "Post-exertion fatigue"],
      howToUse: "Take 4 to 5 drops in half a cup of water or 4 pellets twice daily on an empty stomach.",
      safetyWarnings: "Keep in a cool dark place away from direct sunlight, camphor, and strong perfumes.",
      mrp: 140,
      price: 110,
      packSize: "30 ml",
      potency: "30C",
      sku: "SBL-ARN-30C-30ML",
      image: "/images/products/arnica-montana.jpg",
      ratingAverage: 4.8,
      ratingCount: 156,
    },
    {
      name: "Digestive Care Drops",
      slug: "digestive-care-drops",
      brand: "Dr. Reckeweg",
      category: "Digestion",
      form: "Drops",
      shortDescription: "Fast-acting German biological formulation for flatulence, indigestion, and acid reflux.",
      description: "Dr. Reckeweg German digestive drops balance gastrointestinal enzyme secretion and relieve bloating, indigestion, heartburn, and slow metabolic transit.",
      composition: "Nux Vomica D3, Carbo Veg D6, Lycopodium D4, China D3.",
      indications: ["Acid reflux", "Gas and bloating", "Indigestion", "Heartburn"],
      howToUse: "10 to 15 drops in lukewarm water before or after meals.",
      safetyWarnings: "Do not exceed recommended dose.",
      mrp: 260,
      price: 220,
      packSize: "22 ml",
      potency: "Combination",
      sku: "REC-DIG-22ML",
      image: "/images/products/digestive-care.jpg",
      ratingAverage: 4.7,
      ratingCount: 89,
    },
    {
      name: "Arnica Pellets 200",
      slug: "arnica-pellets-200",
      brand: "DOC HOMEO",
      category: "First Aid",
      form: "Tablets",
      shortDescription: "High-potency sucrose globules for deep joint and tissue contusions.",
      description: "DocHomoeo certified 200C globules manufactured with pure pharmaceutical-grade cane sugar globules, saturated with genuine Arnica Montana.",
      composition: "Arnica Montana 200C on pure sucrose pellets.",
      indications: ["Deep bruising", "Joint ache", "Acute physical trauma"],
      howToUse: "Dissolve 4 pellets under the tongue twice daily.",
      safetyWarnings: "Avoid touching pellets with bare fingers; use the cap dispenser.",
      mrp: 95,
      price: 75,
      packSize: "4 g",
      potency: "200C",
      sku: "DH-ARN-200C-4G",
      image: "/images/products/arnica-pellets.jpg",
      ratingAverage: 4.5,
      ratingCount: 77,
    },
    {
      name: "Arnica Massage Oil",
      slug: "arnica-massage-oil",
      brand: "Bakson",
      category: "Body Care",
      form: "Oil",
      shortDescription: "Enriched botanical pain relief oil for backache, joint stiffness and sprains.",
      description: "Non-sticky, rapidly absorbed homeopathic herbal oil combining Arnica, Cantharis, and Gaultheria for muscular pain relief and soothing tissue massage.",
      composition: "Arnica Montana, Cantharis, Gaultheria, Sesame Oil base.",
      indications: ["Joint pain", "Backache", "Muscular sprains", "Stiff neck"],
      howToUse: "Apply gently over affected area 2 to 3 times daily.",
      safetyWarnings: "For external application only. Do not apply on open wounds.",
      mrp: 195,
      price: 149,
      packSize: "100 ml",
      potency: "Botanical Oil",
      sku: "BAK-ARN-OIL-100ML",
      image: "/images/products/arnica-oil.jpg",
      ratingAverage: 4.5,
      ratingCount: 210,
    },
    {
      name: "Kali Phos 6X",
      slug: "kali-phos-6x",
      brand: "Lord's",
      category: "Wellness",
      form: "Tablets",
      shortDescription: "The premier nerve nutrient tissue salt for mental exhaustion, anxiety, and sleeplessness.",
      description: "Kali Phosphoricum (Potassium Phosphate) is Schuessler's nerve tissue salt. It revitalizes exhausted nerve cells and calms emotional agitation, stress-induced headaches, and insomnia.",
      composition: "Kali Phosphoricum 6X in lactose monohydrate trituration base.",
      indications: ["Nervous exhaustion", "Stress", "Brain fatigue", "Sleeplessness"],
      howToUse: "Chew or dissolve 4 tablets on the tongue three times daily.",
      safetyWarnings: "Store tightly sealed away from heat.",
      mrp: 85,
      price: 65,
      packSize: "200 tablets",
      potency: "6X",
      sku: "LOR-KP-6X-200T",
      image: "/images/products/kali-phos.jpg",
      ratingAverage: 4.6,
      ratingCount: 73,
    },
    {
      name: "Respiratory Care Drops",
      slug: "respiratory-care-drops",
      brand: "Dr. Reckeweg",
      category: "Respiratory",
      form: "Drops",
      shortDescription: "Effective formula for dry spasmodic cough, bronchospasm, and chest congestion.",
      description: "German Reckeweg formula for seasonal respiratory infections, dry irritated coughs, and throat tickling.",
      composition: "Drosera D2, Belladonna D3, Bryonia D3, Ipecacuanha D3.",
      indications: ["Spasmodic cough", "Bronchial irritation", "Morning throat congestion"],
      howToUse: "10 drops in warm water 3 times daily.",
      safetyWarnings: "Consult a doctor if fever persists.",
      mrp: 270,
      price: 230,
      packSize: "22 ml",
      potency: "Combination",
      sku: "REC-RESP-22ML",
      image: "/images/products/respiratory-care.jpg",
      ratingAverage: 4.8,
      ratingCount: 114,
    },
    {
      name: "Calendula Ointment",
      slug: "calendula-ointment",
      brand: "Schwabe India",
      category: "Skin Care",
      form: "Ointment",
      shortDescription: "Natural antiseptic healing ointment for minor cuts, abrasions, and skin chapping.",
      description: "Manufactured from pure marigold blossoms, Calendula promotes rapid cell granulation, prevents infection, and soothes dry cracked skin.",
      composition: "Calendula Officinalis Mother Tincture 10% in white petroleum jelly base.",
      indications: ["Minor cuts", "Abrasions", "Chapped hands", "Cracked heels"],
      howToUse: "Cleanse affected area and apply a thin layer 2 times daily.",
      safetyWarnings: "For external use only.",
      mrp: 120,
      price: 95,
      packSize: "25 g",
      potency: "Ointment 10%",
      sku: "SCH-CAL-25G",
      image: "/images/products/calendula.jpg",
      ratingAverage: 4.7,
      ratingCount: 132,
    },
    {
      name: "Berberis Aquifolium Mother Tincture Q",
      slug: "berberis-aquifolium-q",
      brand: "SBL",
      category: "Skin Care",
      form: "Mother Tincture",
      shortDescription: "Legendary botanical extract for clear, glowing complexion, acne and pigmentation.",
      description: "Berberis Aquifolium (Mountain Grape) is the most celebrated homeopathic mother tincture for facial acne, scars, dark spots, and sallow skin tone.",
      composition: "Berberis Aquifolium Q in certified extra-neutral grain alcohol.",
      indications: ["Acne vulgaris", "Hyperpigmentation", "Dry scaly eczema", "Dull skin complexion"],
      howToUse: "10 to 15 drops in half a cup of water twice daily, and dilute 5 drops with rose water for topical application.",
      safetyWarnings: "Store in a cool amber bottle.",
      mrp: 160,
      price: 130,
      packSize: "30 ml",
      potency: "Q",
      sku: "SBL-BER-Q-30ML",
      image: "/images/products/berberis.jpg",
      ratingAverage: 4.9,
      ratingCount: 245,
    },
    {
      name: "Five Phos 6X Tablets",
      slug: "five-phos-6x",
      brand: "Bakson",
      category: "Wellness",
      form: "Tablets",
      shortDescription: "Comprehensive biochemic nerve and energy tonic for convalescence and vitality.",
      description: "Synergistic combination of five essential tissue phosphates: Calcarea Phos, Ferrum Phos, Kali Phos, Magnesia Phos, and Natrum Phos.",
      composition: "Calc Phos 6X, Ferrum Phos 6X, Kali Phos 6X, Mag Phos 6X, Nat Phos 6X.",
      indications: ["General debility", "Anemia", "Nervous weakness", "Convalescence"],
      howToUse: "4 tablets four times daily dissolved on tongue.",
      safetyWarnings: "Keep away from moisture.",
      mrp: 110,
      price: 88,
      packSize: "25 g",
      potency: "6X",
      sku: "BAK-5PHOS-6X-25G",
      image: "/images/products/five-phos.jpg",
      ratingAverage: 4.6,
      ratingCount: 98,
    }
  ];

  for (const item of productsToCreate) {
    const brandId = brandMap.get(item.brand) ?? null;
    const categoryId = catMap.get(item.category) ?? null;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        brandId,
        categoryId,
        form: item.form,
        shortDescription: item.shortDescription,
        description: item.description,
        composition: item.composition,
        indications: Array.isArray(item.indications) ? item.indications.join(", ") : item.indications,
        directions: item.howToUse,
        safetyInfo: item.safetyWarnings,
        status: "ACTIVE",
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount,
      },
      create: {
        name: item.name,
        slug: item.slug,
        brandId,
        categoryId,
        form: item.form,
        shortDescription: item.shortDescription,
        description: item.description,
        composition: item.composition,
        indications: Array.isArray(item.indications) ? item.indications.join(", ") : item.indications,
        directions: item.howToUse,
        safetyInfo: item.safetyWarnings,
        status: "ACTIVE",
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount,
      },
    });

    // Variant
    await prisma.productVariant.upsert({
      where: { sku: item.sku },
      update: {
        title: `${item.potency} · ${item.packSize}`,
        packSize: item.packSize,
        potency: item.potency,
        mrp: item.mrp,
        sellingPrice: item.price,
        stockQuantity: 150,
        isDefault: true,
        isActive: true,
      },
      create: {
        productId: product.id,
        sku: item.sku,
        title: `${item.potency} · ${item.packSize}`,
        packSize: item.packSize,
        potency: item.potency,
        mrp: item.mrp,
        sellingPrice: item.price,
        stockQuantity: 150,
        isDefault: true,
        isActive: true,
      },
    });

    // Image
    const existingImg = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImg) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.image,
          altText: item.name,
          sortOrder: 0,
        },
      });
    }
  }

  // 4. Coupons
  const coupons = [
    { code: "WELCOME50", type: "PERCENT" as const, value: 50, maxDiscount: 150, minOrderValue: 299, description: "50% off up to ₹150 on your first order" },
    { code: "SAVE10", type: "PERCENT" as const, value: 10, maxDiscount: 250, minOrderValue: 499, description: "10% off up to ₹250 on orders above ₹499" },
    { code: "FREESHIP", type: "FLAT" as const, value: 50, maxDiscount: 50, minOrderValue: 399, description: "Free delivery on orders above ₹399" }
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        minOrderValue: c.minOrderValue,
        description: c.description,
        isActive: true,
      },
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        minOrderValue: c.minOrderValue,
        description: c.description,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${productsToCreate.length} products, ${brandsData.length} brands, ${categoriesData.length} categories, and coupons successfully!`);
}

seedProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding products:", err);
    process.exit(1);
  });
