import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { websites } from "~/server/schema";

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

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Host: {params.host}</p>
            <p>Website ID: {websiteData[0]?.id}</p>
            <p>Website Name: {websiteData[0]?.name}</p>
        </div>
    );
}
