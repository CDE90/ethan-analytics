import { db } from "./server/db";

export async function seed() {
    console.log("Seeding...");

    await db.deleteFrom("Event").execute();
    await db.deleteFrom("Website").execute();
    await db.deleteFrom("User").execute();

    const users = [
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

    await db.insertInto("User").values(users).execute();

    const websites = [
        {
            id: 1,
            url: "https://google.com",
            name: "Google",
            userId: 10,
        },
        {
            id: 2,
            url: "https://facebook.com",
            name: "Facebook",
            userId: 11,
        },
        {
            id: 3,
            url: "https://youtube.com",
            name: "YouTube",
            userId: 12,
        },
        {
            id: 4,
            url: "https://wikipedia.org",
            name: "Wikipedia",
            userId: 13,
        },
        {
            id: 5,
            url: "https://yahoo.com",
            name: "Yahoo",
            userId: 14,
        },
        {
            id: 6,
            url: "https://reddit.com",
            name: "Reddit",
            userId: 10,
        },
        {
            id: 7,
            url: "https://amazon.com",
            name: "Amazon",
            userId: 11,
        },
        {
            id: 8,
            url: "https://twitter.com",
            name: "Twitter",
            userId: 12,
        },
        {
            id: 9,
            url: "https://instagram.com",
            name: "Instagram",
            userId: 13,
        },
        {
            id: 10,
            url: "https://fandom.com",
            name: "Fandom",
            userId: 14,
        },
    ];

    await db.insertInto("Website").values(websites).execute();

    const events = [];

    for (const website of websites) {
        for (let i = 0; i < Math.floor(Math.random() * 10000) + 50; i++) {
            // get a random date between 1/1/2020 and 1/1/2021
            const start = new Date(2020, 0, 1);
            const end = new Date(2021, 0, 1);
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
                websites[Math.floor(Math.random() * websites.length)].url;

            events.push({
                id: i + website.id * 10000,
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
    }

    await db.insertInto("Event").values(events).execute();

    console.log("Done seeding.");
}
