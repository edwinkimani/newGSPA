/**
 * Script to assign Admin role to a user by email using Prisma
 * Run with: node scripts/assign-admin-role-prisma.js [email]
 *
 * If no email provided, defaults to 'admin@example.com'
 *
 * Requirements:
 * - Node.js installed
 * - Database connection configured in .env.local
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignAdminRole(email = 'admin@example.com') {
  console.log(`🚀 Assigning Admin role to ${email}...`);

  try {
    // Get the admin role
    console.log('📋 Getting admin role...');
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.error('❌ Admin role not found. Please run the database seeder first: npm run db:seed');
      return false;
    }

    console.log('✅ Found admin role:', adminRole.name);

    // Find the user by email
    console.log('📋 Finding user by email...');
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found in database`);
      return false;
    }

    console.log('✅ Found user:', user.email, '(ID:', user.id + ')');

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: user.id }
    });

    if (!existingProfile) {
      console.error('❌ User profile not found. The user needs to complete registration first.');
      return false;
    }

    console.log('📋 Current profile role_id:', existingProfile.roleId || 'None');

    // Update the profile with admin role
    console.log('🔄 Updating profile with admin role...');
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        roleId: adminRole.id
      },
      include: {
        role: true
      }
    });

    console.log('✅ Successfully assigned admin role!');
    console.log('📋 Updated profile:');
    console.log('   User ID:', updatedProfile.id);
    console.log('   Email:', updatedProfile.email);
    console.log('   Role:', updatedProfile.role?.name);
    console.log('   Role Display Name:', updatedProfile.role?.displayName);

    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2] || 'admin@example.com';

assignAdminRole(email).then((success) => {
  if (success) {
    console.log('');
    console.log('🎉 Admin role assignment completed successfully!');
    console.log(`The user ${email} now has admin privileges.`);
  } else {
    console.log('');
    console.log('❌ Failed to assign admin role');
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
