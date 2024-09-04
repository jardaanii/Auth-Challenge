import { z } from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  isCreator: z.boolean(),
  name: z.string(),
});

export const signinInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
