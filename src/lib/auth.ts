import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const teacher = await prisma.teacher.findUnique({
          where: { email: credentials.email },
        });
        if (!teacher) return null;
        const ok = await bcrypt.compare(credentials.password, teacher.passwordHash);
        if (!ok) return null;
        return {
          id: teacher.id,
          email: teacher.email,
          name: teacher.name,
          title: teacher.title ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.title = (user as { title?: string }).title;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { title?: string }).title = token.title as string;
      }
      return session;
    },
  },
};
