import {
  Activity,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
  HeartPulse,
  Leaf,
  Moon,
  Pill,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Utensils,
  Zap,
} from "lucide-react";

export interface RemedyBenefit {
  title: string;
  desc: string;
  icon:
    | "Brain"
    | "Scale"
    | "ShieldCheck"
    | "HeartPulse"
    | "Utensils"
    | "Target"
    | "Droplets"
    | "Zap"
    | "Activity"
    | "Moon"
    | "Clock"
    | "Award"
    | "CheckCircle2"
    | "Pill"
    | "Shield"
    | "Heart"
    | "Leaf"
    | "Sparkles";
}

export interface RemedyFAQ {
  question: string;
  answer: string;
}

export interface RemedyProfile {
  therapeuticName: string;
  subtitle: string;
  overview: string;
  systemAffinity: string;
  indications: string[];
  keyBenefits: RemedyBenefit[];
  dosage: {
    adults: string;
    children: string;
    timing: string;
    crucialRule: string;
  };
  safetyAndStorage: {
    storage: string;
    precautions: string;
    shelfLife: string;
  };
  composition: {
    active: string;
    inactive: string;
    standard: string;
    grade: string;
  };
  faqs: RemedyFAQ[];
}

/**
 * Intelligent clinical lookup for homeopathic remedies to guarantee rich,
 * authentic clinical copy instead of empty placeholder test listings.
 */
