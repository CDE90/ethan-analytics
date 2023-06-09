import { db } from "~/server/db";
import { z } from "zod";

export const runtime = "edge";

const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().min(0),
});

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold">Hello World!</h1>
        </main>
    );
}
