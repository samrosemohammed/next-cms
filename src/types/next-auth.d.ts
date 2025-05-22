// import { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

type UserId = string;
type UserRole = "admin" | "teacher" | "student";

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    role: UserRole;
  }
}

declare module "next-auth" {
  interface User {
    id: UserId;
    role: UserRole;
  }
  interface Session {
    user: User & {
      id: UserId;
      role: UserRole;
    };
  }
}
export type FixLinterWarnings = Session | JWT;
