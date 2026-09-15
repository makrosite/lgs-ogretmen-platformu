import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      title?: string;
    };
  }

  interface User {
    title?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    title?: string;
  }
}

export type { NextAuthOptions };
