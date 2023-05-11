import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: "Hello World" });
}
export async function GET(request: NextRequest): Promise<NextResponse> {
    console.log(request);
    return NextResponse.json({
        destination: request.destination,
        referrer: request.referrer,
        url: request.url,
        geo: request.geo,
        _ip: request.ip,
        headers: request.headers,
        cookies: request.cookies,
        body: request.body,
    });
}
