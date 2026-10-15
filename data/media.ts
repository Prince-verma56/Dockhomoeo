/**
 * Image references for catalogue discovery, kept in one place so pages do not
 * scatter paths. Every entry is an existing asset in /public whose subject
 * matches what it stands for.
 */

export type Media = {
  src: string;
  /** CSS object-position, when the subject sits off centre. */
  position?: string;
  /**
   * `photo` — a photograph that fills its frame edge to edge.
   * `study` — a studio study on a white sweep (the health-goal artwork); it is
   *           blended onto a tinted frame (`dh-study`) so it never floats in white.
   */
  kind: "photo" | "study";
};

/** Product photography for each dosage form, until dedicated form artwork exists. */
export const FORM_MEDIA: Record<string, { src: string; position?: string }> = {
  drops: { src: "/Images/Products/reckeweg-r41.webp" },
  tablets: { src: "/Images/Products/lords-kali-phos.webp" },
  // The scene's amber tincture bottle sits right of centre.
  tincture: { src: "/Images/SeasonalEditBG.webp", position: "78% 60%" },
  cream: { src: "/Images/Products/boiron-arnica.webp" },
  oil: { src: "/Images/Products/bakson-arnica-oil.webp" },
};

/** Wide scenes not tied to one product, form or concern. */
export const SCENE_MEDIA = {
  /** Several unbranded remedy bottles and jars on a stone plinth. */
  apothecary: { src: "/Images/NaturesCareBG.webp", position: "64% 72%", kind: "photo" },
} as const satisfies Record<string, Media>;

/**
 * A photograph per health concern, only where the photograph's subject is the
 * concern's own: eucalyptus for respiratory care, chamomile for sleep, a
 * topical cream among flowers for skin. Concerns without a matching
 * photograph keep their studio study.
 */
const CATEGORY_MEDIA: Record<string, Media> = {
  // An amber dropper on a stone in a mountain meadow, among chamomile.
  immunity: { src: "/Images/journal_immunity.webp", position: "50% 58%", kind: "photo" },
  // A remedy cream tube laid among yellow flowers.
  "skin-care": { src: "/Images/Products/boiron-arnica.webp", position: "50% 55%", kind: "photo" },
  // A dropper bottle with fresh eucalyptus.
  respiratory: { src: "/Images/Products/reckeweg-r41.webp", position: "50% 50%", kind: "photo" },
  // A pellet jar beside chamomile flowers.
  "sleep-stress": { src: "/Images/Products/lords-kali-phos.webp", position: "50% 50%", kind: "photo" },
  // A woman seated in meditation in a calm, plant-filled room.
  "womens-health": { src: "/Images/journal_women.webp", position: "52% 50%", kind: "photo" },
  // A toddler laughing in a sunlit meadow.
  children: { src: "/Images/journal_children.webp", position: "45% 40%", kind: "photo" },
  digestive: { src: "/Images/HealthGoals/digestive.webp", kind: "study" },
  "hair-care": { src: "/Images/HealthGoals/haircare.webp", kind: "study" },
  "joint-bone": { src: "/Images/HealthGoals/joint-bone.webp", kind: "study" },
};

/** The local catalogue's category artwork; an API image is anything else. */
const isLocalStudy = (url: string) => url.startsWith("/Images/HealthGoals/");

/**
 * The image for a category: the shop API's own image when it supplies one,
 * else the matching local photograph, else the local study.
 */
export function categoryMedia(slug: string, imageUrl: string | null): Media | null {
  if (imageUrl && !isLocalStudy(imageUrl)) return { src: imageUrl, kind: "photo" };
  return CATEGORY_MEDIA[slug] ?? (imageUrl ? { src: imageUrl, kind: "study" } : null);
}
