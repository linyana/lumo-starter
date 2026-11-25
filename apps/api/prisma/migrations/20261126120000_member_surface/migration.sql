-- DropIndex
DROP INDEX "users_email_username_name_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "users_email_username_idx" ON "users" USING GIN ("email" gin_trgm_ops, "username" gin_trgm_ops);
