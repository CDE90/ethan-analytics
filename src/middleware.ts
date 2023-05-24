import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export default authMiddleware({
    publicRoutes: ["/", "/api/event", "/api/seed"],
    async afterAuth(auth, req, evt) {
        if (!auth.userId && !auth.isPublicRoute) {
            const signInUrl = new URL("/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.url);
            return NextResponse.redirect(signInUrl);
        } else if (auth.userId) {
            const user = await db
                .selectFrom("User")
                .select(["id", "clerkId"])
                .where("clerkId", "=", auth.userId)
                .execute();

            if (user.length === 0) {
                await db
                    .insertInto("User")
                    .values({ clerkId: auth.userId })
                    .execute();
            }
        }
    },
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
