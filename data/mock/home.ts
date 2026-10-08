import type {
  HealthGoal,
  Product,
  ProductCollection,
} from "@/types/product";
import type {
  ConsultationCapability,
  Doctor,
  JourneyStep,
} from "@/types/doctor";
import type {
  Article,
  Brand,
  FooterGroup,
  Testimonial,
  TrustBenefit,
} from "@/types/content";

/* =============================================================================
 * DEMO CONTENT
 *
 * Every value below is placeholder data for design review. Product names,
 * prices, ratings, review counts, doctors, availability, fees, brand lists and
 * patient quotes are invented and must be replaced by the real catalogue and
 * verification sources before this page is shown to customers
 * (brain/00_MASTER_RULES.md rules 10–11, brain/17_DECISIONS.md D009).
 *
 * The page surfaces this flag as a visible notice so a stakeholder reviewing a
 * deploy preview is never misled into reading the figures as real.
 * ========================================================================== */
export const IS_DEMO_CONTENT = true;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export const primaryNav = [
  { label: "Shop", href: "/products" },
  { label: "Doctors", href: "/doctors" },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/about" },
  { label: "Wellness", href: "/wellness" },
  { label: "Learn", href: "/learn" },
] as const;

/** Grouped links shown inside the Shop navigation panel. */
export const shopMenu = {
  byForm: [
    { label: "Drops & Dilutions", href: "/products?form=drops" },
    { label: "Tablets & Pellets", href: "/products?form=tablets" },
    { label: "Mother Tinctures", href: "/products?form=tincture" },
    { label: "Creams & Ointments", href: "/products?form=cream" },
  ],
  byGoal: [
    { label: "Immunity", href: "/products?goal=immunity" },
    { label: "Skin Care", href: "/products?goal=skin-care" },
    { label: "Digestive", href: "/products?goal=digestive" },
    { label: "Sleep & Stress", href: "/products?goal=sleep-stress" },
  ],
} as const;

export const utilityMessages = [
  { id: "delivery", label: "Free delivery on orders above ₹499" },
  { id: "genuine", label: "100% genuine homoeopathic medicines" },
  { id: "doctors", label: "Consult certified doctors online" },
] as const;

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

export const heroTrustPoints: TrustBenefit[] = [
  {
    id: "genuine",
    title: "100% Genuine",
    detail: "Sourced from licensed manufacturers",
    icon: "shield-check",
  },
  {
    id: "formulations",
    title: "Classical Formulations",
    detail: "Prepared to pharmacopoeia standards",
    icon: "flask-conical",
  },
  {
    id: "experts",
    title: "Expert Doctors",
    detail: "Verified BHMS & MD practitioners",
    icon: "stethoscope",
  },
  {
    id: "holistic",
    title: "Care For Every Family",
    detail: "Remedies across ages and goals",
    icon: "heart-pulse",
  },
];

/** Illustrative figures only — see IS_DEMO_CONTENT. */
export const heroStats = [
  { id: "products", value: "3,000+", label: "Products" },
  { id: "doctors", value: "50+", label: "Expert doctors" },
  { id: "rating", value: "4.8", label: "Average rating" },
] as const;

/* -------------------------------------------------------------------------- */
/* Health goals                                                                */
/* -------------------------------------------------------------------------- */

