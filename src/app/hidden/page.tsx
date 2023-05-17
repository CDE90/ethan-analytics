import { UserButton } from "@clerk/nextjs";

export default function HiddenPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold">Hello World!</h1>
            <p className="text-2xl font-bold">This is a hidden page!</p>
            <UserButton />
        </main>
    );
}
