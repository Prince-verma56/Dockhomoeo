export type ProductPhoto = {
  src: string;
  /** Describes what is actually in the photograph. */
  alt: string;
};

export const PRODUCT_PHOTOGRAPHY: Readonly<Record<string, ProductPhoto>> = {
  "arnica-montana-30c": {
    src: "/Images/Products/sbl-natrum.webp",
    alt: "SBL Arnica Montana 30C dilution bottle",
  },
  "digestive-care-drops": {
    src: "/Images/Products/reckeweg-r41.webp",
    alt: "Dr. Reckeweg Digestive Care drops bottle",
  },
  "arnica-pellets-200": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "DOC HOMEO Arnica Pellets 200 bottle",
  },
  "arnica-massage-oil": {
    src: "/Images/Products/bakson-arnica-oil.webp",
    alt: "Bakson Arnica massage oil in glass dropper bottle",
  },
  "kali-phos-6x": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "Lord's Kali Phos 6X biochemic tablets",
  },
  "respiratory-care-drops": {
    src: "/Images/Products/reckeweg-r89.webp",
    alt: "Dr. Reckeweg Respiratory Care drops bottle",
  },
  "calendula-cream": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "SBL Calendula cream tube",
  },
  "hair-care-drops": {
    src: "/Images/Products/reckeweg-r89.webp",
    alt: "Schwabe Hair Care drops bottle",
  },
  "nux-vomica-30c": {
    src: "/Images/Products/sbl-calc-carb.webp",
    alt: "SBL Nux Vomica 30C drops bottle",
  },
  "bryonia-alba-200": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "SBL Bryonia Alba 200 pellets tube",
  },
  "echinacea-angustifolia": {
    src: "/Images/Products/reckeweg-r41.webp",
    alt: "Dr. Reckeweg Echinacea Angustifolia tincture bottle",
  },
  "rhus-tox-ointment": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "Bakson Rhus Tox ointment tube",
  },
  "berberis-vulgaris-tincture": {
    src: "/Images/Products/schwabe-alfalfa.webp",
    alt: "Schwabe Berberis Vulgaris mother tincture bottle",
  },
  "silicea-12x": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "Lord's Silicea 12X biochemic tablets",
  },
  "gelsemium-30c": {
    src: "/Images/Products/sbl-natrum.webp",
    alt: "SBL Gelsemium 30C dilution bottle",
  },
  "calendula-ointment": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "Boiron Calendula ointment tube",
  },
  "pulsatilla-200": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "DOC HOMEO Pulsatilla 200 pellets bottle",
  },
  "ignatia-amara-30c": {
    src: "/Images/Products/reckeweg-r41.webp",
    alt: "Schwabe Ignatia Amara 30C drops bottle",
  },
  "thuja-occidentalis-cream": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "Bakson Thuja Occidentalis cream tube",
  },
  "aesculus-hip-ointment": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "SBL Aesculus Hip ointment tube",
  },
  "ferrum-phos-6x": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "Lord's Ferrum Phos 6X tablets",
  },
  "spongia-tosta-30c": {
    src: "/Images/Products/reckeweg-r89.webp",
    alt: "Dr. Reckeweg Spongia Tosta 30C drops bottle",
  },
  "cantharis-ointment": {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "Boiron Cantharis ointment tube",
  },
  "calcarea-phos-6x": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "SBL Calcarea Phos 6X tablets",
  },
  "immunity-support-30-ch": {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "DOC HOMEO Immunity Support 30 CH pellets",
  },
};

/** Default authentic imagery based on remedy dosage form */
export const FORM_DEFAULT_PHOTOGRAPHY: Readonly<Record<string, ProductPhoto>> = {
  drops: {
    src: "/Images/Products/sbl-natrum.webp",
    alt: "Homeopathic drops & dilutions glass bottle",
  },
  tablets: {
    src: "/Images/Products/lords-kali-phos.webp",
    alt: "Homeopathic biochemic tablets container",
  },
  cream: {
    src: "/Images/Products/boiron-arnica.webp",
    alt: "Homeopathic topical soothing cream tube",
  },
  oil: {
    src: "/Images/Products/bakson-arnica-oil.webp",
    alt: "Homeopathic therapeutic massage oil bottle",
  },
  tincture: {
    src: "/Images/Products/schwabe-alfalfa.webp",
    alt: "Homeopathic mother tincture bottle",
  },
};

export function productPhotoFor(slug: string, form?: string): ProductPhoto | undefined {
  if (PRODUCT_PHOTOGRAPHY[slug]) {
    return PRODUCT_PHOTOGRAPHY[slug];
  }
  if (form && FORM_DEFAULT_PHOTOGRAPHY[form]) {
    return FORM_DEFAULT_PHOTOGRAPHY[form];
  }
  return undefined;
}
