/**
 * Script to assign Admin role to admin@gmail.com user
 * Run with: node scripts/assign-admin-role.js
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

async function assignAdminRole() {
  console.log('🚀 Assigning Admin role to admin@gmail.com...');

  try {
    // First, get the admin role ID
    console.log('📋 Getting admin role ID...');
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('❌ Error getting admin role:', roleError.message);
      return false;
    }

    if (!roleData) {
      console.error('❌ Admin role not found in database');
      return false;
    }

    const adminRoleId = roleData.id;
    console.log('✅ Found admin role ID:', adminRoleId);

    // Get the current profile for admin@gmail.com
    console.log('📋 Getting admin user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role_id')
      .eq('email', 'admin@gmail.com')
      .single();

    if (profileError) {
      console.error('❌ Error getting admin profile:', profileError.message);
      return false;
    }

    if (!profileData) {
      console.error('❌ Admin user profile not found in database');
      return false;
    }

    console.log('📋 Current admin profile:');
    console.log('   User ID:', profileData.id);
    console.log('   Email:', profileData.email);
    console.log('   Current Role ID:', profileData.role_id || 'None');

    // Update the profile with the admin role
    console.log('🔄 Updating profile with admin role...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role_id: adminRoleId,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@gmail.com')
      .select('id, email, role_id')
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError.message);
      return false;
    }

    console.log('✅ Successfully assigned admin role!');
    console.log('📋 Updated profile:');
    console.log('   User ID:', updateData.id);
    console.log('   Email:', updateData.email);
    console.log('   Role ID:', updateData.role_id);

    // Verify the role assignment
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        role_id,
        roles (
          id,
          name,
          display_name
        )
      `)
      .eq('email', 'admin@gmail.com')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying role assignment:', verifyError.message);
    } else {
      console.log('🔍 Verification:');
      console.log('   Role Name:', verifyData.roles?.name);
      console.log('   Role Display Name:', verifyData.roles?.display_name);
    }

    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

// Run the function
assignAdminRole().then((success) => {
  if (success) {
    console.log('');
    console.log('🎉 Admin role assignment completed successfully!');
  } else {
    console.log('');
    console.log('❌ Failed to assign admin role');
    process.exit(1);
  }
}).catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
