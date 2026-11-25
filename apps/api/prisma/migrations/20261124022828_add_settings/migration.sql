CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "ownerId" UUID NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "settings_type_ownerId_key" ON "settings"("type", "ownerId");

ALTER TABLE "settings" ADD CONSTRAINT "settings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
