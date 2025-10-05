/**
 * Script to create peter@gmail.com auth user with admin role programmatically
 * Run with: node scripts/create_peter_admin.js
 *
 * Requirements:
 * - Node.js installed
 * - npm install @supabase/supabase-js dotenv
 * - .env.local file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Set them in your .env.local file or export them:');
  console.error('   export SUPABASE_URL="your_supabase_url"');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createPeterAdmin() {
  console.log('🚀 Creating or retrieving Peter admin auth user...');

  try {
    // First, try to get existing user
    const { data: existingUser, error: getError } = await supabase.auth.admin.getUserByEmail('peter@gmail.com');

    if (existingUser?.user) {
      console.log('✅ User already exists!');
      console.log('📋 User ID:', existingUser.user.id);
      console.log('📧 Email:', existingUser.user.email);
      console.log('✅ Email confirmed:', existingUser.user.email_confirmed_at ? 'Yes' : 'No');
      console.log('');
      console.log('🔄 Proceeding to create/update profile...');
      return existingUser.user.id;
    }

    // If not found, create new user
    console.log('ℹ️  User not found, creating new user...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'peter@gmail.com',
      password: '@Peter123',
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        first_name: 'Peter',
        last_name: 'Admin',
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return null;
    }

    if (data?.user) {
      console.log('✅ User created successfully!');
      console.log('📋 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('✅ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      console.log('');

      return data.user.id;
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return null;
  }
}

async function createProfile(userId) {
  console.log('📝 Creating/updating user profile...');

  try {
    // Get admin role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('❌ Error finding admin role:', roleError?.message);
      return false;
    }

    const adminRoleId = roleData.id;
    console.log('🔑 Admin role ID:', adminRoleId);

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role_id: adminRoleId,
          membership_fee_paid: true,
          first_name: 'Peter',
          last_name: 'Admin',
          email: 'peter@gmail.com',
          nationality: 'Kenya',
          gender: 'male',
          date_of_birth: '1990-01-01',
          phone_number: '+254700000000',
          designation: 'Administrator',
          organization_name: 'Global Security Practitioners Alliance',
          document_type: 'national_id',
          document_number: '123456789',
          declaration_accepted: true,
          payment_status: 'completed',
          test_completed: false,
          certificate_issued: false
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        return false;
      }

      console.log('✅ Profile updated successfully!');
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role_id: adminRoleId,
          membership_fee_paid: true,
          first_name: 'Peter',
          last_name: 'Admin',
          email: 'peter@gmail.com',
          nationality: 'Kenya',
          gender: 'male',
          date_of_birth: '1990-01-01',
          phone_number: '+254700000000',
          designation: 'Administrator',
          organization_name: 'Global Security Practitioners Alliance',
          document_type: 'national_id',
          document_number: '123456789',
          declaration_accepted: true,
          payment_status: 'completed',
          test_completed: false,
          certificate_issued: false
        });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
        return false;
      }

      console.log('✅ Profile created successfully!');
    }

    return true;
  } catch (err) {
    console.error('❌ Unexpected error creating profile:', err.message);
    return false;
  }
}

// Run the functions
createPeterAdmin().then(async (userId) => {
  if (userId) {
    console.log('');
    const profileSuccess = await createProfile(userId);
    if (profileSuccess) {
      console.log('');
      console.log('🎉 Setup complete! Peter admin user created with profile and admin role.');
      console.log('📧 Email: peter@gmail.com');
      console.log('🔑 Password: @Peter123');
      console.log('👤 Role: Admin');
    } else {
      console.log('');
      console.log('❌ Failed to create/update profile');
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('❌ Failed to create or retrieve user');
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
