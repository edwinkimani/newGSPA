import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | GSPA",
  description: "Privacy Policy for the Global Security Practitioners Alliance certification platform",
}

export default async function PrivacyPolicyPage() {
  const supabase = await createClient()

  const { data: privacyDoc } = await supabase
    .from("legal_documents")
    .select("title, content")
    .eq("document_type", "privacy_policy")
    .eq("is_active", true)
    .single()

  const content = privacyDoc?.content || `
## Privacy Policy

### 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, take a certification test, or contact us for support.

### 2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send you technical notices, updates, security alerts, and support messages
- Respond to your comments, questions, and requests
- Communicate with you about products, services, offers, and events

### 3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

### 4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

### 5. Data Retention
We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy.

### 6. Your Rights
You have the right to:
- Access the personal information we hold about you
- Correct inaccurate personal information
- Request deletion of your personal information
- Object to or restrict processing of your personal information

### 7. Cookies
We use cookies and similar technologies to enhance your experience on our website.

### 8. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

### 9. Contact Us
If you have any questions about this privacy policy, please contact us at privacy@gspa.com.
  `

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />').replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>').replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">$1</h3>') }} />
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
