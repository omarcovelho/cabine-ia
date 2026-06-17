-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BoothConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'booth',
    "activeEventId" TEXT NOT NULL,
    "activeThemeId" TEXT NOT NULL DEFAULT 'stub-a',
    "captureCountdownSeconds" INTEGER NOT NULL DEFAULT 3,
    "expectedFaceCount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BoothConfig_activeEventId_fkey" FOREIGN KEY ("activeEventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BoothConfig" ("activeEventId", "activeThemeId", "id") SELECT "activeEventId", "activeThemeId", "id" FROM "BoothConfig";
DROP TABLE "BoothConfig";
ALTER TABLE "new_BoothConfig" RENAME TO "BoothConfig";
CREATE UNIQUE INDEX "BoothConfig_activeEventId_key" ON "BoothConfig"("activeEventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
