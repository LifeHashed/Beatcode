import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    username: string;
  }
}
