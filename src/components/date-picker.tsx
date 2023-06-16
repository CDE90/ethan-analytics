"use client";

import {
    Card,
    DateRangePicker,
    DateRangePickerItem,
    Select,
    SelectItem,
} from "@tremor/react";
import { useEffect, useState } from "react";
import {
    sub,
    startOfToday,
    startOfMonth,
    startOfYear,
    endOfToday,
} from "date-fns";

type GroupBy = "mins" | "hour" | "day" | "month";

type DateRangePickerValue = {
    from?: Date;
    to?: Date;
    selectValue?: string;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

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
        console.log("months", months);
        console.log("endMonth", endDate.getMonth());
        console.log("startMonth", startDate.getMonth());
        console.log("endYear", endDate.getFullYear());
        console.log("startYear", startDate.getFullYear());
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

function getDefaultDates() {
    return {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(Date.now()),
    };
}

export default function DatePicker() {
    const [dateRange, setDateRange] = useState<DateRangePickerValue>({
        ...getDefaultDates(),
    });
    const [dates, setDates] = useState<Date[]>([]);

    useEffect(() => {
        setDates(generateArray(dateRange));
        console.log("start Date", dateRange.from?.toLocaleString());
        console.log("end Date", dateRange.to?.toLocaleString());
        // add as query params: from, to
    }, [dateRange]);

    return (
        <>
            <Card>
                <DateRangePicker
                    className="max-w-md mx-auto mt-2"
                    value={dateRange}
                    onValueChange={setDateRange}
                    enableSelect={true}
                    enableClear={false}
                >
                    <DateRangePickerItem
                        value="Last 1 hour"
                        from={sub(startOfToday(), { hours: 1 })}
                    />
                    <DateRangePickerItem
                        value="Yesterday"
                        from={sub(startOfToday(), { days: 1 })}
                        to={sub(endOfToday(), { days: 1 })}
                    />
                    <DateRangePickerItem
                        value="Today"
                        from={startOfToday()}
                        to={endOfToday()}
                    />
                    <DateRangePickerItem
                        value="Last 7 days"
                        from={sub(startOfToday(), { days: 7 })}
                    />
                    <DateRangePickerItem
                        value="Last 30 days"
                        from={sub(startOfToday(), { days: 30 })}
                    />
                    <DateRangePickerItem
                        value="Month to Date"
                        from={startOfMonth(startOfToday())}
                    />
                    <DateRangePickerItem
                        value="Last 90 days"
                        from={sub(startOfToday(), { days: 90 })}
                    />
                    <DateRangePickerItem
                        value="Last 1 year"
                        from={sub(startOfToday(), { days: 365 })}
                    />
                    <DateRangePickerItem
                        value="Year to Date"
                        from={startOfYear(startOfToday())}
                    />
                </DateRangePicker>
            </Card>
            <div className="flex flex-wrap">
                {dates.map((date) => (
                    <div
                        key={date.getTime()}
                        className="bg-gray-800 rounded-md border-white border p-2 w-64"
                    >
                        <p>{date.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </>
    );
}
