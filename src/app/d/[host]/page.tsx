import { db } from "~/server/db";

export default async function DashboardPage({
    params,
}: {
    params: { host: string };
}) {
    console.log(params.host);
    const websiteData = await db
        .selectFrom("Website")
        .where("url", "=", params.host)
        .executeTakeFirst();

    if (!websiteData) {
        return <div>Website not found</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Host: {params.host}</p>
        </div>
    );
}
