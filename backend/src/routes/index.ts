import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { validateSignupInput } from "../middleware";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SALT: string;
};

export const apiRoutes = new Hono<{ Bindings: Bindings }>();

apiRoutes.post("/v1/signup", validateSignupInput, async (c) => {
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

apiRoutes.post("/v1/signin", validateSignupInput, async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const response = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
    select: {
      id: true,
      password: true,
    },
  });

  if (!response) {
    return c.text("Not able to find the user");
  }
  const isPasswordValid = await bcrypt.compare(
    body.password,
    response.password
  );
  if (!isPasswordValid) {
    c.status(401);
    return c.json({ message: "Invalid credentials" });
  }
  const token = await sign(
    {
      id: response.id,
      email: body.email,
    },
    c.env.JWT_SECRET
  );
  return c.json({
    status: 200,
    message: "Successfully logged in the user",
    data: token,
  });
});

export default apiRoutes;
