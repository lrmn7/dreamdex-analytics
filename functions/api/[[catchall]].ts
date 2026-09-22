import { handle } from "hono/cloudflare-pages";
import { app } from "../../worker/index";

export const onRequest = handle(app);
