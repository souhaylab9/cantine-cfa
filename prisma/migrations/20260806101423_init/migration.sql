-- CreateTable
CREATE TABLE "Apprenti" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "groupe" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apprentiId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'non_pointe',
    "heurePointage" TEXT,
    "methode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Presence_apprentiId_fkey" FOREIGN KEY ("apprentiId") REFERENCES "Apprenti" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "motDePasseHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Apprenti_identifiant_key" ON "Apprenti"("identifiant");

-- CreateIndex
CREATE INDEX "Apprenti_nom_prenom_idx" ON "Apprenti"("nom", "prenom");

-- CreateIndex
CREATE INDEX "Presence_date_idx" ON "Presence"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_apprentiId_date_key" ON "Presence"("apprentiId", "date");
