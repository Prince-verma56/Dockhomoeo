import { prisma } from "../lib/prisma";
import { STARTER_STREAM, addStarterSpecializations } from "../lib/starter-specializations";

// Starter specializations for the Homeopathy stream, each with the symptoms that point patients at it.
// Safe to run again: a specialization that already exists is left as staff have it.
//   npm run db:specializations
// The same thing is done by the "Add starter set" button under Admin → Consulting streams → Homeopathy.
// This command also switches off the other starter streams, which have no doctors, so only Homeopathy is
// offered. Staff can switch a stream back on, or add new ones, under Admin → Consulting streams.

const stream = await prisma.consultingStream.findUnique({ where: { name: STARTER_STREAM } });
if (!stream) {
  console.log(`There is no ${STARTER_STREAM} stream. Add it under Admin → Consulting streams first.`);
} else {
  const result = await addStarterSpecializations(stream.id);

  const others = await prisma.consultingStream.findMany({ where: { name: { not: STARTER_STREAM }, isActive: true }, select: { id: true, name: true } });
  const off: string[] = [];
  for (const other of others) {
    if ((await prisma.doctorProfile.count({ where: { stream: other.name } })) > 0) continue; // a stream with doctors is left alone
    await prisma.consultingStream.update({ where: { id: other.id }, data: { isActive: false } });
    off.push(other.name);
  }
  console.log(`Specializations added: ${result.added} (now ${result.total}). Symptoms filled in on existing ones: ${result.symptomsFilled}. Doctors given one: ${result.placed}. Streams switched off: ${off.length ? off.join(", ") : "none"}.`);
}
await prisma.$disconnect();
