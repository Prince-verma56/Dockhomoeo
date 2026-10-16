import type { HealthGoal, ProductCollection } from "@/types/product";
import type { JourneyStep } from "@/types/doctor";
import type {
  Article,
  Brand,
  TrustBenefit,
} from "@/types/content";

/* =============================================================================

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Health goals                                                                */
/* -------------------------------------------------------------------------- */

export const healthGoals: HealthGoal[] = [
  { id: "immunity", name: "Immunity", icon: "shield-check", href: "/products?category=immunity", image: "/Images/HealthGoals/immunity.webp" },
  { id: "skin-care", name: "Skin Care", icon: "sparkles", href: "/products?category=skin-care", image: "/Images/HealthGoals/skincare.webp" },
  { id: "hair-care", name: "Hair Care", icon: "leaf", href: "/products?category=hair-care", image: "/Images/HealthGoals/haircare.webp" },
  { id: "digestive", name: "Digestive", icon: "flask-conical", href: "/products?category=digestive", image: "/Images/HealthGoals/digestive.webp" },
  { id: "womens-health", name: "Women's Health", icon: "flower-2", href: "/products?category=womens-health", image: "/Images/HealthGoals/womens-health.webp" },
  { id: "children", name: "Children", icon: "baby", href: "/products?category=children", image: "/Images/HealthGoals/children.webp" },
  { id: "joint-bone", name: "Joint & Bone", icon: "bone", href: "/products?category=joint-bone", image: "/Images/HealthGoals/joint-bone.webp" },
  { id: "respiratory", name: "Respiratory", icon: "wind", href: "/products?category=respiratory", image: "/Images/HealthGoals/respiratory.webp" },
  { id: "sleep-stress", name: "Sleep & Stress", icon: "moon", href: "/products?category=sleep-stress", image: "/Images/HealthGoals/sleep-stress.webp" },
];

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export const featuredCollections: ProductCollection[] = [
  {
    id: "c-drops",
    name: "Drops",
    form: "drops",
    tagline: "Natural healing in every drop",
    productCount: 120,
    tone: "amber",
    mediaLabel: "Dropper bottle with a single suspended droplet, backlit",
    image: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
  },
  {
    id: "c-tablets",
    name: "Tablets",
    form: "tablets",
    tagline: "Easy care for daily wellness",
    productCount: 200,
    tone: "clear",
    mediaLabel: "Glass pellet jar with the lid resting beside it",
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
  },
  {
    id: "c-tinctures",
    name: "Tinctures",
    form: "tincture",
    tagline: "Pure extracts for deeper support",
    productCount: 90,
    tone: "forest",
    mediaLabel: "Remedy bottles and jars on a stone plinth by the water",
    image: "/Images/NaturesCareBG.webp",
    // The bottles sit left of centre (as in FORM_MEDIA).
    imagePosition: "40% 60%",
  },
  {
    id: "c-creams",
    name: "Creams",
    form: "cream",
    tagline: "Gentle care for skin and more",
    productCount: 80,
    tone: "cobalt",
    mediaLabel: "Cream tube on a folded linen cloth, top-down light",
    image: "/Images/Editorial/arnica-cream-tube.webp",
  },
];

/* -------------------------------------------------------------------------- */
/* Doctors & consultation                                                      */
/* -------------------------------------------------------------------------- */

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

export const articles: Article[] = [
  {
    id: "a-1",
    title: "How Homeopathy Supports Immunity Naturally",
    category: "Wellness",
    readingMinutes: 5,
    excerpt:
      "An overview of how homoeopathic remedies are discussed in relation to everyday immune health, and the questions worth taking to a practitioner.",
    href: "/insights/homeopathy-supports-immunity",
    image: "/Images/journal_immunity.webp",
    mediaLabel:
      "Homeopathic medicine dropper bottle with chamomile flowers and mountain landscape",
  },
  {
    id: "a-2",
    title: "Natural Care for Children's Health",
    category: "Family",
    readingMinutes: 5,
    excerpt:
      "What parents commonly ask about homoeopathy for children, and why a practitioner's guidance matters for younger patients.",
    href: "/insights/natural-care-for-children",
    image: "/Images/journal_children.webp",
    mediaLabel: "Smiling happy child playing outdoors in a sunlit green meadow",
  },
  {
    id: "a-3",
    title: "Women's Wellness Through Homeopathy",
    category: "Women's Health",
    readingMinutes: 5,
    excerpt:
      "How homoeopathy is approached across different stages of women's health, written to support a conversation with your practitioner.",
    href: "/insights/womens-wellness",
    image: "/Images/journal_women.webp",
    mediaLabel: "Serene woman meditating in a bright sunny botanical wellness room",
  },
];

/* -------------------------------------------------------------------------- */
/* Offer                                                                       */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

export const paymentMarks = [
  "UPI",
  "Visa",
  "Mastercard",
  "RuPay",
  "Net Banking",
] as const;
