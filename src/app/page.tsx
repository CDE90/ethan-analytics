import { db } from "~/server/db";
import { z } from "zod";

export const runtime = "edge";

const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().min(0),
});

export default async function Home() {
    const data = await db.selectFrom("Example").selectAll().execute();

    async function newExample(data: FormData) {
        "use server";

        const name = data.get("name");
        const age = data.get("age");

        if (name && age) {
            const validated = schema.safeParse({
                name,
                age: Number(age),
            });

            if (validated.success) {
                await db
                    .insertInto("Example")
                    .values({
                        name: validated.data.name,
                        age: validated.data.age,
                    })
                    .execute();
            }
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold">Hello World!</h1>
            <p className="text-2xl font-bold">Data from database:</p>
            <ul className="text-xl">
                {data.map((row) => (
                    <li key={row.id}>
                        {row.name} - {row.age}
                    </li>
                ))}
            </ul>
            <form
                className="flex flex-col items-center justify-center"
                action={newExample}
            >
                <label className="text-xl font-bold" htmlFor="name">
                    Name:
                </label>
                <input
                    className="border-2 border-black rounded-md p-2 text-black"
                    type="text"
                    name="name"
                    id="name"
                />
                <label className="text-xl font-bold" htmlFor="age">
                    Age:
                </label>
                <input
                    className="border-2 border-black rounded-md p-2 text-black"
                    type="number"
                    name="age"
                    id="age"
                />
                <button
                    className="border-2 border-black rounded-md p-2"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </main>
    );
}
