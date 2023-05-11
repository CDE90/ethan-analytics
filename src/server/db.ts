import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { env } from "~/env.mjs";

import type { DB } from "~/server/db/types";

export const db = new Kysely<DB>({
    dialect: new PlanetScaleDialect({
        url: env.DATABASE_URL,
    }),
});
