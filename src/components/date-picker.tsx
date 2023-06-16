"use client";

import { Card, DateRangePicker, DateRangePickerItem } from "@tremor/react";
import {
    sub,
    startOfToday,
    startOfMonth,
    startOfYear,
    endOfToday,
} from "date-fns";

export type DateRangePickerValue = {
    from?: Date;
    to?: Date;
    selectValue?: string;
};

export default function DatePicker({
    dateRange,
    setDateRange,
}: {
    dateRange: DateRangePickerValue;
    setDateRange: (dateRange: DateRangePickerValue) => void;
}) {
    return (
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
    );
}
