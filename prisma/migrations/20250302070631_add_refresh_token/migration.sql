-- CreateTable
CREATE TABLE "RefreshToken" (
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("userId","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
