/*
  Warnings:

  - You are about to drop the column `closeDate` on the `deals` table. All the data in the column will be lost.
  - The `stage` column on the `deals` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "DealPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "deals" DROP COLUMN "closeDate",
ADD COLUMN     "actualCloseDate" TIMESTAMP(3),
ADD COLUMN     "expectedCloseDate" TIMESTAMP(3),
ADD COLUMN     "forecastedValue" DOUBLE PRECISION,
ADD COLUMN     "nextSteps" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" "DealPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "winProbability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
DROP COLUMN "stage",
ADD COLUMN     "stage" "DealStage" NOT NULL DEFAULT 'PROSPECT';
