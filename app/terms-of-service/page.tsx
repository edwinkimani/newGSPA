import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | GSPA",
  description: "Terms of Service for the Global Security Practitioners Alliance certification platform",
}

export default async function TermsOfServicePage() {
  const supabase = await createClient()

  const { data: termsDoc } = await supabase
    .from("legal_documents")
    .select("title, content")
    .eq("document_type", "terms_of_service")
    .eq("is_active", true)
    .single()

  const content = termsDoc?.content || `
## Terms of Service

### 1. Acceptance of Terms
By accessing and using the Global Security Practitioners Alliance (GSPA) certification platform, you accept and agree to be bound by the terms and provision of this agreement.

### 2. Use License
Permission is granted to temporarily access the materials (information or software) on GSPA's website for personal, non-commercial transitory viewing only.

### 3. Disclaimer
The materials on GSPA's website are provided on an 'as is' basis. GSPA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

### 4. Limitations
In no event shall GSPA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GSPA's website.

### 5. Accuracy of Materials
The materials appearing on GSPA's website could include technical, typographical, or photographic errors. GSPA does not warrant that any of the materials on its website are accurate, complete, or current.

### 6. Links
GSPA has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.

### 7. Modifications
GSPA may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.

### 8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
  `

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

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
