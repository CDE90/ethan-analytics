import { NextRequest, NextResponse } from "next/server";
import { seed } from "~/seed";

export async function GET(req: NextRequest) {
    if (req.nextUrl.hostname !== "localhost") {
        return NextResponse.error();
    }

    await seed();

    return NextResponse.json({ message: "Successfully seeded dev DB!" });
}
