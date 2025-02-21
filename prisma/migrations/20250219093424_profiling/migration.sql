-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "channelId" INTEGER;

-- CreateTable
CREATE TABLE "BusinessUnit" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "code" VARCHAR,
    "description" VARCHAR,
    "translations" JSONB,
    "sortorder" VARCHAR,
    "groupFunction" BOOLEAN NOT NULL,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestDomain" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "sortorder" VARCHAR,

    CONSTRAINT "GuestDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelCategory" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "sortorder" VARCHAR,

    CONSTRAINT "ChannelCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "translations" JSONB,
    "sortorder" VARCHAR,
    "regionId" INTEGER NOT NULL,
    "externalGroup" VARCHAR,
    "categoryId" INTEGER,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_businessunit_name" ON "BusinessUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_businessunit_code" ON "BusinessUnit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_guestdomain_name" ON "GuestDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_channelcategory_name" ON "ChannelCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_channel_name" ON "Channel"("name");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChannelCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