export const healthGoals: HealthGoal[] = [
  { id: "immunity", name: "Immunity", icon: "shield-check", href: "/products?goal=immunity", image: "/Images/HealthGoals/immunity.webp" },
  { id: "skin-care", name: "Skin Care", icon: "sparkles", href: "/products?goal=skin-care", image: "/Images/HealthGoals/skincare.webp" },
  { id: "hair-care", name: "Hair Care", icon: "leaf", href: "/products?goal=hair-care", image: "/Images/HealthGoals/haircare.webp" },
  { id: "digestive", name: "Digestive", icon: "flask-conical", href: "/products?goal=digestive", image: "/Images/HealthGoals/digestive.webp" },
  { id: "womens-health", name: "Women's Health", icon: "flower-2", href: "/products?goal=womens-health", image: "/Images/HealthGoals/womens-health.webp" },
  { id: "children", name: "Children", icon: "baby", href: "/products?goal=children", image: "/Images/HealthGoals/children.webp" },
  { id: "joint-bone", name: "Joint & Bone", icon: "bone", href: "/products?goal=joint-bone", image: "/Images/HealthGoals/joint-bone.webp" },
  { id: "respiratory", name: "Respiratory", icon: "wind", href: "/products?goal=respiratory", image: "/Images/HealthGoals/respiratory.webp" },
  { id: "sleep-stress", name: "Sleep & Stress", icon: "moon", href: "/products?goal=sleep-stress", image: "/Images/HealthGoals/sleep-stress.webp" },
];

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export const bestsellingProducts: Product[] = [
  {
    id: "p-001",
    slug: "immunity-support-30-ch",
    name: "Immunity Support 30 CH",
    brand: "DOC HOMEO",
    form: "tablets",
    variant: "30 CH · 25 g pellets",
    price: { amount: 85, currency: "INR" },
    compareAtPrice: { amount: 100, currency: "INR" },
    rating: { value: 4.8, count: 120 },
    badge: "bestseller",
    tone: "clear",
    mediaLabel: "Immunity Support 30 CH bottle on stone pedestal",
    image: "/Images/Products/sbl-natrum.webp",
  },
  {
    id: "p-002",
    slug: "digestive-care-drops",
    name: "Digestive Care Drops",
    brand: "DOC HOMEO",
    form: "drops",
    variant: "22 ml dropper bottle",
    price: { amount: 235, currency: "INR" },
    compareAtPrice: { amount: 260, currency: "INR" },
    rating: { value: 4.7, count: 89 },
    badge: "popular",
    tone: "amber",
    mediaLabel: "Digestive Care Drops amber bottle on stone pedestal",
    image: "/Images/Products/reckeweg-r41.webp",
  },
  {
    id: "p-003",
    slug: "arnica-pellets-200",
    name: "Arnica Pellets 200",
    brand: "DOC HOMEO",
    form: "tablets",
    variant: "200 CH · 4 g tube",
    price: { amount: 75, currency: "INR" },
    compareAtPrice: { amount: 95, currency: "INR" },
    rating: { value: 4.5, count: 77 },
    badge: "for-pain",
    tone: "clear",
    mediaLabel: "Arnica Pellets 200 on stone pedestal",
    image: "/Images/Products/boiron-arnica.webp",
  },
  {
    id: "p-004",
    slug: "arnica-massage-oil",
    name: "Arnica Massage Oil",
    brand: "DOC HOMEO",
    form: "drops",
    variant: "100 ml bottle",
    price: { amount: 149, currency: "INR" },
    compareAtPrice: { amount: 195, currency: "INR" },
    rating: { value: 4.5, count: 210 },
    badge: "trending",
    tone: "amber",
    mediaLabel: "Arnica Massage Oil bottle on stone pedestal",
    image: "/Images/Products/bakson-arnica-oil.webp",
  },
  {
    id: "p-005",
    slug: "kali-phos-6x",
    name: "Kali Phos 6X",
    brand: "DOC HOMEO",
    form: "tablets",
    variant: "200 tablets",
    price: { amount: 65, currency: "INR" },
    compareAtPrice: { amount: 85, currency: "INR" },
    rating: { value: 4.6, count: 73 },
    badge: "new",
    tone: "clear",
    mediaLabel: "Kali Phos 6X bottle on stone pedestal",
    image: "/Images/Products/lords-kali-phos.webp",
  },
  {
    id: "p-006",
    slug: "respiratory-care-drops",
    name: "Respiratory Care Drops",
    brand: "DOC HOMEO",
    form: "drops",
    variant: "30 ml dropper bottle",
    price: { amount: 310, currency: "INR" },
    compareAtPrice: { amount: 360, currency: "INR" },
    rating: { value: 4.8, count: 102 },
    badge: "trending",
    tone: "amber",
    mediaLabel: "Respiratory Care Drops bottle on stone pedestal",
    image: "/Images/Products/reckeweg-r89.webp",
  },
  {
    id: "p-007",
    slug: "calendula-cream",
    name: "Calendula Cream",
    brand: "DOC HOMEO",
    form: "cream",
    variant: "50 g cream",
    price: { amount: 195, currency: "INR" },
    compareAtPrice: { amount: 240, currency: "INR" },
    rating: { value: 4.5, count: 64 },
    badge: "for-skin",
    tone: "clear",
    mediaLabel: "Calendula Cream jar on stone pedestal",
    image: "/Images/Products/sbl-calc-carb.webp",
  },
  {
    id: "p-008",
    slug: "hair-care-drops",
    name: "Hair Care Drops",
    brand: "DOC HOMEO",
    form: "drops",
    variant: "30 ml dropper bottle",
    price: { amount: 90, currency: "INR" },
    compareAtPrice: { amount: 120, currency: "INR" },
    rating: { value: 4.4, count: 58 },
    badge: "popular",
    tone: "amber",
    mediaLabel: "Hair Care Drops bottle on stone pedestal",
    image: "/Images/Products/schwabe-alfalfa.webp",
  },
];

