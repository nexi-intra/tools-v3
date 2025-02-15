-- CreateTable
CREATE TABLE "AppFeature" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "status" VARCHAR,
    "appMenuId" INTEGER,

    CONSTRAINT "AppFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppLink" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "url" VARCHAR NOT NULL,
    "status" VARCHAR,
    "appFeatureId" INTEGER,

    CONSTRAINT "AppLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppMenu" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "status" VARCHAR,
    "sortorder" DECIMAL(65,30),
    "parentId" INTEGER,
    "appLinkId" INTEGER NOT NULL,

    CONSTRAINT "AppMenu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_appfeature_name" ON "AppFeature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_applink_name" ON "AppLink"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_appmenu_name" ON "AppMenu"("name");

-- AddForeignKey
ALTER TABLE "AppFeature" ADD CONSTRAINT "AppFeature_appMenuId_fkey" FOREIGN KEY ("appMenuId") REFERENCES "AppMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLink" ADD CONSTRAINT "AppLink_appFeatureId_fkey" FOREIGN KEY ("appFeatureId") REFERENCES "AppFeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppMenu" ADD CONSTRAINT "AppMenu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AppMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppMenu" ADD CONSTRAINT "AppMenu_appLinkId_fkey" FOREIGN KEY ("appLinkId") REFERENCES "AppLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
