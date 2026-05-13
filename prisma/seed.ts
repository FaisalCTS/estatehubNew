// Seed data for local development.
// Run with: npm run db:seed
//
// Adds a sample society, a few flats, and a handful of property listings
// so the homepage isn't empty when you first start the app.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Sample society
  const society = await prisma.society.upsert({
    where: { id: "seed-society-1" },
    update: {},
    create: {
      id: "seed-society-1",
      name: "Prestige Lakeside Habitat",
      addressLine: "Varthur Main Road",
      locality: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066",
      totalFlats: 412,
      amenityTags: JSON.stringify(["Swimming Pool", "Gym", "Clubhouse", "Tennis Court", "Kids Play Area"])
    }
  });

  // Sample flat
  const flat = await prisma.flat.upsert({
    where: { societyId_tower_flatNo: { societyId: society.id, tower: "A", flatNo: "1204" } },
    update: {},
    create: {
      societyId: society.id,
      tower: "A",
      flatNo: "1204",
      bhk: 3,
      carpetArea: 1520
    }
  });

  // Sample owner user
  const owner = await prisma.user.upsert({
    where: { phone: "+919876543210" },
    update: {},
    create: {
      phone: "+919876543210",
      name: "R. Kumar",
      email: "kumar@example.com",
      isKycVerified: true,
      roles: JSON.stringify(["OWNER", "RESIDENT"])
    }
  });

  // Sample property listings
  const propertiesData = [
    {
      title: "3BHK Apartment in Prestige Lakeside, Whitefield",
      description: "Spacious 3BHK with lake-facing balcony, fully furnished, in a gated community with all amenities.",
      intent: "SELL" as const,
      type: "APARTMENT" as const,
      status: "LIVE" as const,
      verification: "DOCUMENT_VERIFIED" as const,
      bhk: 3,
      carpetArea: 1520,
      bathrooms: 3,
      balconies: 2,
      furnishing: "FULLY_FURNISHED" as const,
      ageYears: 5,
      floor: 12,
      totalFloors: 24,
      price: 14500000,
      isNegotiable: true,
      addressLine: "Tower A, Flat 1204",
      locality: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066",
      amenities: JSON.stringify(["Swimming Pool", "Gym", "Clubhouse", "Power Backup", "Lift"])
    },
    {
      title: "2BHK for Rent in HSR Layout",
      description: "Semi-furnished 2BHK on the 4th floor, walking distance to metro and tech parks.",
      intent: "RENT" as const,
      type: "APARTMENT" as const,
      status: "LIVE" as const,
      verification: "SELF_DECLARED" as const,
      bhk: 2,
      carpetArea: 1100,
      bathrooms: 2,
      balconies: 1,
      furnishing: "SEMI_FURNISHED" as const,
      ageYears: 8,
      floor: 4,
      totalFloors: 6,
      price: 35000,
      isNegotiable: true,
      addressLine: "27th Main, HSR Layout",
      locality: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      amenities: JSON.stringify(["Lift", "Power Backup", "Reserved Parking"])
    },
    {
      title: "4BHK Villa in Sarjapur Road",
      description: "Independent villa with private garden and three-car parking. Brand new construction.",
      intent: "SELL" as const,
      type: "VILLA" as const,
      status: "LIVE" as const,
      verification: "PHYSICALLY_VERIFIED" as const,
      bhk: 4,
      carpetArea: 3200,
      bathrooms: 5,
      balconies: 3,
      furnishing: "UNFURNISHED" as const,
      ageYears: 0,
      floor: 0,
      totalFloors: 3,
      price: 45000000,
      isNegotiable: false,
      addressLine: "Off Sarjapur Road",
      locality: "Sarjapur",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "562125",
      amenities: JSON.stringify(["Private Garden", "Servant Quarter", "Power Backup", "Solar"])
    }
  ];

  for (const data of propertiesData) {
    await prisma.property.create({
      data: {
        ...data,
        ownerId: owner.id,
        publishedAt: new Date(),
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", roomTag: "exterior", order: 0 },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", roomTag: "living", order: 1 },
            { url: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800", roomTag: "kitchen", order: 2 }
          ]
        }
      }
    });
  }

  // Sample maintenance bill for the flat
  const now = new Date();
  await prisma.maintenanceBill.upsert({
    where: { flatId_cycleMonth_cycleYear: { flatId: flat.id, cycleMonth: now.getMonth() + 1, cycleYear: now.getFullYear() } },
    update: {},
    create: {
      flatId: flat.id,
      cycleMonth: now.getMonth() + 1,
      cycleYear: now.getFullYear(),
      amount: 8420,
      breakdown: JSON.stringify([
        { head: "Common Area Maintenance", amount: 6000 },
        { head: "Water Charges", amount: 900 },
        { head: "Sinking Fund", amount: 1000 },
        { head: "Vehicle (2 cars)", amount: 500 },
        { head: "GST", amount: 20 }
      ]),
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      status: "PENDING"
    }
  });

  // Sample society notice
  await prisma.notice.upsert({
    where: { id: "seed-notice-1" },
    update: {},
    create: {
      id: "seed-notice-1",
      societyId: society.id,
      title: "Water supply interruption — 15 May",
      body: "Dear residents,\n\nThere will be a scheduled water supply interruption on 15 May 2026 from 9 AM to 2 PM due to maintenance of the overhead tank. Please store water accordingly.\n\nApologies for the inconvenience.\n\n— Management Committee",
      isPinned: true
    }
  });

  await prisma.notice.upsert({
    where: { id: "seed-notice-2" },
    update: {},
    create: {
      id: "seed-notice-2",
      societyId: society.id,
      title: "AGM scheduled — 20 June 2026",
      body: "The Annual General Meeting will be held on 20 June 2026 at 6:00 PM in the Clubhouse. Attendance is requested from all flat owners. Agenda: audit report, committee election, maintenance rate revision.",
      isPinned: false
    }
  });

  console.log("✅ Seeded:", {
    societies: 1,
    flats: 1,
    users: 1,
    properties: propertiesData.length,
    bills: 1,
    notices: 2
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
