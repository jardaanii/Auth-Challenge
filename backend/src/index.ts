import { Hono } from "hono";
import apiRoutes from "./routes/index";
import { cors } from "hono/cors";
const app = new Hono();
app.use("*", cors());
app.route("/api", apiRoutes);

export default app;
