import { db } from "./server/db";
import { events, users, websites } from "./server/schema";

export async function seed() {
    console.log("Seeding...");

    await db.delete(events).execute();
    await db.delete(websites).execute();
    await db.delete(users).execute();

    const usersSample = [
        {
            id: 10,
            clerkId: "user1",
        },
        {
            id: 11,
            clerkId: "user2",
        },
        {
            id: 12,
            clerkId: "user3",
        },
        {
            id: 13,
            clerkId: "user4",
        },
        {
            id: 14,
            clerkId: "user5",
        },
    ];

    await db.insert(users).values(usersSample).execute();

    const websitesSample = [
        {
            id: 0,
            url: "https://google.com",
            name: "Google",
            userId: 10,
        },
        {
            id: 1,
            url: "https://facebook.com",
            name: "Facebook",
            userId: 11,
        },
        {
            id: 2,
            url: "https://youtube.com",
            name: "YouTube",
            userId: 12,
        },
        {
            id: 3,
            url: "https://wikipedia.org",
            name: "Wikipedia",
            userId: 13,
        },
        {
            id: 4,
            url: "https://yahoo.com",
            name: "Yahoo",
            userId: 14,
        },
        {
            id: 5,
            url: "https://reddit.com",
            name: "Reddit",
            userId: 10,
        },
        {
            id: 6,
            url: "https://amazon.com",
            name: "Amazon",
            userId: 11,
        },
        {
            id: 7,
            url: "https://twitter.com",
            name: "Twitter",
            userId: 12,
        },
        {
            id: 8,
            url: "https://instagram.com",
            name: "Instagram",
            userId: 13,
        },
        {
            id: 9,
            url: "https://fandom.com",
            name: "Fandom",
            userId: 14,
        },
    ];

    await db.insert(websites).values(websitesSample).execute();

    const maxEvents = 1_000_000;

    for (const website of websitesSample) {
        const eventsSample = [];

        for (let i = 0; i < Math.floor(Math.random() * maxEvents) + 50; i++) {
            const start = new Date(2022, 10, 1);
            const end = new Date(2023, 11, 1);
            const timestamp = new Date(
                start.getTime() +
                    Math.random() * (end.getTime() - start.getTime())
            );

            const userAgents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) " +
                    "Gecko/20100101 Firefox/53.0",
                "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; " +
                    "Trident/5.0; Trident/5.0)",
                "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; " +
                    "Trident/6.0; MDDCJS)",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
                "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)",
            ];

            const userAgent =
                userAgents[Math.floor(Math.random() * userAgents.length)];

            const referrer =
                // @ts-ignore
                websitesSample[
                    Math.floor(Math.random() * websitesSample.length)
                ].url;

            eventsSample.push({
                id: i + website.id * maxEvents,
                timestamp,
                page: website.url,
                userAgent,
                referrer,
                region: null,
                city: null,
                country: null,
                eventType: "pageview",
                host: website.url,
            });
        }
        await db.insert(events).values(eventsSample).execute();
    }

    console.log("Done seeding.");
}
