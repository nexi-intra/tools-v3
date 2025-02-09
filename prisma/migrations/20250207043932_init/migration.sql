-- CreateTable
CREATE TABLE "SynchronizationLog" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "category" VARCHAR NOT NULL,
    "details" JSONB,
    "hasError" BOOLEAN NOT NULL,
    "error" VARCHAR,

    CONSTRAINT "SynchronizationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPoint" (
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

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "action" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,
    "entity" VARCHAR NOT NULL,
    "entityid" VARCHAR NOT NULL,
    "actor" VARCHAR NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
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
    "layout" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
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
    "color" VARCHAR,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "region_id" INTEGER NOT NULL,
    "sortorder" VARCHAR,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "code" VARCHAR NOT NULL,
    "sortorder" VARCHAR,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purpose" (
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
    "toolId" INTEGER,

    CONSTRAINT "Purpose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "sortOrder" VARCHAR,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "data" JSONB,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "koksmat_masterdataref" VARCHAR,
    "koksmat_masterdata_id" VARCHAR,
    "koksmat_masterdata_etag" VARCHAR,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "url" VARCHAR NOT NULL,
    "status" VARCHAR,
    "documents" JSONB,
    "metadata" JSONB,
    "icon" VARCHAR,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolGroup" (
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
    "metadata" JSONB,

    CONSTRAINT "ToolGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
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

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "email" VARCHAR NOT NULL,
    "firstname" VARCHAR,
    "lastname" VARCHAR,
    "status" VARCHAR,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
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

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_accesspoint_name" ON "AccessPoint"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_category_name" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_country_name" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_language_name" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_purpose_name" ON "Purpose"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_region_name" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_toolgroup_name" ON "ToolGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_usergroup_name" ON "UserGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_userprofile_name" ON "UserProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_userrole_name" ON "UserRole"("name");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Purpose" ADD CONSTRAINT "Purpose_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
