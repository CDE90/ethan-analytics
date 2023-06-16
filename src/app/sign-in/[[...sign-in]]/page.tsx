import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export default function SignInPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <SignIn />
        </main>
    );
}
