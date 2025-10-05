import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up storage buckets...')

    const supabase = await createClient()

    // Check if documents bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const documentsBucket = buckets?.find((bucket: { name: string }) => bucket.name === 'documents')

    if (documentsBucket) {
      console.log('✅ Documents bucket already exists')
      return NextResponse.json({
        success: true,
        message: 'Documents bucket already exists',
        bucket: documentsBucket
      })
    }

    // Create the documents bucket
    console.log('Creating documents bucket...')
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false, // Private bucket - requires authentication to access
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB limit
    })

    if (error) {
      console.error('Error creating documents bucket:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Documents bucket created successfully')
    return NextResponse.json({
      success: true,
      message: 'Documents bucket created successfully',
      bucket: data
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
