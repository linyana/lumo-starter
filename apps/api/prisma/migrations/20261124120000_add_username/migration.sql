ALTER TABLE "users" ADD COLUMN "username" VARCHAR(32);

WITH base AS (
    SELECT
        "id",
        CASE
            WHEN length(trim(both '_' from lower(regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9_]', '_', 'g')))) >= 3
                THEN trim(both '_' from lower(regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9_]', '_', 'g')))
            ELSE 'user_' || left(replace("id"::text, '-', ''), 8)
        END AS seed
    FROM "users"
), ranked AS (
    SELECT
        "id",
        left("seed", 27) AS seed,
        row_number() OVER (PARTITION BY left("seed", 27) ORDER BY "id") AS position
    FROM base
)
UPDATE "users" AS u
SET "username" = CASE
    WHEN r.position = 1 THEN r.seed
    ELSE left(r.seed, 20) || '_' || left(replace(r."id"::text, '-', ''), 8)
END
FROM ranked AS r
WHERE u."id" = r."id";

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

DROP INDEX "users_email_name_idx";

CREATE INDEX "users_email_name_username_idx" ON "users" USING GIN ("email" gin_trgm_ops, "username" gin_trgm_ops, "name" gin_trgm_ops);
