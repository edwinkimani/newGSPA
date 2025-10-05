import { prisma } from '@/lib/prisma/client'

export async function getUser(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      profile: {
        include: {
          role: true
        }
      }
    }
  })
}