/** Tabs in the bestsellers section map to these dosage forms. */
export const productFilters = [
  { id: "all", label: "All" },
  { id: "drops", label: "Drops" },
  { id: "tablets", label: "Tablets" },
  { id: "tincture", label: "Tinctures" },
  { id: "cream", label: "Creams" },
] as const;

export const featuredCollections: ProductCollection[] = [
  {
    id: "c-drops",
    name: "Drops",
    form: "drops",
    tagline: "Natural healing in every drop",
    productCount: 120,
    tone: "amber",
    mediaLabel: "Dropper bottle with a single suspended droplet, backlit",
    image: "/Images/Products/reckeweg-r41.webp",
  },
  {
    id: "c-tablets",
    name: "Tablets",
    form: "tablets",
    tagline: "Easy care for daily wellness",
    productCount: 200,
    tone: "clear",
    mediaLabel: "Glass pellet jar with the lid resting beside it",
    image: "/Images/Products/boiron-arnica.webp",
  },
  {
    id: "c-tinctures",
    name: "Tinctures",
    form: "tincture",
    tagline: "Pure extracts for deeper support",
    productCount: 90,
    tone: "forest",
    mediaLabel: "Tincture bottle among pressed botanical leaves",
    image: "/Images/Products/sbl-natrum.webp",
  },
  {
    id: "c-creams",
    name: "Creams",
    form: "cream",
    tagline: "Gentle care for skin and more",
    productCount: 80,
    tone: "cobalt",
    mediaLabel: "Cream tube on a folded linen cloth, top-down light",
    image: "/Images/Products/sbl-calc-carb.webp",
  },
];

/* -------------------------------------------------------------------------- */
/* Doctors & consultation                                                      */
/* -------------------------------------------------------------------------- */

export const featuredDoctor: Doctor = {
  id: "d-001",
  name: "Dr. A. Demo",
  qualifications: "BHMS, MD (Hom)",
  specialty: "Women's Health",
  experienceYears: 12,
  rating: { value: 4.8, count: 1200 },
  nextAvailable: "Today, 5:30 PM",
  consultationFee: { amount: 499, currency: "INR" },
  initials: "AD",
  mediaLabel:
    "Portrait of a homoeopathic doctor in a consultation room, natural window light",
};

export const consultationCapabilities: ConsultationCapability[] = [
  { id: "modes", label: "Video, audio or chat consultations", icon: "video" },
  { id: "prescriptions", label: "Digital prescriptions", icon: "file-text" },
  { id: "followup", label: "Follow-up and long-term care", icon: "calendar-check" },
  { id: "verified", label: "Verified and experienced doctors", icon: "badge-check" },
];

export const journeySteps: JourneyStep[] = [
  {
    id: "find",
    step: "01",
    title: "Find Your Doctor",
    description: "Browse certified doctors by speciality.",
    icon: "search",
  },
  {
    id: "book",
    step: "02",
    title: "Book a Slot",
    description: "Choose a time that suits you.",
    icon: "calendar-check",
  },
  {
    id: "consult",
    step: "03",
    title: "Consult Online",
    description: "Talk over video, audio or chat.",
    icon: "video",
  },
  {
    id: "prescription",
    step: "04",
    title: "Get Prescription",
    description: "Receive a digital prescription.",
    icon: "file-text",
  },
  {
    id: "receive",
    step: "05",
    title: "Receive & Order",
    description: "Medicines delivered to your home.",
    icon: "package-check",
  },
];

/* -------------------------------------------------------------------------- */
/* Trust, brands, social proof                                                 */
/* -------------------------------------------------------------------------- */

export const trustBenefits: TrustBenefit[] = [
  {
    id: "genuine",
    title: "100% Genuine",
    detail: "Products",
    icon: "shield-check",
  },
  { id: "delivery", title: "Fast & Safe", detail: "Delivery", icon: "truck" },
  { id: "payments", title: "Secure", detail: "Payments", icon: "credit-card" },
  {
    id: "returns",
    title: "Easy Returns",
    detail: "& Support",
    icon: "rotate-ccw",
  },
];

export const brands: Brand[] = [
  { id: "b-1", name: "Northwind", monogram: "NW", origin: "Demo brand", href: "/brands/northwind" },
  { id: "b-2", name: "Verdant", monogram: "VD", origin: "Demo brand", href: "/brands/verdant" },
  { id: "b-3", name: "Aurelia", monogram: "AU", origin: "Demo brand", href: "/brands/aurelia" },
  { id: "b-4", name: "Solvent", monogram: "SV", origin: "Demo brand", href: "/brands/solvent" },
  { id: "b-5", name: "Meridian", monogram: "MR", origin: "Demo brand", href: "/brands/meridian" },
  { id: "b-6", name: "Calyx", monogram: "CX", origin: "Demo brand", href: "/brands/calyx" },
  { id: "b-7", name: "Orchard", monogram: "OR", origin: "Demo brand", href: "/brands/orchard" },
];

