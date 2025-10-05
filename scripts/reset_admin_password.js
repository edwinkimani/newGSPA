const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')
;(async ()=>{
  const prisma = new PrismaClient()
  try {
    const hashed = await hash('Admin@123', 12)
    const updated = await prisma.user.updateMany({ where: { email: 'admin@example.com' }, data: { password: hashed } })
    console.log('updated count', updated.count)
  } catch (e) {
    console.error('error', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
