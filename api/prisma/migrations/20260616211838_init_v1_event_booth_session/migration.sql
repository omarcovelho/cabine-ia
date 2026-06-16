-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Default Event',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BoothConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'booth',
    "activeEventId" TEXT NOT NULL,
    "activeThemeId" TEXT NOT NULL DEFAULT 'stub-a',
    CONSTRAINT "BoothConfig_activeEventId_fkey" FOREIGN KEY ("activeEventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "sceneId" TEXT,
    "phase" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BoothConfig_activeEventId_key" ON "BoothConfig"("activeEventId");
