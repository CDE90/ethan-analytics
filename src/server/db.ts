import { drizzle } from "drizzle-orm/planetscale-serverless";
import { InferModel } from "drizzle-orm";
import { connect } from "@planetscale/database";
import { env } from "~/env.mjs";
import { events, users, websites } from "./schema";

export type User = InferModel<typeof users>;
export type Website = InferModel<typeof websites>;
export type Event = InferModel<typeof events>;

export type NewUser = InferModel<typeof users, "insert">;
export type NewWebsite = InferModel<typeof websites, "insert">;
export type NewEvent = InferModel<typeof events, "insert">;

const connection = connect({
    url: env.DATABASE_URL,
});

export const db = drizzle(connection);
