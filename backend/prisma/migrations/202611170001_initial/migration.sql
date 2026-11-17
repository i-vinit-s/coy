CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "photoUrl" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "college" TEXT NOT NULL,
  "interests" JSONB NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Swipe" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "action" TEXT NOT NULL CHECK ("action" IN ('LIKE', 'PASS')),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Swipe_no_self" CHECK ("userId" <> "profileId"),
  CONSTRAINT "Swipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Swipe_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Swipe_userId_profileId_key" ON "Swipe"("userId", "profileId");
CREATE INDEX "Swipe_profileId_action_idx" ON "Swipe"("profileId", "action");
