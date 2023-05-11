import Image from "next/image";
import { db } from "~/server/db";

export default async function Home() {
    const data = await db.selectFrom("Example").selectAll().execute();

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold">Hello World!</h1>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            <p className="text-2xl font-bold">Data from database:</p>
            <ul className="text-xl">
                {data.map((row) => (
                    <li key={row.id}>
                        {row.name} - {row.age}
                    </li>
                ))}
            </ul>
        </main>
    );
}
