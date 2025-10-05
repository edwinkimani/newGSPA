-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'GSPA Certification Platform',
    admin_email VARCHAR(255) DEFAULT 'admin@gspa.com',
    support_email VARCHAR(255) DEFAULT 'support@gspa.com',
    email_notifications BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    registration_enabled BOOLEAN DEFAULT true,
    test_fee INTEGER DEFAULT 50,
    membership_fee INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (site_name, admin_email, support_email, email_notifications, maintenance_mode, registration_enabled, test_fee, membership_fee)
VALUES ('GSPA Certification Platform', 'admin@gspa.com', 'support@gspa.com', true, false, true, 50, 50)
ON CONFLICT DO NOTHING;

-- Create legal documents table
CREATE TABLE IF NOT EXISTS legal_documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) UNIQUE NOT NULL, -- 'terms_of_service', 'privacy_policy'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default terms of service
INSERT INTO legal_documents (document_type, title, content) VALUES
('terms_of_service', 'Terms of Service', '## Terms of Service

### 1. Acceptance of Terms
By accessing and using the Global Security Practitioners Alliance (GSPA) certification platform, you accept and agree to be bound by the terms and provision of this agreement.

### 2. Use License
Permission is granted to temporarily access the materials (information or software) on GSPA''s website for personal, non-commercial transitory viewing only.

### 3. Disclaimer
The materials on GSPA''s website are provided on an ''as is'' basis. GSPA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

### 4. Limitations
In no event shall GSPA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GSPA''s website.

### 5. Accuracy of Materials
The materials appearing on GSPA''s website could include technical, typographical, or photographic errors. GSPA does not warrant that any of the materials on its website are accurate, complete, or current.

### 6. Links
GSPA has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.

### 7. Modifications
GSPA may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.

### 8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.')
ON CONFLICT (document_type) DO NOTHING;

-- Insert default privacy policy
INSERT INTO legal_documents (document_type, title, content) VALUES
('privacy_policy', 'Privacy Policy', '## Privacy Policy

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
If you have any questions about this privacy policy, please contact us at privacy@gspa.com.')
ON CONFLICT (document_type) DO NOTHING;
