import { eq, gte, and, lte } from "drizzle-orm";
import { db } from "~/server/db";
import { websites, events } from "~/server/schema";
import { AreaChart, Card, DateRangePicker, Title } from "@tremor/react";
import DatePicker from "~/components/date-picker";

export const runtime = "edge";

type GroupBy = "mins" | "hour" | "day" | "month";

type DateRangePickerValue = {
    from: Date;
    to: Date;
    selectValue?: string;
};

async function getData(host: string, dateRange: DateRangePickerValue) {
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
                gte(events.timestamp, dateRange.from),
                lte(events.timestamp, dateRange.to),
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

function getMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function generateArray(dateRange: DateRangePickerValue, groupBy: GroupBy) {
    const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
    let dates: Date[] = [];

    const startDate = new Date(dateRange.from);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.to);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    // generate a list of dates between the start and end date
    if (groupBy === "mins") {
        const mins = Math.floor(timeDiff / (60 * 1000));
        dates = new Array(mins).fill(0).map((_, i) => {
            const date = new Date(dateRange.from.getTime() + i * 60 * 1000);
            date.setSeconds(0, 0); // Set seconds and milliseconds to zero
            return date;
        });
    } else if (groupBy === "hour") {
        const hours = Math.floor(timeDiff / (60 * 60 * 1000));
        dates = new Array(hours).fill(0).map((_, i) => {
            const date = new Date(
                dateRange.from.getTime() + i * 60 * 60 * 1000
            );
            date.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to zero
            return date;
        });
    } else if (groupBy === "day") {
        const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
        dates = new Array(days).fill(0).map((_, i) => {
            const date = new Date(
                dateRange.from.getTime() + i * 24 * 60 * 60 * 1000
            );
            date.setHours(0, 0, 0, 0); // Set time to 00:00:00
            return date;
        });
    } else if (groupBy === "month") {
        const months = endDate.getMonth() - startDate.getMonth();
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

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

// function groupData<T extends Event>(
//     data: T[],
//     dateRange: DateRangePickerValue
// ): { [key: string]: T[] } {
//     // depending on the length of the date range, group by hour, day, or month
//     // 0-60 mins: group by mins
//     // 1-24 hours: group by hour
//     // 1-90 days: group by day
//     // 90 days+: group by month
//     const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();

//     // for each, generate an array of dates equally spaced between the start and end date
//     // with differences based on the group by

//     if (timeDiff <= HOUR) {
//         // group by mins
//     } else if (timeDiff <= DAY) {
//         // group by hour
//     } else if (timeDiff <= YEAR) {
//         // group by day
//     } else {
//         // group by month
//     }

//     switch (groupBy) {
//         case "hour":
//             return data.reduce((acc, event) => {
//                 const hour = `${event.timestamp?.getHours()}:00`;

//                 if (hour) {
//                     if (acc[hour]) {
//                         acc[hour]?.push(event);
//                     } else {
//                         acc[hour] = [event];
//                     }
//                 }
//                 return acc;
//             }, {} as { [key: string]: typeof data });
//         case "day":
//             return data.reduce((acc, event) => {
//                 const day = event.timestamp?.toLocaleDateString();

//                 if (day) {
//                     if (acc[day]) {
//                         acc[day]?.push(event);
//                     } else {
//                         acc[day] = [event];
//                     }
//                 }
//                 return acc;
//             }, {} as { [key: string]: typeof data });
//         case "month":
//             return data.reduce((acc, event) => {
//                 const month = getMonth(event.timestamp!).toLocaleDateString();

//                 if (month) {
//                     if (acc[month]) {
//                         acc[month]?.push(event);
//                     } else {
//                         acc[month] = [event];
//                     }
//                 }
//                 return acc;
//             }, {} as { [key: string]: typeof data });
//     }
// }

function getChartData(data: { [key: number]: Event[] }, groupBy: GroupBy) {
    const chartData = Object.entries(data).map(([date, data]) => {
        return {
            date: date,
            events: data.length,
        };
    });

    return chartData;
}

// export default async function DashboardPage({
//     params,
// }: {
//     params: { host: string };
// }) {
export default function DashboardPage({
    params,
}: {
    params: { host: string };
}) {
    // const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    //     from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    //     to: new Date(Date.now()),
    // });
    // const [dates, setDates] = useState<Date[]>([]);

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

    return <DatePicker />;
}
