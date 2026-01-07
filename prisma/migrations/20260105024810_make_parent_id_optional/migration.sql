-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "parent_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" DROP NOT NULL;
