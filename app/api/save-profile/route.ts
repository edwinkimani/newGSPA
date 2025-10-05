import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('Save-profile API called')

    const { profileData, accessToken } = await request.json()
    console.log('Received profile data:', profileData)
    console.log('Access token present:', !!accessToken)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration')
      throw new Error("Missing Supabase configuration")
    }

    // Use the user's access token to authenticate the request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    console.log('Attempting to upsert profile data...')

    // Insert or update the profile
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData)
      .select()

    if (error) {
      console.error('Profile save error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Profile saved successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in save-profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
