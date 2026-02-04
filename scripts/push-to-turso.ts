import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("Missing TURSO env vars");
        process.exit(1);
    }

    const client = createClient({
        url,
        authToken,
    });

    const statements = [
        `CREATE TABLE IF NOT EXISTS "Category" (
        "slug" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL
    )`,

        `CREATE TABLE IF NOT EXISTS "Persona" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nickname" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "role" TEXT NOT NULL,
        "traits" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Persona_nickname_key" ON "Persona"("nickname")`,

        `CREATE TABLE IF NOT EXISTS "Guest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionKeyHash" TEXT NOT NULL,
        "nickname" TEXT NOT NULL,
        "passwordHash" TEXT,
        "ipHash" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Guest_sessionKeyHash_key" ON "Guest"("sessionKeyHash")`,

        `CREATE TABLE IF NOT EXISTS "Post" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'NORMAL',
        "content" TEXT,
        "summaryJson" TEXT,
        "sourceType" TEXT NOT NULL DEFAULT 'NONE',
        "sourceUrl" TEXT,
        "sourceProvider" TEXT,
        "sourceTitle" TEXT,
        "sourceVideoId" TEXT,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "likeCount" INTEGER NOT NULL DEFAULT 0,
        "commentCount" INTEGER NOT NULL DEFAULT 0,
        "trendingScore" REAL NOT NULL DEFAULT 0,
        "personaId" TEXT,
        "guestId" TEXT,
        "categorySlug" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("categorySlug") REFERENCES "Category" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
        `CREATE INDEX IF NOT EXISTS "Post_trendingScore_createdAt_idx" ON "Post"("trendingScore", "createdAt")`,
        `CREATE INDEX IF NOT EXISTS "Post_categorySlug_createdAt_idx" ON "Post"("categorySlug", "createdAt")`,
        `CREATE INDEX IF NOT EXISTS "Post_sourceUrl_idx" ON "Post"("sourceUrl")`,

        `CREATE TABLE IF NOT EXISTS "Comment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "passwordHash" TEXT,
        "ipHash" TEXT,
        "postId" TEXT NOT NULL,
        "personaId" TEXT,
        "guestId" TEXT,
        "parentId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,

        `CREATE TABLE IF NOT EXISTS "DebateMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "postId" TEXT NOT NULL,
        "personaId" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "DebateMessage_postId_order_key" ON "DebateMessage"("postId", "order")`,

        `CREATE TABLE IF NOT EXISTS "PostVote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "postId" TEXT NOT NULL,
        "guestId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "PostVote_postId_guestId_key" ON "PostVote"("postId", "guestId")`,

        `CREATE TABLE IF NOT EXISTS "PostView" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "postId" TEXT NOT NULL,
        "guestId" TEXT,
        "fingerprintHash" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`
    ];

    console.log(`Executing ${statements.length} statements...`);

    for (const stmt of statements) {
        try {
            await client.execute(stmt);
            console.log("Executed successfully.");
        } catch (e) {
            console.error("Error executing statement:", stmt);
            console.error(e);
        }
    }

    console.log("Migration completed.");
}

main();
