import { App, staticFiles, trailingSlashes } from "fresh";

import { type State } from "@/utils.ts";
import { cache } from "@/middleware/cache.ts";

export const app = new App<State>();

app.use(trailingSlashes("never"));

app.use(staticFiles());

app.get(
  "/pdf",
  cache({
    cacheName: "v1",
    cacheControl: "public, max-age=2592000",
  }),
);

app.fsRoutes();
