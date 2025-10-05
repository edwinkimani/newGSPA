/**
 * Script to create Mprac@gmail.com auth user programmatically
 * Run with: node scripts/create-mprac-user.js
 *
 * Requirements:
 * - Node.js installed
 * - npm install @supabase/supabase-js
 * - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

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

async function createMpracUser() {
  console.log('🚀 Creating Master Practitioner auth user...');

  try {
    // Create the user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'Mprac@gmail.com',
      password: 'Mprac123',
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        first_name: 'Master',
        last_name: 'Practitioner',
        role: 'master_practitioner'
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);

      // Check if user already exists
      if (error.message.includes('already registered')) {
        console.log('ℹ️  User might already exist. Checking...');

        // Try to get existing user
        const { data: existingUser, error: getError } = await supabase.auth.admin.getUserByEmail('Mprac@gmail.com');

        if (existingUser?.user) {
          console.log('✅ User already exists!');
          console.log('📋 User ID:', existingUser.user.id);
          console.log('📧 Email:', existingUser.user.email);
          console.log('✅ Email confirmed:', existingUser.user.email_confirmed_at ? 'Yes' : 'No');
          console.log('');
          console.log('🔄 Use this User ID in scripts/014_create_master_practitioner_account.sql');
          return existingUser.user.id;
        } else {
          console.error('❌ Could not retrieve existing user:', getError?.message);
          return null;
        }
      }

      return null;
    }

    if (data?.user) {
      console.log('✅ User created successfully!');
      console.log('📋 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('✅ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      console.log('');
      console.log('🔄 Next steps:');
      console.log('1. Copy the User ID above');
      console.log('2. Update scripts/014_create_master_practitioner_account.sql');
      console.log('3. Replace the UUID placeholder with the actual User ID');
      console.log('4. Run the updated SQL script');

      return data.user.id;
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return null;
  }
}

// Run the function
createMpracUser().then((userId) => {
  if (userId) {
    console.log('');
    console.log('🎉 Setup complete! User ID to use:', userId);
  } else {
    console.log('');
    console.log('❌ Failed to create or retrieve user');
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
