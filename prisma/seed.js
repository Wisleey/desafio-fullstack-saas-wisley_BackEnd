const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Planos de exemplo
  const planos = [
    {
      // id: "d4be9479-20b9-4fe0-ad0a-a7c8f9d8b73a", // Opcional: usar o mesmo ID se quiser
      name: "Plano Anual",
      price: 99.99,
      duration: "annual",
    },
    {
      // id: "e7a8e3c3-d43e-449b-a53a-b3a6d7c2e18f",
      name: "Plano Mensal",
      price: 9.99,
      duration: "monthly",
    },
  ];

  for (const plano of planos) {
    await prisma.plan.upsert({
      where: { name: plano.name }, // <-- Corrigido: Usar 'name' para verificar a existência
      update: {
        // Atualizar se o name já existir
        price: plano.price,
        duration: plano.duration,
      },
      create: {
        // Criar se o name não existir
        name: plano.name,
        price: plano.price,
        duration: plano.duration,
      },
    });
    console.log(`Plano "${plano.name}" adicionado/atualizado.`);
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
