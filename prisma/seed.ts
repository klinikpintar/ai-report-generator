import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = await hash(process.env.ADMIN_PASSWORD!, 10);
  const analystEmail = process.env.ANALYST_EMAIL!;
  const analystPassword = await hash(process.env.ANALYST_PASSWORD!, 10);

  const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY!;

  // 1. Users
  await Promise.all([
    prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: adminPassword,
        name: "Super Admin",
        role: "ADMIN",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: analystEmail },
      update: {},
      create: {
        email: analystEmail,
        password: analystPassword,
        name: "Business Analyst",
        role: "BUSINESS_ANALYST",
        isActive: true,
      },
    }),
  ]);

  // 2. Providers
  const [gemini, deepseek] = await Promise.all([
    prisma.provider.upsert({
      where: { name: "Gemini" },
      update: {},
      create: {
        id: "fd9671f0-eb6b-4bc6-890c-fb269244b169",
        name: "Gemini",
        displayName: "Gemini AI",
        apiKey: geminiApiKey,
        isActive: true,
        isDefault: true,
      },
    }),
    prisma.provider.upsert({
      where: { name: "DeepSeek" },
      update: {},
      create: {
        id: "0d595293-1ce1-455b-8afc-a079e020540d",
        name: "DeepSeek",
        displayName: "DeepSeek AI",
        apiKey: deepseekApiKey,
        isActive: true,
        isDefault: false,
      },
    }),
  ]);

  // 3. AI Models
  const models = [
    {
      id: "0546b045-cb04-4675-be87-35011e235773",
      name: "DeepSeek-V3",
      modelIdentifier: "deepseek-chat",
      providerId: deepseek.id,
      isDefault: true,
      isAvailable: true,
    },
    {
      id: "47930e44-8f6d-4af3-896e-f998ce3df73c",
      name: "DeepSeek-R1",
      modelIdentifier: "deepseek-reasoner",
      providerId: deepseek.id,
      isDefault: false,
      isAvailable: true,
    },
    {
      id: "0f80feb6-5bec-4a2c-a1ce-974fe8287bbb",
      name: "Gemini 1.5 Pro",
      modelIdentifier: "gemini-1.5-pro",
      providerId: gemini.id,
      isDefault: false,
      isAvailable: true,
    },
    {
      id: "5f867547-6707-47b8-8d10-5bb964f18fa7",
      name: "Gemini 2.0 Flash",
      modelIdentifier: "gemini-2.0-flash",
      providerId: gemini.id,
      isDefault: true,
      isAvailable: true,
    },
    {
      id: "cde74863-4ad9-45fe-8c82-50ee62bb50da",
      name: "Gemini 2.0 Flash-Lite",
      modelIdentifier: "gemini-2.0-flash-lite",
      providerId: gemini.id,
      isDefault: false,
      isAvailable: true,
    },
    {
      id: "fa4a7c86-cd8d-46b7-9892-4b7a4309d7f8",
      name: "Gemini 1.5 Flash",
      modelIdentifier: "gemini-1.5-flash",
      providerId: gemini.id,
      isDefault: false,
      isAvailable: true,
    },
  ];

  await Promise.all(
    models.map((model) =>
      prisma.aIModel.upsert({
        where: { id: model.id },
        update: {},
        create: model,
      })
    )
  );

  // 4. Set active models
  await Promise.all([
    prisma.provider.update({
      where: { id: gemini.id },
      data: { activeModelId: "5f867547-6707-47b8-8d10-5bb964f18fa7" },
    }),
    prisma.provider.update({
      where: { id: deepseek.id },
      data: { activeModelId: "0546b045-cb04-4675-be87-35011e235773" },
    }),
  ]);

  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
