import {
    int,
    serial,
    mysqlTable,
    uniqueIndex,
    varchar,
    datetime,
    index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }),
});

export const websites = mysqlTable(
    "websites",
    {
        id: serial("id").primaryKey(),
        url: varchar("url", { length: 256 }),
        name: varchar("name", { length: 256 }),

        userId: int("user_id"), //.references(() => users.id),
    },
    (websites) => ({
        urlIndex: uniqueIndex("url_idx").on(websites.url),
        userIdIndex: index("user_id_idx").on(websites.userId),
    })
);

export const events = mysqlTable(
    "events",
    {
        id: serial("id").primaryKey(),
        timestamp: datetime("timestamp"),
        page: varchar("page", { length: 256 }),
        userAgent: varchar("user_agent", { length: 256 }).default(""),
        referrer: varchar("referrer", { length: 256 }).default(""),
        region: varchar("region", { length: 256 }).default(""),
        city: varchar("city", { length: 256 }).default(""),
        country: varchar("country", { length: 256 }).default(""),
        eventType: varchar("event_type", { length: 256 }),

        websiteId: int("website_id"), //.references(() => websites.id),
        host: varchar("host", { length: 256 }),
    },
    (events) => ({
        hostIndex: index("host_idx").on(events.host),
        pageIndex: index("page_idx").on(events.page),
    })
);
