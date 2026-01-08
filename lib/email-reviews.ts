// lib/email-reviews.ts
'use server'

import nodemailer from 'nodemailer'

// Import the email result type and transporter creator from main email file
import type { EmailNotificationResult } from './email'

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
// SEND REVIEW SCHEDULE EMAIL
// ============================================

/**
 * Sends an email notification to the patient when post-treatment reviews are scheduled
 */
export async function sendReviewScheduleEmail(
  toEmail: string,
  patientName: string,
  reviews: Array<{ reviewNumber: number; date: string; location: string }>
): Promise<EmailNotificationResult> {
  try {
    if (!toEmail || !toEmail.includes('@')) {
      return { emailSent: false, emailError: 'Invalid email address' }
    }

    const transporter = createEmailTransporter()
    const subject = '📅 Your Follow-Up Review Schedule'

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }

    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    baseUrl = baseUrl.replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`

    const reviewsList = reviews.map(r => {
      const date = new Date(r.date)
      return `
        <tr>
          <td style="padding: 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="width: 50px; height: 50px; background-color: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                ${r.reviewNumber}
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">Review ${r.reviewNumber}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                  📅 ${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                  📍 ${r.location}
                </p>
              </div>
            </div>
          </td>
        </tr>
      `
    }).join('')

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px; color: #374151; line-height: 1.6; }
    .button { display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div style="padding: 40px 0;">
    <div class="container">
      <div class="header">
        <h1 style="margin:0; font-size:28px;">📅 Follow-Up Review Schedule</h1>
      </div>
      <div class="content">
        <h2 style="color: #4b5563; margin-top:0;">Hello ${patientName},</h2>
        <p>Congratulations on completing your radiotherapy treatment! As part of your recovery journey, we have scheduled <strong>3 follow-up review appointments</strong> for you.</p>
        
        <p style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <strong>Important:</strong> Please attend all scheduled reviews. These appointments help us monitor your recovery and ensure the best possible outcome.
        </p>

        <h3 style="color: #1f2937; margin-top: 30px;">Your Review Schedule:</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${reviewsList}
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${dashboardUrl}" class="button" style="color: #ffffff;">View Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you need to reschedule any appointment, please contact our office as soon as possible.
        </p>
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
Hello ${patientName},

Congratulations on completing your radiotherapy treatment! As part of your recovery journey, we have scheduled 3 follow-up review appointments for you.

Your Review Schedule:

${reviews.map(r => {
      const date = new Date(r.date)
      return `Review ${r.reviewNumber}:
  Date: ${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
  Location: ${r.location}`
    }).join('\n\n')}

Please attend all scheduled reviews. These appointments help us monitor your recovery and ensure the best possible outcome.

View your dashboard: ${dashboardUrl}

If you need to reschedule any appointment, please contact our office as soon as possible.

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

    console.log('✅ Review schedule email sent:', info.messageId)
    return { emailSent: true }

  } catch (error) {
    console.error('❌ Review schedule email failed:', error)
    return {
      emailSent: false,
      emailError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// SEND REVIEW COMPLETION EMAIL (NEW)
// ============================================

/**
 * Sends an email notification when a specific review is marked as complete
 */
export async function sendReviewCompletionEmail(
  toEmail: string,
  patientName: string,
  reviewNumber: number,
  notes?: string
): Promise<EmailNotificationResult> {
  try {
    if (!toEmail || !toEmail.includes('@')) {
      return { emailSent: false, emailError: 'Invalid email address' }
    }

    const transporter = createEmailTransporter()
    const subject = `✅ Review ${reviewNumber} Completed`

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }

    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    baseUrl = baseUrl.replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 20px; text-align: center; color: white; }
    .content { padding: 30px; color: #374151; line-height: 1.6; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
    .notes-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div style="padding: 40px 0;">
    <div class="container">
      <div class="header">
        <h1 style="margin:0; font-size:24px;">Review ${reviewNumber} Complete</h1>
      </div>
      <div class="content">
        <h2 style="color: #1f2937; margin-top:0;">Hello ${patientName},</h2>
        <p>This email is to confirm that your <strong>Follow-up Review ${reviewNumber}</strong> has been successfully completed.</p>
        
        ${notes ? `
        <div class="notes-box">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #1e40af;">Doctor's Notes / Outcome:</p>
          <p style="margin: 0; color: #1e3a8a;">${notes}</p>
        </div>
        ` : ''}

        <p>Please log in to your dashboard to view your progress and check the schedule for your next review.</p>

        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button" style="color: #ffffff;">View Dashboard</a>
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
Review ${reviewNumber} Complete

Hello ${patientName},

This email is to confirm that your Follow-up Review ${reviewNumber} has been successfully completed.

${notes ? `Doctor's Notes / Outcome:\n${notes}\n` : ''}

Please log in to your dashboard to view your progress.

View your dashboard: ${dashboardUrl}

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

    console.log(`✅ Review ${reviewNumber} completion email sent:`, info.messageId)
    return { emailSent: true }

  } catch (error) {
    console.error(`❌ Review ${reviewNumber} completion email failed:`, error)
    return {
      emailSent: false,
      emailError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// SEND TREATMENT SUCCESS EMAIL
// ============================================

/**
 * Sends a success email when all reviews pass and treatment is deemed successful
 */
export async function sendTreatmentSuccessEmail(
  toEmail: string,
  patientName: string
): Promise<EmailNotificationResult> {
  try {
    if (!toEmail || !toEmail.includes('@')) {
      return { emailSent: false, emailError: 'Invalid email address' }
    }

    const transporter = createEmailTransporter()
    const subject = '🎉 Treatment Journey Successfully Completed!'

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }

    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    baseUrl = baseUrl.replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #fef3c7 0%, #dbeafe 100%); margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 20px; text-align: center; color: white; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.8; }
    .button { display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 25px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); }
    .celebration { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div style="padding: 40px 0;">
    <div class="container">
      <div class="header">
        <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
        <h1 style="margin:0; font-size:32px; font-weight: bold;">Congratulations!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Treatment Journey Complete</p>
      </div>
      <div class="content">
        <h2 style="color: #059669; margin-top:0; font-size: 24px;">Dear ${patientName},</h2>
        
        <div class="celebration">
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #92400e;">🌟 Excellent News! 🌟</p>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #92400e;">All your follow-up reviews have been successfully completed!</p>
        </div>

        <p style="font-size: 16px;">We are absolutely delighted to inform you that you have successfully completed your <strong>entire cancer treatment journey</strong> at Parirenyatwa Radiotherapy Center.</p>
        
        <p style="font-size: 16px;">This is a tremendous achievement and a testament to your strength, resilience, and dedication throughout the treatment process.</p>

        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <p style="margin: 0; font-size: 15px; color: #065f46;">
            <strong>✅ What This Means:</strong><br>
            Your treatment has been successful, all follow-up reviews show positive results, and your healthcare team has confirmed your recovery progress. You have officially completed your care plan!
          </p>
        </div>

        <p style="font-size: 16px;">You can now view and download your <strong>Treatment Completion Certificate</strong> from your patient dashboard.</p>

        <div style="text-align: center; margin-top: 35px;">
          <a href="${dashboardUrl}" class="button" style="color: #ffffff;">View My Certificate</a>
        </div>

        <p style="margin-top: 35px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          We wish you continued health and happiness. If you have any questions or concerns in the future, please don't hesitate to contact us.
        </p>
      </div>
      <div class="footer">
        <p style="font-weight: bold; color: #059669; font-size: 14px;">Parirenyatwa Radiotherapy Center</p>
        <p>Harare, Zimbabwe</p>
        <p style="margin-top: 10px; font-style: italic;">Wishing you a healthy future! 🌈</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()

    const textBody = `
🎉 CONGRATULATIONS! 🎉

Dear ${patientName},

We are absolutely delighted to inform you that you have successfully completed your entire cancer treatment journey at Parirenyatwa Radiotherapy Center.

✅ What This Means:
Your treatment has been successful, all follow-up reviews show positive results, and your healthcare team has confirmed your recovery progress. You have officially completed your care plan!

This is a tremendous achievement and a testament to your strength, resilience, and dedication throughout the treatment

 process.

You can now view and download your Treatment Completion Certificate from your patient dashboard:
${dashboardUrl}

We wish you continued health and happiness. If you have any questions or concerns in the future, please don't hesitate to contact us.

Warmest regards,
Parirenyatwa Radiotherapy Center
Harare, Zimbabwe

Wishing you a healthy future! 🌈
    `.trim()

    const info = await transporter.sendMail({
      from: `"Parirenyatwa Health" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    })

    console.log('✅ Treatment success email sent:', info.messageId)
    return { emailSent: true }

  } catch (error) {
    console.error('❌ Treatment success email failed:', error)
    return {
      emailSent: false,
      emailError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// SEND TREATMENT RESTART EMAIL
// ============================================

/**
 * Sends an email when treatment needs to be restarted
 */
export async function sendTreatmentRestartEmail(
  toEmail: string,
  patientName: string,
  reason: string
): Promise<EmailNotificationResult> {
  try {
    if (!toEmail || !toEmail.includes('@')) {
      return { emailSent: false, emailError: 'Invalid email address' }
    }

    const transporter = createEmailTransporter()
    const subject = 'Treatment Plan Update Required'

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }

    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    baseUrl = baseUrl.replace(/\/$/, '')
    const dashboardUrl = `${baseUrl}/dashboard`

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 35px 30px; color: #374151; line-height: 1.7; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div style="padding: 40px 0;">
    <div class="container">
      <div class="header">
        <h1 style="margin:0; font-size:28px;">Treatment Plan Update</h1>
      </div>
      <div class="content">
        <h2 style="color: #4b5563; margin-top:0;">Dear ${patientName},</h2>
        
        <p style="font-size: 16px;">Following your recent follow-up reviews, your healthcare team has determined that your treatment plan needs to be <strong>revised and updated</strong>.</p>

        ${reason ? `
        <div class="info-box">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">Reason for Treatment Revision:</p>
          <p style="margin: 0; color: #92400e; font-size: 15px;">${reason}</p>
        </div>
        ` : ''}

        <h3 style="color: #1f2937; font-size: 18px;">What Happens Next?</h3>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li style="margin-bottom: 10px;">Your previous scans will be reviewed by our medical team</li>
            <li style="margin-bottom: 10px;">A new, personalized treatment plan will be prepared</li>
            <li style="margin-bottom: 10px;">You will be notified once the new plan is ready</li>
            <li>Our team will guide you through every step of the process</li>
          </ol>
        </div>

        <p style="font-size: 16px;">Please be assured that this is a standard part of comprehensive cancer care. Our dedicated team is committed to providing you with the best possible treatment outcome.</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${dashboardUrl}" class="button" style="color: #ffffff;">View My Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <strong>Need Support?</strong><br>
          If you have any questions or concerns, please don't hesitate to contact our care team. We are here to support you every step of the way.
        </p>
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
Treatment Plan Update

Dear ${patientName},

Following your recent follow-up reviews, your healthcare team has determined that your treatment plan needs to be revised and updated.

${reason ? `Reason for Treatment Revision:\n${reason}\n` : ''}

What Happens Next?

1. Your previous scans will be reviewed by our medical team
2. A new, personalized treatment plan will be prepared
3. You will be notified once the new plan is ready
4. Our team will guide you through every step of the process

Please be assured that this is a standard part of comprehensive cancer care. Our dedicated team is committed to providing you with the best possible treatment outcome.

View your dashboard: ${dashboardUrl}

Need Support?
If you have any questions or concerns, please don't hesitate to contact our care team. We are here to support you every step of the way.

Regards,
Parirenyatwa Radiotherapy Center
Harare, Zimbabwe
    `.trim()

    const info = await transporter.sendMail({
      from: `"Parirenyatwa Health" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    })

    console.log('✅ Treatment restart email sent:', info.messageId)
    return { emailSent: true }

  } catch (error) {
    console.error('❌ Treatment restart email failed:', error)
    return {
      emailSent: false,
      emailError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