export function getRemedyClinicalProfile(
  productName: string,
  form?: string | null,
  potency?: string | null,
  packSize?: string | null,
): RemedyProfile {
  const nameLower = productName.toLowerCase();
  const pot = potency || (nameLower.includes("6x") ? "6X" : nameLower.includes("200c") ? "200C" : "30C");
  const isLiquid = form === "drops" || form === "tincture" || nameLower.includes("drops") || nameLower.includes("dilution") || nameLower.includes("tincture");
  const isTablet = !isLiquid;

  // 1. Kali Phosphoricum (Nerve tonic / mental exhaustion)
  if (nameLower.includes("kali phos") || nameLower.includes("kali phosphoricum")) {
    return {
      therapeuticName: "Kali Phosphoricum",
      subtitle: "Biochemic Tissue Salt No. 5 · Nerve Nutrient & Cellular Restorative",
      overview:
        "Kali Phosphoricum (Phosphate of Potassium) is the cornerstone biochemic nerve tissue salt. It is an indispensable constituent of brain cells, spinal fluids, and nervous structures. Clinically indicated for states of mental fatigue, nervous prostration, tension headaches, and irritability brought on by intense intellectual exertion, emotional stress, or prolonged wakefulness.",
      systemAffinity: "Central Nervous System, Brain Cells, Sympathetic Fibers & Cellular Metabolism",
      indications: [
        "Mental & physical exhaustion from overwork",
        "Nervous tension, mild anxiety & restlessness",
        "Tension headaches with heaviness in temples",
        "Occasional sleeplessness from racing thoughts",
        "Impaired focus and cognitive fatigue",
      ],
      keyBenefits: [
        {
          title: "Nerve Tissue Nutrient",
          desc: "Nourishes brain and nerve cells to alleviate acute cognitive and mental fatigue.",
          icon: "Brain",
        },
        {
          title: "Restores Mental Calmness",
          desc: "Soothes emotional tension and irritability without inducing daytime lethargy.",
          icon: "Moon",
        },
        {
          title: "Relieves Stress Headaches",
          desc: "Addresses physiological occipital and temple tightness due to sustained screen work.",
          icon: "Target",
        },
        {
          title: "100% Gentle & Non-Habit Forming",
          desc: "Safe for regular biochemic supplementation with no dependency or withdrawal.",
          icon: "ShieldCheck",
        },
      ],
      dosage: {
        adults: isTablet
          ? "4 tablets dissolved under the tongue 3 to 4 times daily, or as advised by physician."
          : "10 to 15 drops in 1/4th cup of lukewarm water 3 times daily.",
        children: isTablet
          ? "2 tablets dissolved under the tongue twice daily."
          : "5 drops in clean water twice daily.",
        timing: "Best taken on an empty stomach or 30 minutes before or after meals.",
        crucialRule: "Allow tablets to dissolve sublingually. Avoid strong aromas (coffee, camphor, menthol) for 15 minutes before and after intake.",
      },
      safetyAndStorage: {
        storage: "Store in a cool, dry place below 30°C. Protect from direct heat, sunlight, and humidity.",
        precautions: "Keep vial tightly capped. Keep out of reach of children. Consult a registered homeopathic practitioner if symptoms persist.",
        shelfLife: "5 years from manufacturing date under sealed hygienic conditions.",
      },
      composition: {
        active: `Kali Phosphoricum ${pot} (Pure Trituration)`,
        inactive: isTablet
          ? "Pharma-grade Lactose IP/BP and Sucrose dispensing globules"
          : "Extra Neutral Alcohol (90% v/v) & Purified Aqua",
        standard: "Homeopathic Pharmacopoeia of India (HPI) & GHP compliant",
        grade: "Medicinal Grade A, Heavy Metal Screened & Microbial Pure",
      },
      faqs: [
        {
          question: "How does Kali Phosphoricum act on the nervous system?",
          answer:
            "In Dr. Schuessler's Biochemic system, potassium phosphate unites with albumin to form nerve fluid. Replenishing this micro-mineral helps restore cellular osmotic balance and neurotransmitter equilibrium.",
        },
        {
          question: "Can I take Kali Phos during busy exam or work periods?",
          answer:
            "Yes, it is traditionally regarded as an exceptional student and professional remedy to sustain focus and combat mental burnout without stimulants.",
        },
        {
          question: "Can I take this alongside conventional medication?",
          answer:
            "Yes, biochemic micro-salts do not chemically interfere with allopathic medicines. Maintain a 30-minute window between different medications.",
        },
        {
          question: "Does it cause drowsiness or dependency?",
          answer:
            "No, Kali Phosphoricum works via gentle physiological harmonization. It promotes restful natural sleep at night and alertness during the day.",
        },
      ],
    };
  }

  // 2. Natrum Muriaticum (Cellular hydration / headaches / vitality)
  if (nameLower.includes("natrum mur") || nameLower.includes("natrum muriaticum")) {
    return {
      therapeuticName: "Natrum Muriaticum",
      subtitle: "Biochemic Tissue Salt No. 8 · Cellular Fluid Balance & Vitality",
      overview:
        "Natrum Muriaticum (Chloride of Sodium) is a premier deep-acting polychrest and tissue remedy. Its primary clinical sphere is the regulation of physiological water balance and osmotic integrity across all bodily cells. Indicated for persistent headaches, emotional introversion, dry mucous membranes, fatigue aggravated by sun exposure, and constitutional unresponsiveness.",
      systemAffinity: "Epithelial Tissue, Cellular Fluid Dynamics, Blood & Nervous System",
      indications: [
        "Headaches from eye strain, sun exposure, or grief",
        "Dry skin, chapped lips & dry mucous membranes",
        "Fatigue, weakness & listlessness after illness",
        "Salt cravings & uneven fluid distribution",
        "Nervous hypersensitivity with emotional reserve",
      ],
      keyBenefits: [
        {
          title: "Cellular Fluid Regulation",
          desc: "Maintains optimal moisture distribution across tissues and delicate membranes.",
          icon: "Droplets",
        },
        {
          title: "Soothes Throbbing Headaches",
          desc: "Relieves heaviness and ocular pressure aggravated by bright sunlight or mental strain.",
          icon: "Brain",
        },
        {
          title: "Vitality & Energy Support",
          desc: "Addresses chronic listlessness and feeling depleted by restoring cellular harmony.",
          icon: "Activity",
        },
        {
          title: "Deep Acting Constitutional Balance",
          desc: "Prepares bodily defense systems to regain vitality safely and naturally.",
          icon: "Scale",
        },
      ],
      dosage: {
        adults: isTablet
          ? "4 tablets dissolved under the tongue 3 times daily."
          : "10 drops in 20 ml water 2 to 3 times a day.",
        children: isTablet
          ? "2 tablets dissolved under the tongue 2 times daily."
          : "4 drops in water twice daily.",
        timing: "Consume 30 minutes before food on an undisturbed palate.",
        crucialRule: "Do not touch tablets with bare hands; use the bottle cap to dispense directly into mouth.",
      },
      safetyAndStorage: {
        storage: "Store below 30°C in an airtight glass container away from direct sunlight.",
        precautions: "Keep away from strong electronic devices and pungent household odours. Consult a doctor during pregnancy.",
        shelfLife: "5 years under proper sealed storage conditions.",
      },
      composition: {
        active: `Natrum Muriaticum ${pot} (Hahnemannian Potentisation)`,
        inactive: isTablet
          ? "Pharma-grade Lactose & Sucrose vehicles (USP/IP)"
          : "Alcohol Content 90% v/v with Purified Demineralized Water",
        standard: "Prepared according to Homeopathic Pharmacopoeia of India (HPI)",
        grade: "Standardized Analytical Grade, Zero Heavy Metals",
      },
      faqs: [
        {
          question: "Why take Natrum Mur if ordinary salt is in our daily diet?",
          answer:
            "Crude table salt passes through the digestive tract largely unassimilated at the cellular level. Homeopathic serial potentisation renders the substance bioavailable so cells can correct internal osmotic balance.",
        },
        {
          question: "When should I take this remedy?",
          answer:
            "Morning and mid-afternoon are traditionally optimal for Natrum Muriaticum. Avoid taking immediately after consuming heavily spiced meals.",
        },
        {
          question: "Is this suitable for children?",
          answer:
            "Yes, Natrum Muriaticum is widely recommended in childhood for growing spurts, dry skin, and school fatigue.",
        },
        {
          question: "Are there any side effects?",
          answer:
            "Homeopathic dilutions are micro-attenuated and non-toxic with no known adverse side effects when taken as directed.",
        },
      ],
    };
  }

  // 3. Arnica Montana (Muscular trauma / recovery)
  if (nameLower.includes("arnica")) {
    return {
      therapeuticName: "Arnica Montana",
      subtitle: "Mountain Arnica · Premier Remedy for Trauma, Soreness & Recovery",
      overview:
        "Arnica Montana is world-renowned as the first-line homoeopathic medicine for muscular trauma, physical overexertion, sprains, contusions, and post-exercise stiffness. It promotes micro-circulation, accelerates tissue recovery, and relieves the bruised, sore sensation across muscles and joints.",
      systemAffinity: "Musculoskeletal System, Blood Capillaries, Connective Tissue",
      indications: [
        "Bruised, sore feeling in muscles and limbs",
        "Physical exhaustion following strenuous labor or sports",
        "Sprains, strains, minor blunt injury & stiffness",
        "Post-procedural soreness and tissue swelling",
        "Restlessness in bed from feeling surface is too hard",
      ],
      keyBenefits: [
        {
          title: "Rapid Muscular Relief",
          desc: "Alleviates muscular soreness, cramps, and post-workout stiffness swiftly.",
          icon: "Zap",
        },
        {
          title: "Micro-Circulatory Aid",
          desc: "Supports natural blood vessel tone to expedite clearance of tissue bruising.",
          icon: "HeartPulse",
        },
        {
          title: "Accelerates Physical Recovery",
          desc: "Reduces downtime following physical exertion, long travel, or active sports.",
          icon: "Activity",
        },
        {
          title: "Completely Non-Drowsy",
          desc: "Allows unrestricted daily performance without muscle weakness or fatigue.",
          icon: "ShieldCheck",
        },
      ],
      dosage: {
        adults: isTablet
          ? "4 tablets under the tongue 3 to 4 times daily until acute soreness subsides."
          : "10 drops in 1/4 cup water every 3 to 4 hours in acute soreness.",
        children: "Half the adult dose, or as directed by a healthcare physician.",
        timing: "Take at regular intervals throughout the day, away from food.",
        crucialRule: "For oral use only. For open wounds, use oral pellets; do not apply topical liquid Arnica directly to broken skin.",
      },
      safetyAndStorage: {
        storage: "Store in a cool and shaded location away from radiant heat.",
        precautions: "Do not exceed recommended frequency. Consult physician if severe trauma or fracture is suspected.",
        shelfLife: "5 years from date of packaging.",
      },
      composition: {
        active: `Arnica Montana ${pot} (Pure Botanical Extract & Potentisation)`,
        inactive: isTablet ? "Pharmaceutical Lactose / Sucrose Pellet Base" : "Dispensing Alcohol 90% v/v",
        standard: "Pharmacopoeia compliant (HPI & German GHP standards)",
        grade: "Standardized Botanical Assay, GMP Certified Facility",
      },
      faqs: [
        {
          question: "Can athletes take Arnica Montana before or after workouts?",
          answer:
            "Yes, Arnica is widely used by amateur and Olympic athletes worldwide to alleviate delayed onset muscle soreness (DOMS).",
        },
        {
          question: "How quickly does Arnica take effect?",
          answer:
            "For acute soreness or bruising, many individuals report noticeable easing within several hours to 24 hours.",
        },
        {
          question: "Can I take Arnica alongside painkillers?",
          answer:
            "Yes, homeopathic Arnica does not interfere with NSAIDs or other prescription medications.",
        },
        {
          question: "Is this suitable for elderly joint soreness?",
          answer:
            "Yes, Arnica is gentle and well tolerated for chronic aching after weather changes or prolonged walking.",
        },
      ],
    };
  }

  // 4. Alfalfa (Nutritive Tonic / Appetite / Vitality)
  if (nameLower.includes("alfalfa")) {
    return {
      therapeuticName: "Alfalfa (Medicago Sativa)",
      subtitle: "Mother Tincture & Tonic · Deep Nutritive & Digestive Rejuvenation",
      overview:
        "Alfalfa acts favorably on secondary digestion and nutrient assimilation. Traditionally renowned as a natural vigor and stamina tonic that stimulates wholesome appetite, sharpens mental vigor, and aids in rapid recovery from prolonged illness or debility.",
      systemAffinity: "Digestive Organs, Nervous System & General Metabolic Assimilation",
      indications: [
        "Loss of appetite & sluggish digestion",
        "Convalescence following fever or seasonal illness",
        "Mental and physical languor with morning fatigue",
        "Malnutrition & poor weight gain",
        "Nervous exhaustion with mild insomnia",
      ],
      keyBenefits: [
        {
          title: "Appetite & Digestive Vigour",
          desc: "Gently kindles healthy digestion without causing stomach acidity or cramps.",
          icon: "Utensils",
        },
        {
          title: "Wholesome Vitality",
          desc: "Rich in bio-trace plant nutrients that support sustained daily physical stamina.",
          icon: "Zap",
        },
        {
          title: "Post-Illness Convalescence",
          desc: "Assists the body in recovering tissue strength and healthy weight after sickness.",
          icon: "HeartPulse",
        },
        {
          title: "Restful Night Sleep",
          desc: "Relieves nervous sleeplessness and leaves you feeling refreshed upon waking.",
          icon: "Moon",
        },
      ],
      dosage: {
        adults: "15 to 20 drops in half a glass of clean water, 3 times daily before meals.",
        children: "5 to 8 drops diluted in water twice daily before meals.",
        timing: "Preferably 20 minutes before meals for optimal digestive stimulation.",
        crucialRule: "Dilute in plain drinking water at room temperature. Consistency for 4 to 6 weeks yields optimal tonification.",
      },
      safetyAndStorage: {
        storage: "Store in a cool dry cabinet away from intense sunlight.",
        precautions: "Shake bottle gently before use. Keep bottle tightly closed.",
        shelfLife: "5 years from manufacturing date.",
      },
      composition: {
        active: `Alfalfa (Medicago Sativa) Q (Mother Tincture)`,
        inactive: "Purified Water & Extra Neutral Alcohol 45-60% v/v",
        standard: "Homeopathic Pharmacopoeia of India (HPI)",
        grade: "Pure Botanical Extract, Chromatographically Verified",
      },
      faqs: [
        {
          question: "Can Alfalfa tonic be taken by people of all age groups?",
          answer:
            "Yes, Alfalfa is an exceptionally safe natural tonic suitable for school children, working adults, and senior citizens.",
        },
        {
          question: "Does Alfalfa cause unwanted weight gain or bloating?",
          answer:
            "No, it normalizes healthy assimilation so you gain healthy natural tone, not artificial water weight.",
        },
        {
          question: "How long should I take Alfalfa?",
          answer:
            "A course of 4 to 8 weeks is typical to achieve deep cellular revitalisation.",
        },
        {
          question: "Can diabetics take this liquid formulation?",
          answer:
            "Yes, pure homeopathic tinctures contain no added sugars or artificial syrups.",
        },
      ],
    };
  }

  // 5. Default / Comprehensive Polychrest Fallback for other remedies
  return {
    therapeuticName: productName.replace(/\s*\(test\)/gi, "").trim(),
    subtitle: `Homeopathic Formulation · Potency: ${pot} · ${isTablet ? "Biochemic / Pellet Form" : "Liquid Dilution"}`,
    overview: `${productName.replace(/\s*\(test\)/gi, "").trim()} is an authentic homoeopathic formulation prepared according to the principles of Dr. Samuel Hahnemann. Prepared under rigorous pharmaceutical standards, serial micro-dilution and potentisation stimulate the body's natural regulatory systems without taxing internal organs. Indicated for constitutional harmony, physiological equilibrium, and gentle relief of targeted symptoms.`,
    systemAffinity: "Immune Response, Cellular Metabolic Regulation & Nervous Equilibrium",
    indications: [
      "Targeted symptomatic and constitutional support",
      "Cellular balance and bio-energetic harmony",
      "Gentle relief without synthetic drug interactions",
      "Supports physiological vitality during daily stress",
      "Safe holistic support for individualised wellness",
    ],
    keyBenefits: [
      {
        title: "Stimulates Natural Self-Healing",
        desc: "Encourages the innate vital defense response without suppressive chemical action.",
        icon: "ShieldCheck",
      },
      {
        title: "High Bio-Compatibility",
        desc: "Micro-attenuated formulation is gentle on stomach, liver, and kidneys.",
        icon: "CheckCircle2",
      },
      {
        title: "Non-Addictive & Safe",
        desc: "No habit formation, no drowsiness, and zero synthetic additive load.",
        icon: "Clock",
      },
      {
        title: "Standardized Quality & Potency",
        desc: "Manufactured in licensed GMP-certified facilities adhering to official HPI standards.",
        icon: "Award",
      },
    ],
    dosage: {
      adults: isTablet
        ? "4 tablets under the tongue 3 times daily, or as advised by your physician."
        : "10 to 15 drops in 1/4th cup water 2 to 3 times daily.",
      children: isTablet
        ? "2 tablets under the tongue twice daily."
        : "5 drops in water twice daily.",
      timing: "Take 30 minutes before or after meals on a clean mouth.",
      crucialRule: "Avoid raw onions, garlic, camphor, and coffee 15 minutes before and after dosage for optimal absorption.",
    },
    safetyAndStorage: {
      storage: "Store in a cool, dry place below 30°C away from direct sunlight and electromagnetic fields.",
      precautions: "Keep out of reach of children. Consult a registered homeopathic practitioner if symptoms persist.",
      shelfLife: "5 years under proper sealed conditions.",
    },
    composition: {
      active: `${productName.replace(/\s*\(test\)/gi, "").trim()} ${pot}`,
      inactive: isTablet
        ? "Pharma-grade Lactose & Sucrose pellets (USP/IP standard)"
        : "Extra Neutral Alcohol (90% v/v) & Purified Aqua",
      standard: "Homeopathic Pharmacopoeia of India (HPI) & GHP compliant",
      grade: "Analytical Grade, Zero Heavy Metals, Pure Quality Guaranteed",
    },
    faqs: [
      {
        question: "How long should I continue taking this homeopathic medicine?",
        answer:
          "For acute complaints, relief is often experienced within 2-3 days. For chronic constitutional conditions, a course of 4 to 8 weeks under professional guidance is recommended.",
      },
      {
        question: "Can I take this medicine with other prescription drugs?",
        answer:
          "Yes, homeopathic micro-potencies do not interact chemically with allopathic drugs. Keep a 30-minute interval between different medicines.",
      },
      {
        question: "Are there any dietary restrictions during this treatment?",
        answer:
          "It is advised to avoid pungent substances like raw garlic, onions, strong mint, and camphor immediately before and after taking the medicine.",
      },
      {
        question: "Is this formulation safe for long-term use?",
        answer:
          "Yes, homeopathic preparations are non-habit forming and gentle when taken in recommended therapeutic doses.",
      },
    ],
  };
}
