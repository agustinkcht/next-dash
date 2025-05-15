import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "./app/lib/definitions";
import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// function to retrieve user data
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user", error);
    throw new Error("Failed to fetch user");
  }
}

// zod schema to validate the credentials against
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // validate credentials w zod
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        // perform based on the returned object
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null; // if not found, redirect
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(user)
          if (passwordMatch) return user; // if ok, return user
          
        }
        return null; // if invalid credentials, redirect
      },
    }),
  ],
});
