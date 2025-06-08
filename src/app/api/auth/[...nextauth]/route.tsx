"use server";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Cookies from "js-cookie";
import { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcrypt";
//

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "ADMIN" | "MANAGER" | "MEMBER";
    };
  }

  interface User {
    id: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "MEMBER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "MEMBER";
  }
}

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        console.log("Authorizing user with email:", credentials.email);

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user) {
            throw new Error("User not found.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password.");
          }

          // Map the role to allowed values, or throw if not allowed
          const allowedRoles = ["ADMIN", "MANAGER", "MEMBER"] as const;
          if (!allowedRoles.includes(user.role as any)) {
            throw new Error("User role is not allowed.");
          }

          // Return only the fields required by next-auth User type (no password)
          return {
            id: user.id,
            email: user.email,
            role: user.role as "ADMIN" | "MANAGER" | "MEMBER",
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          throw new Error(
            "An error occurred while authenticating. Please try again."
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Check if `user` has `accessToken` property
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Export the handler for GET and POST methods
export { handler as GET, handler as POST };
