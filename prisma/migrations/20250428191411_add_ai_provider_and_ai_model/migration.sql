-- CreateTable
CREATE TABLE "Provider" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "activeModelId" UUID,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "modelIdentifier" VARCHAR(255) NOT NULL,
    "providerId" UUID NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_activeModelId_key" ON "Provider"("activeModelId");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_providerId_name_key" ON "AIModel"("providerId", "name");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_activeModelId_fkey" FOREIGN KEY ("activeModelId") REFERENCES "AIModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