/**
 * Placeholder quotes written for layout review. They describe service and
 * delivery experience only — no medical outcomes, no symptom claims
 * (brain/01_PRD.md: "Do not imply medical outcomes").
 */
export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote:
      "Placeholder review copy used while the layout is reviewed. It stands in for a customer's note about booking a consultation and how straightforward the process felt.",
    authorName: "Sample Reviewer",
    authorLocation: "Pune",
    initials: "SR",
    rating: 5,
    verifiedBuyer: true,
  },
  {
    id: "t-2",
    quote:
      "Placeholder review copy covering packaging and delivery speed, used to check how a shorter quote sits inside the supporting card.",
    authorName: "Sample Reviewer",
    authorLocation: "Mumbai",
    initials: "SR",
    rating: 5,
    verifiedBuyer: true,
  },
  {
    id: "t-3",
    quote:
      "Placeholder review copy about the prescription reminder feature, written to the length a real review is expected to run.",
    authorName: "Sample Reviewer",
    authorLocation: "Bangalore",
    initials: "SR",
    rating: 4,
    verifiedBuyer: false,
  },
  {
    id: "t-4",
    quote:
      "Placeholder review copy describing the follow-up scheduling flow, used to validate the carousel with more than two entries.",
    authorName: "Sample Reviewer",
    authorLocation: "Jaipur",
    initials: "SR",
    rating: 5,
    verifiedBuyer: true,
  },
];

export const articles: Article[] = [
  {
    id: "a-1",
    title: "How Homeopathy Supports Immunity Naturally",
    category: "Wellness",
    readingMinutes: 5,
    href: "/learn/homeopathy-supports-immunity",
    image: "/Images/journal_immunity.webp",
    mediaLabel:
      "Homeopathic medicine dropper bottle with chamomile flowers and mountain landscape",
  },
  {
    id: "a-2",
    title: "Natural Care for Children's Health",
    category: "Family",
    readingMinutes: 5,
    href: "/learn/natural-care-for-children",
    image: "/Images/journal_children.webp",
    mediaLabel: "Smiling happy child playing outdoors in a sunlit green meadow",
  },
  {
    id: "a-3",
    title: "Women's Wellness Through Homeopathy",
    category: "Women's Health",
    readingMinutes: 5,
    href: "/learn/womens-wellness",
    image: "/Images/journal_women.webp",
    mediaLabel: "Serene woman meditating in a bright sunny botanical wellness room",
  },
];

/* -------------------------------------------------------------------------- */
/* Offer                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Campaign copy is intentionally value-free. No percentage, price or deadline
 * is hard-coded — those arrive from the promotions source
 * (brain/01_PRD.md: "Avoid hard-coding 30% OFF unless supplied").
 */
export const offerCampaign = {
  eyebrow: "Seasonal edit",
  headlineLines: ["The Seasonal", "Wellness Edit"],
  description:
    "A curated selection of remedies for the change of season, chosen with our in-house practitioners.",
  ctaLabel: "Shop the edit",
  ctaHref: "/products?collection=seasonal",
  mediaLabel:
    "Hero remedy bottle on a dark stone plinth, dramatic single-source lighting",
  benefits: [
    { id: "genuine", title: "100% Genuine", detail: "Authentic medicines", icon: "shield-check" },
    { id: "delivery", title: "Fast Delivery", detail: "Pan-India shipping", icon: "truck" },
    { id: "secure", title: "Secure Payments", detail: "UPI, cards, net banking", icon: "credit-card" },
  ] satisfies TrustBenefit[],
} as const;

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export const footerGroups: FooterGroup[] = [
  {
    id: "quick-links",
    title: "Quick Links",
    links: [
      { label: "Shop", href: "/products" },
      { label: "Doctors", href: "/doctors" },
      { label: "Brands", href: "/brands" },
      { label: "About Us", href: "/about" },
      { label: "Wellness", href: "/wellness" },
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    id: "customer-care",
    title: "Customer Care",
    links: [
      { label: "My Account", href: "/user" },
      { label: "Track Order", href: "/user/orders" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Return & Cancellation", href: "/return-and-cancellation" },
      { label: "Help & Support", href: "/inquiry" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

export const paymentMarks = [
  "UPI",
  "Visa",
  "Mastercard",
  "RuPay",
  "Net Banking",
] as const;
