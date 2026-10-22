import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DOCTORS = [
  {
    phone: "9811001001",
    email: "dr.rajesh@dochomoeo.com",
    slug: "dr-rajesh-sharma",
    displayName: "Dr. Rajesh Sharma",
    photoUrl: "/Images/doctors/dr-rajesh-sharma.jpg",
    qualification: "BHMS, MD (Homeopathy)",
    specialization: "Chronic Diseases & Immunity",
    experienceYears: 16,
    languages: ["English", "Hindi"],
    bio: "Senior homeopathic consultant specializing in long-standing constitutional disorders, chronic allergies, and autoimmune support with 16+ years of clinical practice.",
    clinicCity: "Mumbai",
    clinicState: "Maharashtra",
    videoFee: 500,
    audioFee: 400,
    slotMinutes: 20,
    ratingAverage: 4.9,
    ratingCount: 142,
  },
  {
    phone: "9811001002",
    email: "dr.priya@dochomoeo.com",
    slug: "dr-priya-nair",
    displayName: "Dr. Priya Nair",
    photoUrl: "/Images/doctors/dr-priya-nair.jpg",
    qualification: "BHMS, Fellowship in Dermatology (Homeopathy)",
    specialization: "Skin, Hair & Hormonal Health",
    experienceYears: 12,
    languages: ["English", "Hindi", "Malayalam"],
    bio: "Specialist in dermatological homeopathy, treating eczema, psoriasis, acne, and hormonal hair disorders through individualized constitutional prescribing.",
    clinicCity: "Bangalore",
    clinicState: "Karnataka",
    videoFee: 600,
    audioFee: 450,
    slotMinutes: 20,
    ratingAverage: 4.8,
    ratingCount: 98,
  },
  {
    phone: "9811001003",
    email: "dr.amit@dochomoeo.com",
    slug: "dr-amit-verma",
    displayName: "Dr. Amit Verma",
    photoUrl: "/Images/doctors/dr-amit-verma.jpg",
    qualification: "BHMS, PGCR",
    specialization: "Pediatrics & Respiratory Care",
    experienceYears: 14,
    languages: ["English", "Hindi"],
    bio: "Focused on gentle pediatric remedies, seasonal asthma, bronchitis, and recurrent respiratory tract infections in children and young adults.",
    clinicCity: "Delhi NCR",
    clinicState: "Delhi",
    videoFee: 550,
    audioFee: 400,
    slotMinutes: 20,
    ratingAverage: 4.9,
    ratingCount: 115,
  },
  {
    phone: "9811001004",
    email: "dr.sunita@dochomoeo.com",
    slug: "dr-sunita-kulkarni",
    displayName: "Dr. Sunita Kulkarni",
    photoUrl: "/Images/doctors/dr-sunita-kulkarni.jpg",
    qualification: "BHMS, MD (Homoeopathic Materia Medica)",
    specialization: "Women's Wellness & Lifestyle Disorders",
    experienceYears: 18,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Expert homoeopath addressing PCOS, thyroid imbalances, migraines, stress-related sleep disorders, and menopause support through natural holistic healing.",
    clinicCity: "Pune",
    clinicState: "Maharashtra",
    videoFee: 650,
    audioFee: 500,
    slotMinutes: 20,
    ratingAverage: 5.0,
    ratingCount: 184,
  },
  {
    phone: "9811001005",
    email: "dr.aditya@dochomoeo.com",
    slug: "dr-aditya-sharma",
    displayName: "Dr. Aditya Sharma",
    photoUrl: "/Images/doctors/dr-aditya-sharma.jpg",
    qualification: "MD (Homeopathy), Senior Consultant",
    specialization: "Constitutional Prescribing & Chronic Care",
    experienceYears: 15,
    languages: ["English", "Hindi"],
    bio: "Senior homoeopathic physician specializing in classical dilutions, sublingual dosage timing, and constitutional medicine with 15+ years of clinical excellence.",
    clinicCity: "Delhi NCR",
    clinicState: "Delhi",
    videoFee: 600,
    audioFee: 450,
    slotMinutes: 20,
    ratingAverage: 5.0,
    ratingCount: 168,
  },
];

async function seedDoctors() {
  console.log("Seeding verified homeopathic doctors into PostgreSQL...");
  const passwordHash = await bcrypt.hash("Doctor@12345", 10);
  const now = new Date();

  // Hide the demo doctor from public patient listing
  await prisma.doctorProfile.updateMany({
    where: { slug: "dr-demo-doctor" },
    data: { isListed: false },
  });

  for (const doc of DOCTORS) {
    const user = await prisma.user.upsert({
      where: { phone: doc.phone },
      update: {
        firstName: doc.displayName.replace(/^Dr\.\s*/i, ""),
        email: doc.email,
        role: "DOCTOR",
        isActive: true,
      },
      create: {
        phone: doc.phone,
        email: doc.email,
        role: "DOCTOR",
        firstName: doc.displayName.replace(/^Dr\.\s*/i, ""),
        passwordHash,
        phoneVerifiedAt: now,
        isActive: true,
      },
    });

    const profile = await prisma.doctorProfile.upsert({
      where: { slug: doc.slug },
      update: {
        displayName: doc.displayName,
        photoUrl: doc.photoUrl,
        qualification: doc.qualification,
        specialization: doc.specialization,
        experienceYears: doc.experienceYears,
        languages: doc.languages,
        bio: doc.bio,
        clinicCity: doc.clinicCity,
        clinicState: doc.clinicState,
        videoFee: doc.videoFee,
        audioFee: doc.audioFee,
        slotMinutes: doc.slotMinutes,
        ratingAverage: doc.ratingAverage,
        ratingCount: doc.ratingCount,
        verificationStatus: "APPROVED",
        acceptsConsultations: true,
        isListed: true,
      },
      create: {
        userId: user.id,
        slug: doc.slug,
        displayName: doc.displayName,
        photoUrl: doc.photoUrl,
        stream: "Homeopathy",
        qualification: doc.qualification,
        specialization: doc.specialization,
        experienceYears: doc.experienceYears,
        languages: doc.languages,
        bio: doc.bio,
        clinicName: `${doc.displayName} Clinical Practice`,
        clinicCity: doc.clinicCity,
        clinicState: doc.clinicState,
        clinicPincode: "110001",
        verificationStatus: "APPROVED",
        submittedAt: now,
        verifiedAt: now,
        acceptsConsultations: true,
        isListed: true,
        videoFee: doc.videoFee,
        audioFee: doc.audioFee,
        slotMinutes: doc.slotMinutes,
        ratingAverage: doc.ratingAverage,
        ratingCount: doc.ratingCount,
      },
    });

    // Seed weekly availability so slots exist
    for (let day = 1; day <= 6; day++) {
      const existingSlot = await prisma.doctorAvailability.findFirst({
        where: {
          doctorId: profile.id,
          dayOfWeek: day,
          startTime: "10:00",
        },
      });

      if (!existingSlot) {
        await prisma.doctorAvailability.create({
          data: {
            doctorId: profile.id,
            dayOfWeek: day,
            startTime: "10:00",
            endTime: "18:00",
            isActive: true,
          },
        });
      }
    }

    console.log(`Seeded doctor: ${doc.displayName} (${doc.slug}) with photo: ${doc.photoUrl}`);
  }

  console.log("Doctors seeded successfully!");
}

seedDoctors()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
