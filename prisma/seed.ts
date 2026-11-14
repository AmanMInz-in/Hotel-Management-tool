import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 1 database...");

  // Clean slate
  await prisma.voidLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.section.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users: 1 Admin, 2 Waiters, 1 Kitchen user
  const admin = await prisma.user.create({
    data: {
      name: "Master Admin",
      email: "admin@restaurant.com",
      passwordHash: "admin123",
      role: "ADMIN",
      pin: "1234",
    },
  });

  const waiter1 = await prisma.user.create({
    data: {
      name: "Captain Rahul",
      email: "waiter1@restaurant.com",
      passwordHash: "waiter123",
      role: "WAITER",
      pin: "1111",
    },
  });

  const waiter2 = await prisma.user.create({
    data: {
      name: "Captain Priya",
      email: "waiter2@restaurant.com",
      passwordHash: "waiter123",
      role: "WAITER",
      pin: "2222",
    },
  });

  const kitchen = await prisma.user.create({
    data: {
      name: "Chef Sanjay",
      email: "kitchen@restaurant.com",
      passwordHash: "chef123",
      role: "KITCHEN",
      pin: "3333",
    },
  });

  // 2. Sections & 6 Sample Tables
  const indoor = await prisma.section.create({
    data: { name: "Indoor AC Dining", sortOrder: 1 },
  });

  const rooftop = await prisma.section.create({
    data: { name: "Rooftop Lounge", sortOrder: 2 },
  });

  const tables = [
    { tableNumber: "T1", sectionId: indoor.id, capacity: 2, status: "AVAILABLE" },
    { tableNumber: "T2", sectionId: indoor.id, capacity: 4, status: "AVAILABLE" },
    { tableNumber: "T3", sectionId: indoor.id, capacity: 4, status: "AVAILABLE" },
    { tableNumber: "T4", sectionId: indoor.id, capacity: 6, status: "AVAILABLE" },
    { tableNumber: "R1", sectionId: rooftop.id, capacity: 2, status: "AVAILABLE" },
    { tableNumber: "R2", sectionId: rooftop.id, capacity: 4, status: "AVAILABLE" },
  ];

  for (const t of tables) {
    await prisma.restaurantTable.create({ data: t });
  }

  // 3. Categories & 12 Sample Menu Items
  const starters = await prisma.category.create({
    data: { name: "Starters & Appetizers", slug: "starters", sortOrder: 1 },
  });

  const mains = await prisma.category.create({
    data: { name: "Main Course", slug: "mains", sortOrder: 2 },
  });

  const breads = await prisma.category.create({
    data: { name: "Breads & Rice", slug: "breads-rice", sortOrder: 3 },
  });

  const beverages = await prisma.category.create({
    data: { name: "Beverages & Mocktails", slug: "beverages", sortOrder: 4 },
  });

  const desserts = await prisma.category.create({
    data: { name: "Desserts", slug: "desserts", sortOrder: 5 },
  });

  const menuItems = [
    // 3 Starters
    { name: "Paneer Tikka Angara", price: 320, categoryId: starters.id, isVeg: true, description: "Cottage cheese charred with Kashmiri chili and mustard oil." },
    { name: "Crispy Corn & Pepper", price: 280, categoryId: starters.id, isVeg: true, description: "Wok-tossed sweet corn kernels with scallions and black pepper." },
    { name: "Murgh Malai Tikka", price: 380, categoryId: starters.id, isVeg: false, description: "Tender chicken chunks marinated in cream cheese and roasted garlic." },

    // 3 Mains
    { name: "Dal Makhani Grand", price: 340, categoryId: mains.id, isVeg: true, description: "Black lentils slow-cooked overnight with creamy churned butter." },
    { name: "Paneer Lababdar", price: 360, categoryId: mains.id, isVeg: true, description: "Cottage cheese in rich tomato, onion & cashew nut gravy." },
    { name: "Old Delhi Butter Chicken", price: 460, categoryId: mains.id, isVeg: false, description: "Smoked tandoori chicken simmered in creamy makhani sauce." },

    // 2 Breads & Rice
    { name: "Butter Garlic Naan", price: 95, categoryId: breads.id, isVeg: true, description: "Tandoor-baked leavened flatbread with minced garlic butter." },
    { name: "Hyderabadi Dum Biryani", price: 420, categoryId: breads.id, isVeg: false, description: "Layered basmati rice steamed with spiced chicken and saffron." },

    // 2 Beverages
    { name: "Classic Mint Mojito", price: 180, categoryId: beverages.id, isVeg: true, description: "Fresh mint leaves, sparkling soda, lime, and crushed ice." },
    { name: "Iced Caramel Cold Coffee", price: 210, categoryId: beverages.id, isVeg: true, description: "Espresso shot blended with vanilla cream and salted caramel." },

    // 2 Desserts
    { name: "Gulab Jamun with Rabdi", price: 190, categoryId: desserts.id, isVeg: true, description: "Warm reduced milk dumplings served with saffron clotted rabdi." },
    { name: "Molten Lava Chocolate Cake", price: 260, categoryId: desserts.id, isVeg: true, description: "Warm Belgian chocolate core paired with vanilla bean scoop." },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`Seeding complete: 1 Admin, 2 Waiters, 1 Kitchen, ${tables.length} Tables, ${menuItems.length} Menu Items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
