// lib/email.ts
'use server'

import nodemailer from 'nodemailer'

// ============================================
// NODEMAILER TRANSPORTER CONFIGURATION
// ============================================

/**
 * Creates a Nodemailer transporter configured for Gmail
 * Uses App Password authentication (requires 2FA enabled on Gmail)
 */
function createEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.error('❌ Email configuration missing: GMAIL_USER or GMAIL_APP_PASSWORD not set')
    throw new Error('Email service is not configured. Please contact system administrator.')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  })
}

// ============================================
// EMAIL NOTIFICATION RESULT TYPE
// ============================================

export interface EmailNotificationResult {
  emailSent: boolean
  emailError?: string
}

// ============================================
// SEND TREATMENT PLAN READY EMAIL
// ============================================

/**
 * Sends an email notification to the patient when their treatment plan is published
 * 
 * @param toEmail - Patient's email address
 * @param patientName - Patient's full name for personalization
 * @returns EmailNotificationResult with success status and any error message
 */
export async function sendPlanReadyEmail(
  toEmail: string,
  patientName: string
): Promise<EmailNotificationResult> {
  try {
    // Validate inputs
    if (!toEmail || !toEmail.includes('@')) {
      return {
        emailSent: false,
        emailError: 'Invalid email address provided'
      }
    }

    if (!patientName || patientName.trim().length === 0) {
      return {
        emailSent: false,
        emailError: 'Patient name is required for email personalization'
      }
    }

    // Create transporter
    const transporter = createEmailTransporter()

    // Ensure clean base URL
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`
    console.log('🔗 Generated Plan URL:', dashboardUrl)

    // Email content
    const subject = 'Update: Radiotherapy Plan Ready'

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Treatment Plan Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background-color: #2563eb; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🏥 Treatment Plan Update
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                Hello <strong>${patientName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                Your radiotherapy treatment plan has been prepared and is now ready for review.
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                Please log in to your patient dashboard to view your treatment schedule, preparation instructions, and other important details.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 4px; background-color: #2563eb;">
                    <a href="${dashboardUrl}" 
                       style="display: inline-block; padding: 14px 32px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold;">
                      View Treatment Plan
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                If you have any questions or concerns, please contact your healthcare provider or our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">
                This is an automated notification from your Radiotherapy Management System.
                <br>
                Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    const textBody = `
Hello ${patientName},

Your radiotherapy treatment plan has been prepared and is now ready for review.

Please log in to your patient dashboard to view your treatment schedule, preparation instructions, and other important details.

Dashboard: ${dashboardUrl}

If you have any questions or concerns, please contact your healthcare provider or our support team.

---
This is an automated notification from your Radiotherapy Management System.
Please do not reply to this email.
    `.trim()

    // Send email
    const info = await transporter.sendMail({
      from: `"Radiotherapy Management" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    })

    console.log('✅ Email sent successfully:', info.messageId)

    return {
      emailSent: true,
    }

  } catch (error) {
    console.error('❌ Email sending failed:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown email error occurred'

    return {
      emailSent: false,
      emailError: errorMessage,
    }
  }
}

// ============================================
// SEND TREATMENT COMPLETION EMAIL
// ============================================

/**
 * Sends a congratulations email to the patient when treatment is marked as complete
 */
export async function sendTreatmentCompletionEmail(
  toEmail: string,
  patientName: string
): Promise<EmailNotificationResult> {
  try {
    // Validate inputs
    if (!toEmail || !toEmail.includes('@')) {
      return { emailSent: false, emailError: 'Invalid email address' }
    }

    const transporter = createEmailTransporter()
    const subject = 'Congratulations! Treatment Completed 🎓'

    // Ensure clean base URL without trailing slash
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`

    console.log('🔗 Generated Dashboard URL:', dashboardUrl)

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fce7f3; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
    .button { display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div style="padding: 40px 0;">
    <div class="container">
      <div class="header">
        <h1 style="margin:0; font-size:28px;">🎉 Treatment Complete!</h1>
      </div>
      <div class="content">
        <h2 style="color: #4b5563; margin-top:0;">Congratulations, ${patientName}!</h2>
        <p>We are thrilled to inform you that your radiotherapy treatment course has been successfully marked as <strong>Complete</strong>.</p>
        <p>This is a significant milestone in your journey, and we are proud to have been part of your care team.</p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
          <strong>Next Steps:</strong> Please log in to your dashboard to view and download your official <strong>Treatment Completion Certificate</strong>.
        </div>

        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button" style="color: #ffffff;">View My Dashboard</a>
        </div>
      </div>
      <div class="footer">
        <p>Parirenyatwa Radiotherapy Center<br>Harare, Zimbabwe</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()

    const textBody = `
Congratulations ${patientName}!

We are thrilled to inform you that your radiotherapy treatment course has been successfully marked as Complete.

This is a significant milestone in your journey.

Please log in to your dashboard to view and download your official Treatment Completion Certificate:
${dashboardUrl}

Regards,
Parirenyatwa Radiotherapy Center
    `.trim()

    const info = await transporter.sendMail({
      from: `"Parirenyatwa Health" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    })

    console.log('✅ Completion email sent:', info.messageId)
    return { emailSent: true }

  } catch (error) {
    console.error('❌ Completion email failed:', error)
    return {
      emailSent: false,
      emailError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}