import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create default roles
    const roles = await Promise.all([
      prisma.role.create({
        data: {
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full system access with all privileges',
          isSystem: true
        }
      }),
      prisma.role.create({
        data: {
          name: 'master_practitioner',
          displayName: 'Master Practitioner',
          description: 'Content creator and exam manager with teaching capabilities',
          isSystem: false
        }
      }),
      prisma.role.create({
        data: {
          name: 'practitioner',
          displayName: 'Practitioner',
          description: 'Standard user with access to courses and certifications',
          isSystem: false
        }
      })
    ])

    console.log('Created roles:', roles)

    // Create default permissions
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          name: 'manage_users',
          displayName: 'Manage Users',
          description: 'Can create, update, and delete user accounts',
          resource: 'user',
          action: 'manage'
        }
      }),
      prisma.permission.create({
        data: {
          name: 'manage_content',
          displayName: 'Manage Content',
          description: 'Can create and manage course content and modules',
          resource: 'module',
          action: 'manage'
        }
      }),
      prisma.permission.create({
        data: {
          name: 'manage_tests',
          displayName: 'Manage Tests',
          description: 'Can create and manage test questions and configurations',
          resource: 'test',
          action: 'manage'
        }
      }),
      prisma.permission.create({
        data: {
          name: 'issue_certificates',
          displayName: 'Issue Certificates',
          description: 'Can issue and manage certificates',
          resource: 'certificate',
          action: 'issue'
        }
      }),
      prisma.permission.create({
        data: {
          name: 'view_reports',
          displayName: 'View Reports',
          description: 'Can view system reports and analytics',
          resource: 'report',
          action: 'view'
        }
      })
    ])

    console.log('Created permissions:', permissions)

    // Assign permissions to roles
    const adminRole = roles.find(r => r.name === 'admin')
    const masterRole = roles.find(r => r.name === 'master_practitioner')
    const practitionerRole = roles.find(r => r.name === 'practitioner')

    if (adminRole) {
      // Admin gets all permissions
      await Promise.all(
        permissions.map(permission =>
          prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id
            }
          })
        )
      )
    }

    if (masterRole) {
      // Master practitioner gets content and test management
      const masterPermissions = permissions.filter(p => 
        ['manage_content', 'manage_tests'].includes(p.name)
      )
      
      await Promise.all(
        masterPermissions.map(permission =>
          prisma.rolePermission.create({
            data: {
              roleId: masterRole.id,
              permissionId: permission.id
            }
          })
        )
      )
    }

    // Create default admin user
    const hashedPassword = await hash('Admin@123', 12)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        isVerified: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            nationality: 'Kenya',
            gender: 'MALE',
            dateOfBirth: new Date('1990-01-01'),
            phoneNumber: '+254700000000',
            designation: 'System Administrator',
            organizationName: 'GSPA',
            documentType: 'NATIONAL_ID',
            documentNumber: 'ADM123456',
            declarationAccepted: true,
            membershipFeePaid: true,
            paymentStatus: 'COMPLETED',
            roleId: adminRole!.id,
            email: 'admin@gmail.com'
          }
        }
      }
    })

    console.log('Created admin user:', adminUser)

    console.log('Database seeding completed successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
