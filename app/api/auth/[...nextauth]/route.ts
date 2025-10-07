import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/config"

// Create the handler from the options
const handler = NextAuth(authOptions)

// Export the handler for GET and POST requests
export const GET = handler
export const POST = handler
