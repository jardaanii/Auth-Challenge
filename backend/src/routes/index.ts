import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SALT: string;
};

export const apiRoutes = new Hono<{ Bindings: Bindings }>();

apiRoutes.post("/v1/signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const hashedPassword = await bcrypt.hash(body.password, c.env.SALT);
  try {
    const response = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        isCreator: body.isCreator,
        password: hashedPassword,
      },
    });

    const token = await sign(
      {
        id: response.id,
        email: body.email,
        name: body.name,
      },
      c.env.JWT_SECRET
    );
    return c.json({
      status: 200,
      message: "Successfully created the user",
      data: token,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "error while creating a user",
    });
  }
});

apiRoutes.post("/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  //    const token = await sign({ id: id, email: email }, c.env.JWT_SECRET);
  return c.text("Hello form signin");
});

export default apiRoutes;
