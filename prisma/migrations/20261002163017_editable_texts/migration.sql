-- CreateTable
CREATE TABLE "TextOverride" (
    "key" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextOverride_pkey" PRIMARY KEY ("key","lang")
);

-- CreateTable
CREATE TABLE "ContentList" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentList_pkey" PRIMARY KEY ("key")
);
