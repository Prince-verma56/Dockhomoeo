import { HttpError } from "./http";
import { prisma } from "./prisma";

// The starter specializations of the Homeopathy stream, each with the symptoms that point patients at it.
// A new database has none of them (they are data, not code), so the guided booking has no symptoms
// to offer until they are added: by the button under Admin → Consulting streams → Homeopathy, or by
// `npm run db:specializations`. Adding is safe to repeat: what staff already wrote is never overwritten.

export const STARTER_STREAM = "Homeopathy";

export const STARTERS: { name: string; description: string; isGeneral?: boolean; match: RegExp | null; symptoms: string[] }[] = [
  { name: "General physician", description: "Fever, cold, weakness and everyday complaints", isGeneral: true, match: null,
    symptoms: ["Fever", "Cold", "Cough", "Headache", "Body pain", "Weakness", "Tiredness", "Viral infection", "Weight management"] },
  { name: "Skin and hair", description: "Acne, eczema, psoriasis, hair fall and dandruff", match: /skin|hair|cosmet|derma/i,
    symptoms: ["Hair fall", "Dandruff", "Acne", "Pimples", "Dark patches on skin", "Eczema", "Psoriasis", "Itching", "Warts", "Fungal infection", "Vitiligo"] },
  { name: "Women's health", description: "Periods, PCOS, pregnancy care and menopause", match: /gyn|gyen|obstet|women/i,
    symptoms: ["Missed period", "Irregular periods", "Heavy menstrual bleeding", "Period pain", "PCOS", "White discharge", "Menopause", "Fertility"] },
  { name: "Child health", description: "Growth, immunity, tonsils and bedwetting in children", match: /paed|pedia|child/i,
    symptoms: ["Child not eating", "Frequent cold in child", "Tonsils", "Bedwetting", "Teething trouble", "Low immunity in child", "Growth concerns"] },
  { name: "Digestion and stomach", description: "Acidity, gas, constipation, piles and IBS", match: /digest|gastro|stomach|liver/i,
    symptoms: ["Stomach pain", "Acidity", "Gas", "Constipation", "Loose motions", "Piles", "IBS", "Indigestion", "Loss of appetite"] },
  { name: "Allergy and breathing", description: "Asthma, sinus, allergic cold and breathlessness", match: /allerg|asthma|respir|sinus|ent\b/i,
    symptoms: ["Sneezing", "Allergic cold", "Sinus", "Asthma", "Breathlessness", "Wheezing", "Dust allergy", "Chronic cough"] },
  { name: "Bones and joints", description: "Arthritis, back pain, knee pain and spondylosis", match: /ortho|joint|arthr|bone|spine/i,
    symptoms: ["Joint pain", "Knee pain", "Back pain", "Neck pain", "Arthritis", "Sciatica", "Stiffness", "Gout"] },
  { name: "Mind and sleep", description: "Anxiety, low mood, stress and poor sleep", match: /mind|psych|mental|emotion|bach|sleep/i,
    symptoms: ["Anxiety", "Low mood", "Stress", "Insomnia", "Panic", "Lack of focus", "Anger", "Migraine"] },
  { name: "Kidney and urinary", description: "Kidney stones, urine infection and prostate trouble", match: /kidney|renal|urin|stone|prostat/i,
    symptoms: ["Kidney stone", "Burning urination", "Frequent urination", "Urine infection", "Prostate trouble"] },
  { name: "Heart, sugar and thyroid", description: "Blood pressure, diabetes, thyroid and cholesterol", match: /cardio|heart|diabet|thyroid|sugar|pressure|dnhe|nutrition/i,
    symptoms: ["High blood pressure", "Diabetes", "Thyroid", "Cholesterol", "Obesity", "Palpitations"] },
];

/** Whether the starter set is meant for this stream. */
export const hasStarterSet = (streamName: string) => streamName.trim().toLowerCase() === STARTER_STREAM.toLowerCase();

/**
 * Adds the starter specializations that are missing, fills in the symptoms of any that have none,
 * and gives each doctor who has no specialization the one their own description points at.
 * Nothing staff wrote is changed: an existing name is kept, and symptoms are only added where the list is empty.
 */
export const addStarterSpecializations = async (streamId: number) => {
  const stream = await prisma.consultingStream.findUnique({ where: { id: streamId }, include: { specializations: true } });
  if (!stream) throw new HttpError(404, "Stream not found");
  if (!hasStarterSet(stream.name)) throw new HttpError(400, `The starter set is written for ${STARTER_STREAM}. Add this stream's specializations by hand.`);

  const byName = new Map(stream.specializations.map((s) => [s.name.trim().toLowerCase(), s]));
  const hasGeneral = stream.specializations.some((s) => s.isGeneral);
  let added = 0;
  let symptomsFilled = 0;
  for (const [index, starter] of STARTERS.entries()) {
    const existing = byName.get(starter.name.toLowerCase());
    if (!existing) {
      // only one specialization per stream is "suggested when unsure": keep the one staff already chose
      await prisma.streamSpecialization.create({
        data: { streamId, name: starter.name, description: starter.description, symptoms: starter.symptoms, isGeneral: Boolean(starter.isGeneral) && !hasGeneral, sortOrder: index },
      });
      added++;
    } else if (existing.symptoms.length === 0) {
      await prisma.streamSpecialization.update({ where: { id: existing.id }, data: { symptoms: starter.symptoms, description: existing.description ?? starter.description } });
      symptomsFilled++;
    }
  }

  const saved = await prisma.streamSpecialization.findMany({ where: { streamId } });
  const idOf = new Map(saved.map((s) => [s.name.trim().toLowerCase(), s.id]));
  const general = saved.find((s) => s.isGeneral);

  // doctors without one: the first specialization their own words mention, otherwise the general one
  const doctors = await prisma.doctorProfile.findMany({ where: { stream: stream.name, specializationId: null }, select: { id: true, specialization: true, bio: true } });
  let placed = 0;
  for (const doctor of doctors) {
    const text = `${doctor.specialization ?? ""} ${doctor.bio ?? ""}`;
    const found = STARTERS.find((s) => s.match?.test(text));
    const specializationId = (found ? idOf.get(found.name.toLowerCase()) : undefined) ?? general?.id;
    if (!specializationId) continue;
    await prisma.doctorProfile.update({ where: { id: doctor.id }, data: { specializationId } }); // their own description is kept: it is what patients read
    placed++;
  }
  return { added, symptomsFilled, placed, total: saved.length, symptoms: saved.reduce((sum, s) => sum + s.symptoms.length, 0) };
};
