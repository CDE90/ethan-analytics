"use client";

import { eq, gte, and, lte } from "drizzle-orm";
// import { db } from "~/server/db";
import { websites, events } from "~/server/schema";
import { AreaChart, Card, DateRangePicker, Title } from "@tremor/react";
import DatePicker, { DateRangePickerValue } from "~/components/date-picker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    sub,
    startOfToday,
    startOfMonth,
    startOfYear,
    endOfToday,
} from "date-fns";

export const runtime = "edge";

type GroupBy = "mins" | "hour" | "day" | "month";

// async function getData(host: string, dateRange: DateRangePickerValue) {
//     const eventsData = await db
//         .select({
//             id: events.id,
//             eventType: events.eventType,
//             host: events.host,
//             page: events.page,
//             referrer: events.referrer,
//             timestamp: events.timestamp,
//         })
//         .from(events)
//         .where(
//             and(
//                 gte(events.timestamp, dateRange.from),
//                 lte(events.timestamp, dateRange.to),
//                 eq(events.host, host)
//             )
//         )
//         .orderBy(events.timestamp)
//         .execute();

//     return eventsData;
// }

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

function getDefaultDates(searchParams?: { [key: string]: string | undefined }) {
    if (searchParams && searchParams.selectValue) {
        const selectValue = searchParams.selectValue;
        if (selectValue === "Last 1 hour") {
            return {
                from: sub(startOfToday(), { hours: 1 }),
                to: new Date(),
            };
        } else if (selectValue === "Yesterday") {
            return {
                from: sub(startOfToday(), { days: 1 }),
                to: sub(endOfToday(), { days: 1 }),
            };
        } else if (selectValue === "Today") {
            return {
                from: startOfToday(),
                to: endOfToday(),
            };
        } else if (selectValue === "Last 7 days") {
            return {
                from: sub(startOfToday(), { days: 7 }),
                to: new Date(),
            };
        } else if (selectValue === "Last 30 days") {
            return {
                from: sub(startOfToday(), { days: 30 }),
                to: new Date(),
            };
        } else if (selectValue === "Month to Date") {
            return {
                from: startOfMonth(startOfToday()),
                to: new Date(),
            };
        } else if (selectValue === "Last 90 days") {
            return {
                from: sub(startOfToday(), { days: 90 }),
                to: new Date(),
            };
        } else if (selectValue === "Last 1 year") {
            return {
                from: sub(startOfToday(), { years: 1 }),
                to: new Date(),
            };
        } else if (selectValue === "Year to Date") {
            return {
                from: startOfYear(startOfToday()),
                to: new Date(),
            };
        } else {
            return {
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                to: new Date(),
            };
        }
    } else if (searchParams && searchParams.from && searchParams.to) {
        return {
            from: searchParams.from
                ? new Date(searchParams.from)
                : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            to: searchParams.to ? new Date(searchParams.to) : new Date(),
        };
    } else {
        return {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            to: new Date(),
        };
    }
}

function generateArray(dateRange: DateRangePickerValue) {
    const fromDate = dateRange.from ?? getDefaultDates().from;
    const toDate = dateRange.to ?? getDefaultDates().to;

    const timeDiff = toDate.getTime() - fromDate.getTime();
    let dates: Date[] = [];

    let groupBy: GroupBy;
    if (timeDiff <= HOUR) {
        // group by mins
        groupBy = "mins";
    } else if (timeDiff <= DAY) {
        // group by hour
        groupBy = "hour";
    } else if (timeDiff <= YEAR) {
        // group by day
        groupBy = "day";
    } else {
        // group by month
        groupBy = "month";
    }

    const startDate = new Date(fromDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    // generate a list of dates between the start and end date
    if (groupBy === "mins") {
        const mins = Math.floor(timeDiff / (60 * 1000)) + 1;
        dates = new Array(mins).fill(0).map((_, i) => {
            const date = new Date(fromDate.getTime() + i * 60 * 1000);
            date.setSeconds(0, 0); // Set seconds and milliseconds to zero
            return date;
        });
    } else if (groupBy === "hour") {
        const hours = Math.floor(timeDiff / (60 * 60 * 1000)) + 1;
        dates = new Array(hours).fill(0).map((_, i) => {
            const date = new Date(fromDate.getTime() + i * 60 * 60 * 1000);
            date.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to zero
            return date;
        });
    } else if (groupBy === "day") {
        const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000)) + 1;
        dates = new Array(days).fill(0).map((_, i) => {
            const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
            date.setHours(0, 0, 0, 0); // Set time to 00:00:00
            return date;
        });
    } else if (groupBy === "month") {
        const months =
            (endDate.getMonth() - startDate.getMonth() + 1) *
            ((endDate.getFullYear() - startDate.getFullYear()) * 12);
        dates = new Array(months).fill(0).map((_, i) => {
            return new Date(
                startDate.getFullYear(),
                startDate.getMonth() + i,
                1
            );
        });
    }

    return dates;
}

