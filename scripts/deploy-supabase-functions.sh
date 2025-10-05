#!/bin/bash

# Deploy Supabase Edge Functions for Email
# Run this script from the project root directory

echo "🚀 Deploying Supabase Edge Functions for Email..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Run: supabase login"
    exit 1
fi

# Link to project (using the project ref from .env.local)
PROJECT_REF="quintjtreswyjxxogcjt"
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo "❌ Failed to link to project. Check your project ref."
    exit 1
fi

# Set environment variables
echo "🔑 Setting environment variables..."
supabase secrets set APP_URL=http://localhost:3000

# Note: RESEND_API_KEY should be set manually for security
echo "⚠️  IMPORTANT: Set your RESEND_API_KEY manually:"
echo "   supabase secrets set RESEND_API_KEY=your_actual_api_key_here"

# Deploy the function
echo "📦 Deploying send-verification-email function..."
supabase functions deploy send-verification-email

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "🧪 Test the function:"
    echo "supabase functions invoke send-verification-email --data '{\"email\":\"test@example.com\",\"token\":\"test-token\",\"type\":\"verification\"}'"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set RESEND_API_KEY secret: supabase secrets set RESEND_API_KEY=your_key"
    echo "2. Test email sending during registration"
    echo "3. For production: Update APP_URL and verify domain in Resend"
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi
