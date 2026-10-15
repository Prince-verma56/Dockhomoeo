/**
 * The one place a catalogue product is given a photograph.
 *
 * public/Images/Products holds four distinct photographs (the other files there
 * are byte-for-byte copies). Each shows a labelled pack: a "Eucalyptus Radiata"
 * dropper bottle, a Boiron "Arnica Montana 30C" tube, a "Chamomilla 30C" pellet
 * jar and an "Arnica & Rosehip" massage oil. A photograph is attached to a
 * product here only when the remedy and dosage form on that label are the
 * product's own — a printed "Eucalyptus" label on an "Arnica 30C" card would
 * misdescribe what the shopper is buying.
 *
 * Every other product renders the illustrated pack (components/commerce/
 * ProductPackshot): the product's real name and potency set on a drawn
 * container for its dosage form. It is deliberate and consistent, and it never
 * shows somebody else's packaging.
 *
 * When the shop API supplies `imageUrl`, that photograph is used as-is; this
 * map only serves the local catalogue.
 */
export type ProductPhoto = {
  src: string;
  /** Describes what is actually in the photograph. */
  alt: string;
};

export const PRODUCT_PHOTOGRAPHY: Readonly<Record<string, ProductPhoto>> = {
  // Same remedy and form (an arnica massage oil). The label's maker differs
  // from the listed brand, so treat it as representative until the
  // manufacturer's packshot is supplied.
  "arnica-massage-oil": {
    src: "/Images/Products/bakson-arnica-oil.webp",
    alt: "Arnica massage oil in a red glass dropper bottle on a marble stand",
  },
};

export const productPhotoFor = (slug: string): ProductPhoto | undefined => PRODUCT_PHOTOGRAPHY[slug];
