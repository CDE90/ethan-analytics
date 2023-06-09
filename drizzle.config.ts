import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

let connectionString = process.env.DATABASE_URL ?? "";

// if it ends in sslaccept=strict, remove it
if (connectionString.endsWith("sslaccept=strict")) {
    connectionString = connectionString.replace(
        "sslaccept=strict",
        'ssl={"rejectUnauthorized":true}'
    );
}

export default {
    schema: "./src/server/schema.ts",
    out: "./drizzle",
    connectionString,
} satisfies Config;
