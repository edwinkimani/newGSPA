import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      profileComplete: boolean;
      membershipPaid: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    profileComplete: boolean;
    membershipPaid: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    profileComplete: boolean;
    membershipPaid: boolean;
  }
}
