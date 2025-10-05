const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({ include: { profile: true } })
    console.log(JSON.stringify(users, null, 2))
  } catch (e) {
    console.error('Error listing users', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
