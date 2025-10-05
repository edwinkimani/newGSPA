import { hash, compare } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import * as nodemailer from 'nodemailer'

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'your-secret-key'
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@gspa.com'

// Gmail SMTP configuration (only if credentials are provided)
const gmailTransporter = process.env.GMAIL_USER && process.env.GMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })
  : null

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateToken(payload: object, expiresIn: string = '1d'): string {
  return (sign as any)(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): object | string | null {
  try {
    return verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  console.log(`=== EMAIL VERIFICATION REQUEST ===`)
  console.log(`To: ${email}`)
  console.log(`Token: ${token}`)
  console.log(`Verification URL: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`)
  console.log(`==================================`)

  try {
    // Send email using Gmail SMTP if configured, otherwise log to console
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`

    if (!gmailTransporter) {
      console.log('Gmail SMTP not configured - verification URL logged to console')
      return
    }

    await gmailTransporter!.sendMail({
      from: `Global Security Practitioners Alliance <${process.env.GMAIL_USER || 'edwinngila8@gmail.com'}>`,
      to: email,
      subject: 'Welcome to Global Security Practitioners Alliance - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a2332; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Global Security Practitioners Alliance</h1>
          </div>
          <div style="background-color: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 30px;">
            <h2 style="color: #1a2332; margin-top: 0;">Email Verification</h2>
            <p style="color: #6b7280; line-height: 1.6;">Welcome to the Global Security Practitioners Alliance! Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #c9aa68; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #374151; font-size: 14px; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link will expire in 7 days. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      `
    })

    console.log('Verification email sent successfully via Gmail')
  } catch (error) {
    console.error('Failed to send verification email:', error)
    // Don't throw error - allow registration to continue
    console.log('Registration will continue, but email was not sent')
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log(`=== PASSWORD RESET REQUEST ===`)
  console.log(`To: ${email}`)
  console.log(`Token: ${token}`)
  console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)
  console.log(`==============================`)

  try {
    // Send email using Gmail SMTP if configured, otherwise log to console
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    if (!gmailTransporter) {
      console.log('Gmail SMTP not configured - reset URL logged to console')
      return
    }

    await gmailTransporter!.sendMail({
      from: `Global Security Practitioners Alliance <${process.env.GMAIL_USER || 'edwinngila8@gmail.com'}>`,
      to: email,
      subject: 'Reset Your Password - Global Security Practitioners Alliance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a2332; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Global Security Practitioners Alliance</h1>
          </div>
          <div style="background-color: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 30px;">
            <h2 style="color: #1a2332; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #6b7280; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #c9aa68; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #374151; font-size: 14px; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link will expire in 1 day. If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      `
    })

    console.log('Password reset email sent successfully via Gmail')
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    // Don't throw error - allow password reset to continue
    console.log('Password reset will continue, but email was not sent')
  }
}
