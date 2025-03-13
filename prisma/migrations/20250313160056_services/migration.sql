-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "services";

-- CreateTable
CREATE TABLE "services"."ServicesService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "throttleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requestsPerMinute" INTEGER,
    "requestsPerHour" INTEGER,
    "requestsPerDay" INTEGER,

    CONSTRAINT "ServicesService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesEndpoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "throttleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requestsPerMinute" INTEGER,
    "requestsPerHour" INTEGER,
    "requestsPerDay" INTEGER,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServicesEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesParameter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpointId" TEXT NOT NULL,

    CONSTRAINT "ServicesParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesResponseSchema" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpointId" TEXT NOT NULL,

    CONSTRAINT "ServicesResponseSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesSchemaProperty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "format" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responseSchemaId" TEXT NOT NULL,

    CONSTRAINT "ServicesSchemaProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesRequestLog" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "endpointName" TEXT,
    "requestId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "async" BOOLEAN NOT NULL DEFAULT false,
    "timeout" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "response" JSONB,
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT,
    "clientIp" TEXT,

    CONSTRAINT "ServicesRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "throttleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requestsPerMinute" INTEGER,
    "requestsPerHour" INTEGER,
    "requestsPerDay" INTEGER,

    CONSTRAINT "ServicesApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."ServicesUsageRecord" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "endpointId" TEXT,
    "apiKeyId" TEXT,
    "clientIp" TEXT,
    "minute" TIMESTAMP(3),
    "hour" TIMESTAMP(3),
    "day" TIMESTAMP(3),
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services"."_ServiceToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicesService_name_key" ON "services"."ServicesService"("name");

-- CreateIndex
CREATE INDEX "ServicesService_name_idx" ON "services"."ServicesService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesTag_name_key" ON "services"."ServicesTag"("name");

-- CreateIndex
CREATE INDEX "ServicesTag_name_idx" ON "services"."ServicesTag"("name");

-- CreateIndex
CREATE INDEX "ServicesEndpoint_name_idx" ON "services"."ServicesEndpoint"("name");

-- CreateIndex
CREATE INDEX "ServicesEndpoint_deprecated_idx" ON "services"."ServicesEndpoint"("deprecated");

-- CreateIndex
CREATE INDEX "ServicesEndpoint_version_idx" ON "services"."ServicesEndpoint"("version");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesEndpoint_serviceId_name_version_key" ON "services"."ServicesEndpoint"("serviceId", "name", "version");

-- CreateIndex
CREATE INDEX "ServicesParameter_name_idx" ON "services"."ServicesParameter"("name");

-- CreateIndex
CREATE INDEX "ServicesParameter_type_idx" ON "services"."ServicesParameter"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesParameter_endpointId_name_key" ON "services"."ServicesParameter"("endpointId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesResponseSchema_endpointId_key" ON "services"."ServicesResponseSchema"("endpointId");

-- CreateIndex
CREATE INDEX "ServicesSchemaProperty_name_idx" ON "services"."ServicesSchemaProperty"("name");

-- CreateIndex
CREATE INDEX "ServicesSchemaProperty_type_idx" ON "services"."ServicesSchemaProperty"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesSchemaProperty_responseSchemaId_name_key" ON "services"."ServicesSchemaProperty"("responseSchemaId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesRequestLog_requestId_key" ON "services"."ServicesRequestLog"("requestId");

-- CreateIndex
CREATE INDEX "ServicesRequestLog_serviceName_idx" ON "services"."ServicesRequestLog"("serviceName");

-- CreateIndex
CREATE INDEX "ServicesRequestLog_status_idx" ON "services"."ServicesRequestLog"("status");

-- CreateIndex
CREATE INDEX "ServicesRequestLog_createdAt_idx" ON "services"."ServicesRequestLog"("createdAt");

-- CreateIndex
CREATE INDEX "ServicesRequestLog_apiKeyId_idx" ON "services"."ServicesRequestLog"("apiKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesApiKey_key_key" ON "services"."ServicesApiKey"("key");

-- CreateIndex
CREATE INDEX "ServicesApiKey_key_idx" ON "services"."ServicesApiKey"("key");

-- CreateIndex
CREATE INDEX "ServicesApiKey_active_idx" ON "services"."ServicesApiKey"("active");

-- CreateIndex
CREATE INDEX "ServicesUsageRecord_minute_idx" ON "services"."ServicesUsageRecord"("minute");

-- CreateIndex
CREATE INDEX "ServicesUsageRecord_hour_idx" ON "services"."ServicesUsageRecord"("hour");

-- CreateIndex
CREATE INDEX "ServicesUsageRecord_day_idx" ON "services"."ServicesUsageRecord"("day");

-- CreateIndex
CREATE INDEX "ServicesUsageRecord_clientIp_idx" ON "services"."ServicesUsageRecord"("clientIp");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_serviceId_minute_key" ON "services"."ServicesUsageRecord"("serviceId", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_serviceId_hour_key" ON "services"."ServicesUsageRecord"("serviceId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_serviceId_day_key" ON "services"."ServicesUsageRecord"("serviceId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_endpointId_minute_key" ON "services"."ServicesUsageRecord"("endpointId", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_endpointId_hour_key" ON "services"."ServicesUsageRecord"("endpointId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_endpointId_day_key" ON "services"."ServicesUsageRecord"("endpointId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_apiKeyId_minute_key" ON "services"."ServicesUsageRecord"("apiKeyId", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_apiKeyId_hour_key" ON "services"."ServicesUsageRecord"("apiKeyId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_apiKeyId_day_key" ON "services"."ServicesUsageRecord"("apiKeyId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_clientIp_minute_key" ON "services"."ServicesUsageRecord"("clientIp", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_clientIp_hour_key" ON "services"."ServicesUsageRecord"("clientIp", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesUsageRecord_clientIp_day_key" ON "services"."ServicesUsageRecord"("clientIp", "day");

-- CreateIndex
CREATE INDEX "_ServiceToTag_B_index" ON "services"."_ServiceToTag"("B");

-- AddForeignKey
ALTER TABLE "services"."ServicesEndpoint" ADD CONSTRAINT "ServicesEndpoint_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"."ServicesService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesParameter" ADD CONSTRAINT "ServicesParameter_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "services"."ServicesEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesResponseSchema" ADD CONSTRAINT "ServicesResponseSchema_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "services"."ServicesEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesSchemaProperty" ADD CONSTRAINT "ServicesSchemaProperty_responseSchemaId_fkey" FOREIGN KEY ("responseSchemaId") REFERENCES "services"."ServicesResponseSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesUsageRecord" ADD CONSTRAINT "ServicesUsageRecord_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"."ServicesService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesUsageRecord" ADD CONSTRAINT "ServicesUsageRecord_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "services"."ServicesEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."ServicesUsageRecord" ADD CONSTRAINT "ServicesUsageRecord_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "services"."ServicesApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."_ServiceToTag" ADD CONSTRAINT "_ServiceToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "services"."ServicesService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services"."_ServiceToTag" ADD CONSTRAINT "_ServiceToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "services"."ServicesTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
