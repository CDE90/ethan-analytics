import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;
export type Event = {
    id: Generated<number>;
    timestamp: Generated<Timestamp>;
    url: string;
    userAgent: string | null;
    referrer: string | null;
    region: string | null;
    city: string | null;
    country: string | null;
    eventType: string;
    websiteUrl: string;
};
export type Example = {
    id: Generated<number>;
    name: string;
    age: number;
};
export type User = {
    id: Generated<number>;
    clerkId: string;
};
export type Website = {
    id: Generated<number>;
    url: string;
    name: string;
    userId: number;
};
export type DB = {
    Event: Event;
    Example: Example;
    User: User;
    Website: Website;
};
