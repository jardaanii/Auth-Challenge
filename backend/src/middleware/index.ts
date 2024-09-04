import { Context, Next } from "hono";

export const validateSignupInput = async (c: Context, next: Next) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json(
      {
        status: 400,
        message: "You have credentials missing",
        error: "Email and password are required",
      },
      400
    );
  }

  c.set("validatedInput", { email, password });
  await next();
};
