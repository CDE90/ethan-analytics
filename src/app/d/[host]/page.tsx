import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { websites, events } from "~/server/schema";

export default async function DashboardPage({
    params,
}: {
    params: { host: string };
}) {
    console.log(params.host);
    let host = params.host;
    // slightly janky
    // TODO: don't store http/https in the database
    // add https:// if it's not there
    if (!host.startsWith("http")) {
        host = "https://" + params.host;
    }
    const websiteData = await db
        .select()
        .from(websites)
        .where(eq(websites.url, host))
        .execute();

    if (!websiteData || websiteData.length === 0) {
        return <div>Website not found</div>;
    }

    const eventsData = await db
        .select()
        .from(events)
        .where(eq(events.host, host))
        .execute();

    // count how many events there are per day
    const eventsPerDay: { [key: string]: number } = {};
    eventsData.forEach((event) => {
        const date = event.timestamp?.toLocaleDateString();
        if (date) {
            if (eventsPerDay[date]) {
                eventsPerDay[date] += 1;
            } else {
                eventsPerDay[date] = 1;
            }
        }
    });

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Host: {params.host}</p>
            <p>Website ID: {websiteData[0]?.id}</p>
            <p>Website Name: {websiteData[0]?.name}</p>
            <div className="flex flex-wrap">
                {eventsData.map((event) => (
                    <div
                        key={event.id}
                        className="bg-gray-800 rounded-md border-white border p-2 w-64"
                    >
                        <p>Event ID: {event.id}</p>
                        <p>Event Type: {event.eventType}</p>
                        <p>Event Host: {event.host}</p>
                        <p>Event Page: {event.page}</p>
                        <p>Event Referrer: {event.referrer}</p>
                        <p>
                            Event Timestamp: {event.timestamp?.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
