import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../src/lib/constants/defaultCategories";
import { COMPONENT_CATALOG } from "../src/lib/constants/componentTypes";

const prisma = new PrismaClient();

async function main() {
  for (const def of DEFAULT_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        icon: def.icon,
        color: def.color,
        isDefault: true,
      },
    });

    for (const subName of def.subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: category.id, name: subName } },
        update: {},
        create: { name: subName, categoryId: category.id },
      });
    }
  }

  const cocheCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "coche" } });
  const existingCar = await prisma.item.findFirst({ where: { categoryId: cocheCategory.id, type: "CAR" } });

  if (!existingCar) {
    const car = await prisma.item.create({
      data: {
        categoryId: cocheCategory.id,
        type: "CAR",
        name: "Ibiza 2018",
        metadata: { brand: "Seat", model: "Ibiza", year: 2018, currentKm: 68000 },
      },
    });

    for (const def of COMPONENT_CATALOG.CAR) {
      await prisma.maintenanceComponent.create({
        data: {
          itemId: car.id,
          componentType: def.componentType,
          zoneKey: def.zoneKey,
          label: def.label,
          ruleType: def.ruleType,
          intervalKm: def.intervalKm,
          intervalDays: def.intervalDays,
          warningKm: def.warningKm,
          warningDays: def.warningDays,
        },
      });
    }

    console.log(`Coche de ejemplo creado: ${car.name}`);
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
