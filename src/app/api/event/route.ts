import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const requestSchema = z.object({
    referrer: z.string().url().optional(),
    domain: z.string(),
    event: z.string(),
    page: z.string().url(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    let parsedData;

    try {
        parsedData = await requestSchema.safeParseAsync(await request.json());
    } catch (error) {
        return NextResponse.json({
            error: error,
        });
    }

    if (!parsedData.success) {
        return NextResponse.json({
            error: parsedData.error,
        });
    }

    const data = parsedData.data;

    // get the user agent
    const userAgent = request.headers.get("user-agent");
    // get the location
    const location = request.geo;
    const region = location?.region || null;
    const city = location?.city || null;
    const country = location?.country || null;

    await db
        .insertInto("Event")
        .values({
            userAgent,
            region,
            city,
            country,
            referrer: data.referrer,
            host: data.domain,
            eventType: data.event,
            page: data.page,
        })
        .execute();

    return NextResponse.json({});
}

// export async function GET(request: NextRequest): Promise<NextResponse> {
//     console.log(request);
//     const res = await request.json();

//     return NextResponse.json(res);
// }
