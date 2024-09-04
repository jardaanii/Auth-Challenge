import { Hono } from "hono";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SALT: string;
};

export const apiRoutes = new Hono<{ Bindings: Bindings }>();

apiRoutes.post("/v1/signup", async (c) => {
  return c.text("Hello form signup");
});

apiRoutes.post("/v1/signin", async (c) => {
  return c.text("Hello form signin");
});

export default apiRoutes;
