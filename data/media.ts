/**
 * Image references for catalogue discovery, kept in one place so pages do not
 * scatter paths. Every entry is an existing asset in /public whose subject
 * matches what it stands for.
 */

/** Product photography for each dosage form, until dedicated form artwork exists. */
export const FORM_MEDIA: Record<string, { src: string; position?: string }> = {
  drops: { src: "/Images/Products/reckeweg-r41.webp" },
  tablets: { src: "/Images/Products/lords-kali-phos.webp" },
  // The scene's amber tincture bottle sits right of centre.
  tincture: { src: "/Images/SeasonalEditBG.webp", position: "78% 60%" },
  cream: { src: "/Images/Products/boiron-arnica.webp" },
  oil: { src: "/Images/Products/bakson-arnica-oil.webp" },
};
