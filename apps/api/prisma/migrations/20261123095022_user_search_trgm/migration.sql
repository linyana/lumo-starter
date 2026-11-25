CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE INDEX "users_email_name_idx" ON "users" USING GIN ("email" gin_trgm_ops, "name" gin_trgm_ops);
