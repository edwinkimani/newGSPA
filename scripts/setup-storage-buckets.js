const { createClient } = require('@supabase/supabase-js')

// This script sets up the required storage buckets for the application
async function setupStorageBuckets() {
  // You'll need to provide your Supabase URL and service role key
  // For security, these should be set as environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    console.error('')
    console.error('Please set these environment variables and run the script again.')
    process.exit(1)
  }

  // Create Supabase client with service role key (admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Setting up storage buckets...')

  try {
    // Check if documents bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const documentsBucket = buckets.find(bucket => bucket.name === 'documents')

    if (documentsBucket) {
      console.log('✅ Documents bucket already exists')
    } else {
      // Create the documents bucket
      console.log('Creating documents bucket...')
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: false, // Private bucket - requires authentication to access
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB limit
      })

      if (error) {
        console.error('Error creating documents bucket:', error)
        return
      }

      console.log('✅ Documents bucket created successfully')
    }

    // Set up bucket policies (optional - you might want to configure these in Supabase dashboard)
    console.log('Storage buckets setup completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. In your Supabase dashboard, go to Storage > documents bucket')
    console.log('2. Configure RLS policies if needed for file access control')
    console.log('3. Test file uploads in your application')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the setup
setupStorageBuckets()
  .then(() => {
    console.log('Setup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
