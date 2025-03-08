import { App, staticFiles, trailingSlashes } from "fresh";

import { type State } from "@/utils.ts";

export const app = new App<State>();

app.use(trailingSlashes("never"));

app.use(staticFiles());

app.fsRoutes();
