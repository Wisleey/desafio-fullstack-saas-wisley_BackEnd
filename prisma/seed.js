const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");
  // Crie seus planos aqui
  const monthlyPlan = await prisma.plan.create({
    data: {
      name: "Plano Mensal",
      price: 9.99,
      duration: "monthly",
    },
  });
  console.log(`Created plan with id: ${monthlyPlan.id}`);

  const annualPlan = await prisma.plan.create({
    data: {
      name: "Plano Anual",
      price: 99.99,
      duration: "annual",
    },
  });
  console.log(`Created plan with id: ${annualPlan.id}`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
