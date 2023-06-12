import { eq, gte, and, lte } from "drizzle-orm";
import { db } from "~/server/db";
import { websites, events } from "~/server/schema";
import { AreaChart, Card, Title } from "@tremor/react";

export const runtime = "edge";

type GroupBy = "hour" | "day" | "month" | "year";

async function getData(host: string, groupBy: GroupBy) {
    let dateFrom;
    switch (groupBy) {
        case "hour":
            dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
            break;
        case "day":
            dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            break;
        case "year":
            dateFrom = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
            break;
    }

    const eventsData = await db
        .select({
            id: events.id,
            eventType: events.eventType,
            host: events.host,
            page: events.page,
            referrer: events.referrer,
            timestamp: events.timestamp,
        })
        .from(events)
        .where(
            and(
                gte(events.timestamp, dateFrom),
                lte(events.timestamp, new Date(Date.now())),
                eq(events.host, host)
            )
        )
        .orderBy(events.timestamp)
        .execute();

    return eventsData;
}

interface Event {
    timestamp: Date | null;
}

function getMonday(d: Date) {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

    return new Date(d.setDate(diff));
}

function getMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function groupData<T extends Event>(
    data: T[],
    groupBy: GroupBy
): { [key: string]: T[] } {
    switch (groupBy) {
        case "hour":
            return data.reduce((acc, event) => {
                const hour = `${event.timestamp?.getHours()}:00`;

                if (hour) {
                    if (acc[hour]) {
                        acc[hour]?.push(event);
                    } else {
                        acc[hour] = [event];
                    }
                }
                return acc;
            }, {} as { [key: string]: typeof data });
        case "day":
            return data.reduce((acc, event) => {
                const day = event.timestamp?.toLocaleDateString();

                if (day) {
                    if (acc[day]) {
                        acc[day]?.push(event);
                    } else {
                        acc[day] = [event];
                    }
                }
                return acc;
            }, {} as { [key: string]: typeof data });
        case "month":
            return data.reduce((acc, event) => {
                const month = getMonth(event.timestamp!).toLocaleDateString();

                if (month) {
                    if (acc[month]) {
                        acc[month]?.push(event);
                    } else {
                        acc[month] = [event];
                    }
                }
                return acc;
            }, {} as { [key: string]: typeof data });
        case "year":
            return data.reduce((acc, event) => {
                const year = event.timestamp?.getFullYear().toString();

                if (year) {
                    if (acc[year]) {
                        acc[year]?.push(event);
                    } else {
                        acc[year] = [event];
                    }
                }
                return acc;
            }, {} as { [key: string]: typeof data });
    }
}

function getChartData(data: { [key: number]: Event[] }, groupBy: GroupBy) {
    const chartData = Object.entries(data).map(([date, data]) => {
        return {
            date: date,
            events: data.length,
        };
    });

    return chartData;
}

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

    const groupBy = "day" as GroupBy;

    const eventsData = await getData(host, groupBy);

    const eventsByHour = groupData(eventsData, groupBy);

    const chartData = getChartData(eventsByHour, groupBy);

    // TODO: ensure that the full date range is covered, even if there are no events
    // TODO: add a date picker to select the date range (store as a query param)
    // TODO: add a dropdown to select the group by (hour, day, week, month, year) (store as a query param)
    // maybe switch to some sane defaults such as:
    // - last 24 hours, grouped by hour
    // - last 7 days, grouped by day
    // - last 30 days, grouped by day
    // - month to date, grouped by day
    // - year to date, grouped by month
    // - last 12 months, grouped by month
    // - all time, grouped by month (quarter, year? custom?) (only from the time the website was added to the dashboard)
    // - custom date range, automatically grouped by how many days are in the range (or maybe a dropdown to select the group by)

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Host: {params.host}</p>
            <p>Website ID: {websiteData[0]?.id}</p>
            <p>Website Name: {websiteData[0]?.name}</p>
            <Card>
                <Title>
                    Events by{" "}
                    {groupBy === "hour"
                        ? "Hour"
                        : groupBy === "day"
                        ? "Day"
                        : groupBy === "month"
                        ? "Month"
                        : groupBy === "year"
                        ? "Year"
                        : ""}
                </Title>
                <AreaChart
                    className="h-72 mt-4"
                    data={chartData}
                    index="date"
                    categories={["events"]}
                    colors={["indigo"]}
                />
            </Card>
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
