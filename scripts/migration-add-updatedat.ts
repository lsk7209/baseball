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

    const sql = `ALTER TABLE "Post" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`;

    try {
        console.log("Adding updatedAt column to Post table...");
        await client.execute(sql);
        console.log("Successfully added updatedAt column.");
    } catch (e) {
        console.error("Error executing migration:");
        console.error(e);
    }
}

main();
