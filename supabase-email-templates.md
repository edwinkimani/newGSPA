# Custom Email Templates for Supabase Auth

## Confirm Signup Template

**Subject:** Welcome to Global Security Practitioners Alliance - Verify Your Email

**HTML Body:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Global Security Practitioners Alliance</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a2332; padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Global Security Practitioners Alliance</h1>
                            <p style="color: #c9aa68; margin: 5px 0 0 0; font-size: 16px;">Professional Security Certification</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1a2332; margin: 0 0 20px 0; font-size: 24px;">Welcome! Please Verify Your Email</h2>

                            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Thank you for joining the Global Security Practitioners Alliance. To complete your registration and access your account, please verify your email address.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <a href="{{ .ConfirmationURL }}"
                                           style="background-color: #c9aa68; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(201, 170, 104, 0.3);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>

                            <p style="word-break: break-all; background-color: #f9fafb; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; font-size: 14px; color: #374151; margin: 10px 0;">
                                {{ .ConfirmationURL }}
                            </p>

                            <!-- Additional Info -->
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #c9aa68;">
                                <h3 style="color: #1a2332; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h3>
                                <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.6;">
                                    <li>Complete your professional profile</li>
                                    <li>Access security training modules</li>
                                    <li>Take certification exams</li>
                                    <li>Join our community of security professionals</li>
                                </ul>
                            </div>

                            <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; text-align: center;">
                                This verification link will expire in 24 hours.<br>
                                If you didn't create an account, please ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                Questions? Contact us at
                                <a href="mailto:support@gspa.com" style="color: #c9aa68; text-decoration: none;">support@gspa.com</a>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 Global Security Practitioners Alliance. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
\`\`\`

## Password Reset Template

**Subject:** Reset Your Password - Global Security Practitioners Alliance

**HTML Body:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Global Security Practitioners Alliance</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a2332; padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Global Security Practitioners Alliance</h1>
                            <p style="color: #c9aa68; margin: 5px 0 0 0; font-size: 16px;">Password Reset</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1a2332; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>

                            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                We received a request to reset your password. Click the button below to create a new password for your account.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <a href="{{ .ConfirmationURL }}"
                                           style="background-color: #c9aa68; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(201, 170, 104, 0.3);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>

                            <p style="word-break: break-all; background-color: #f9fafb; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; font-size: 14px; color: #374151; margin: 10px 0;">
                                {{ .ConfirmationURL }}
                            </p>

                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🔒 Security Notice</h3>
                                <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
                                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and ensure your account is secure.
                                </p>
                            </div>

                            <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; text-align: center;">
                                Need help? Contact our support team at
                                <a href="mailto:support@gspa.com" style="color: #c9aa68; text-decoration: none;">support@gspa.com</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                Global Security Practitioners Alliance
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 Global Security Practitioners Alliance. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
\`\`\`

## How to Use These Templates

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication → Email Templates**

2. **Update Templates**
   - Select "Confirm signup" template
   - Replace the content with the first HTML template above
   - Select "Reset password" template
   - Replace the content with the second HTML template above

3. **Save Changes**
   - Click "Save" for each template

## Template Features

- **Professional Design**: Matches GSPA branding colors
- **Responsive**: Works on mobile and desktop
- **Accessibility**: Proper contrast and readable fonts
- **Security**: Clear expiration notices and security warnings
- **Branded**: Uses GSPA colors (#1a2332, #c9aa68)
- **User-Friendly**: Clear instructions and fallback links

## Available Variables

Supabase provides these variables you can use in templates:
- `{{ .ConfirmationURL }}` - The verification/reset link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - The raw token (if needed)

The templates are ready to copy and paste directly into your Supabase email template editor.
