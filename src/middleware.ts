import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "./server/schema";
import { eq } from "drizzle-orm";

export default authMiddleware({
    publicRoutes: ["/", "/api/event", "/api/seed"],
    async afterAuth(auth, req, evt) {
        if (!auth.userId && !auth.isPublicRoute) {
            const signInUrl = new URL("/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.url);
            return NextResponse.redirect(signInUrl);
        } else if (auth.userId) {
            const user = await db
                .select({
                    id: users.id,
                    clerkId: users.clerkId,
                })
                .from(users)
                .where(eq(users.clerkId, auth.userId));

            if (user.length === 0) {
                await db
                    .insert(users)
                    .values({ clerkId: auth.userId })
                    .execute();
            }
        }
    },
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
