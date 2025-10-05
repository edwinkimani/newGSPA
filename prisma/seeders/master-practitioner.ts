import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating default Master Practitioner user...')

    // Check if master practitioner role exists, create if not
    let masterPractitionerRole = await prisma.role.findUnique({
      where: { name: 'master_practitioner' }
    })

    if (!masterPractitionerRole) {
      masterPractitionerRole = await prisma.role.create({
        data: {
          name: 'master_practitioner',
          displayName: 'Master Practitioner',
          description: 'Advanced security practitioner with module management capabilities'
        }
      })
      console.log('Created master_practitioner role')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'master@example.com' }
    })

    if (existingUser) {
      console.log('Master Practitioner user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Master@123', 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'master@example.com',
        password: hashedPassword,
        isVerified: true,
      }
    })

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        id: user.id,
        firstName: 'Master',
        lastName: 'Practitioner',
        email: 'master@example.com',
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1985-05-15'),
        nationality: 'Kenya',
        gender: 'MALE',
        designation: 'Senior Security Consultant',
        organizationName: 'Global Security Practitioners Alliance',
        documentType: 'PASSPORT',
        documentNumber: 'MP123456789',
        membershipFeePaid: true,
        paymentStatus: 'COMPLETED',
        testCompleted: true,
        certificateIssued: true,
        roleId: masterPractitionerRole.id
      }
    })

    console.log('Created default Master Practitioner user:')
    console.log('- Email: master@example.com')
    console.log('- Password: Master@123')
    console.log('- Role: Master Practitioner')

  } catch (error) {
    console.error('Error creating master practitioner:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