export default function DashboardPage({
    params,
    searchParams,
}: {
    params: { host: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const [dateRange, setDateRange] = useState<DateRangePickerValue>({
        ...getDefaultDates(
            Array.isArray(searchParams) ? searchParams[0] : searchParams
        ),
    });
    const [dates, setDates] = useState<Date[]>([]);

    const router = useRouter();

    useEffect(() => {
        setDates(generateArray(dateRange));

        const newUrl = new URL(window.location.href);
        if (dateRange.selectValue) {
            newUrl.searchParams.set("selectValue", dateRange.selectValue ?? "");
            newUrl.searchParams.delete("from");
            newUrl.searchParams.delete("to");
        } else {
            newUrl.searchParams.delete("selectValue");
            newUrl.searchParams.set(
                "from",
                dateRange.from?.toISOString() ?? ""
            );
            newUrl.searchParams.set("to", dateRange.to?.toISOString() ?? "");
        }
        router.push(newUrl.href, undefined);
    }, [dateRange, router, searchParams]);

    // console.log(params.host);
    // let host = params.host;
    // // slightly janky
    // // TODO: don't store http/https in the database
    // // add https:// if it's not there
    // if (!host.startsWith("http")) {
    //     host = "https://" + params.host;
    // }
    // const websiteData = await db
    //     .select()
    //     .from(websites)
    //     .where(eq(websites.url, host))
    //     .execute();

    // if (!websiteData || websiteData.length === 0) {
    //     return <div>Website not found</div>;
    // }

    // const groupBy = "day" as GroupBy;

    // const eventsData = await getData(host, groupBy);

    // const eventsByHour = groupData(eventsData, groupBy);

    // const chartData = getChartData(eventsByHour, groupBy);

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

    // return (
    //     <div>
    //         <h1>Dashboard</h1>
    //         <p>Host: {params.host}</p>
    //         <p>Website ID: {websiteData[0]?.id}</p>
    //         <p>Website Name: {websiteData[0]?.name}</p>
    //         <Card>
    //             <Title>
    //                 Events by{" "}
    //                 {groupBy === "hour"
    //                     ? "Hour"
    //                     : groupBy === "day"
    //                     ? "Day"
    //                     : groupBy === "month"
    //                     ? "Month"
    //                     : groupBy === "year"
    //                     ? "Year"
    //                     : ""}
    //             </Title>
    //             <AreaChart
    //                 className="h-72 mt-4"
    //                 data={chartData}
    //                 index="date"
    //                 categories={["events"]}
    //                 colors={["indigo"]}
    //             />
    //         </Card>
    //         <div className="flex flex-wrap">
    //             {eventsData.map((event) => (
    //                 <div
    //                     key={event.id}
    //                     className="bg-gray-800 rounded-md border-white border p-2 w-64"
    //                 >
    //                     <p>Event ID: {event.id}</p>
    //                     <p>Event Type: {event.eventType}</p>
    //                     <p>Event Host: {event.host}</p>
    //                     <p>Event Page: {event.page}</p>
    //                     <p>Event Referrer: {event.referrer}</p>
    //                     <p>
    //                         Event Timestamp: {event.timestamp?.toLocaleString()}
    //                     </p>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // );

    return <DatePicker dateRange={dateRange} setDateRange={setDateRange} />;
}
