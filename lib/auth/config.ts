import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma/client"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Credentials provider doesn't require an adapter
  // adapter: PrismaAdapter(prisma), // Only needed if using OAuth or Email providers
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              profile: {
                include: {
                  role: true,
                },
              },
            },
          })

          if (!user) {
            console.log("No user found with this email")
            throw new Error("Invalid credentials")
          }

          // Special case for verified users (from email verification)
          if (credentials.password === "verified-user" && user.isVerified) {
            console.log("Verified user sign-in for:", credentials.email)
          } else if (!user.password) {
            console.log("User has no password set")
            throw new Error("Invalid credentials")
          } else {
            // Validate password for normal login
            const passwordsMatch = await bcrypt.compare(credentials.password, user.password)
            if (!passwordsMatch) {
              console.log("Invalid password")
              throw new Error("Invalid credentials")
            }
          }

          // Log successful login and update profile
          await Promise.all([
            // Update user's profile with login information
            prisma.profile
              .update({
                where: { id: user.id },
                data: {
                  lastLoginAt: new Date(),
                  loginCount: { increment: 1 },
                },
              })
              .catch(() => {
                /* Ignore if profile doesn't exist yet */
              }),
          ])

          // Return user without sensitive data
          const { password, ...userWithoutPassword } = user
          return {
            ...userWithoutPassword,
            role: user.profile?.role?.name || "practitioner",
            profileComplete: !!user.profile,
            membershipPaid: !!user.profile?.membershipFeePaid,
            rememberMe: credentials.rememberMe === "true",
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error("An error occurred during authentication")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.profileComplete = user.profileComplete
        token.membershipPaid = user.membershipPaid
        // Store remember me preference in token
        const rememberMe = (user as any).rememberMe || false
        token.rememberMe = rememberMe

        // Set token expiration based on remember me preference
        const now = Math.floor(Date.now() / 1000)
        token.exp = now + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60) // 30 days or 24 hours
      }

      // Handle user updates
      if (trigger === "update" && session) {
        // Update token with new session data
        return { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.role = token.role
        session.user.profileComplete = token.profileComplete
        session.user.membershipPaid = token.membershipPaid
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle post-login redirects based on user role
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // If url is an absolute URL and it's from the same origin, allow it
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signOut({ token, session }) {
      // Log the signout event
      console.log("User signed out:", token?.email || session?.user?.email)

      // Optional: Update database to track logout
      if (token?.id) {
        try {
          // Note: lastLogoutAt field doesn't exist in Profile model
          // You can add it to the schema if needed for tracking logout times
          console.log("User logged out:", token.email)
        } catch (error) {
          console.error("Error during logout:", error)
        }
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    signOut: "/auth/login",
  },
  debug: process.env.NODE_ENV === "development",
}