import { Resend } from 'resend';
import { prisma } from '@/lib/db';

/**
 * Generate a random 6-digit numeric OTP string (e.g., "749201")
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if an active OTP was recently created for the identifier within the last 60 seconds.
 */
export async function isRateLimited(identifier: string): Promise<boolean> {
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      identifier,
      createdAt: {
        gt: sixtySecondsAgo,
      },
    },
  });

  return !!recentOtp;
}

/**
 * Creates an OTP record in the database and sends it via Email (Resend) or SMS (MSG91).
 */
export async function createAndSendOtp(identifier: string): Promise<void> {
  const isEmail = identifier.includes('@');
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  // 1. Delete any existing OTP records for this identifier first
  await prisma.otpCode.deleteMany({
    where: { identifier },
  });

  // 2. Persist the new OTP code in MongoDB via Prisma
  await prisma.otpCode.create({
    data: {
      identifier,
      code: otp,
      expiresAt,
    },
  });

  // 3. Dispatch OTP to the respective channel
  if (isEmail) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error(
        'RESEND_API_KEY is not configured in environment variables. Please configure Resend to send OTP emails.'
      );
    }

    const resend = new Resend(resendApiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Shel <onboarding@resend.dev>';

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: identifier,
      subject: `Your Shel Verification Code: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #F3F1E7; color: #2A2A2A; border-radius: 16px; border: 1px solid #E4E1D6;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2C3E36; font-size: 26px; margin: 0; font-family: Georgia, serif;">Shel Collection</h1>
            <p style="color: #6B6B63; font-size: 13px; margin-top: 4px;">Hostel & PG Sanctuary Verification</p>
          </div>

          <div style="background-color: #FFFFFF; border-radius: 12px; padding: 28px 24px; border: 1px solid #E4E1D6; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <p style="font-size: 14px; color: #2A2A2A; margin: 0 0 16px 0;">Use the verification code below to log in to your account:</p>
            
            <div style="display: inline-block; padding: 14px 28px; background-color: #FAF9F5; border: 1.5px dashed #2C3E36; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2C3E36; font-family: monospace; margin: 8px 0 16px 0;">
              ${otp}
            </div>

            <p style="font-size: 12px; color: #6B6B63; margin: 0;">
              ⏳ This verification code <strong>expires in 5 minutes</strong>.
            </p>
          </div>

          <p style="font-size: 11px; color: #6B6B63; text-align: center; margin-top: 24px;">
            If you did not request this login code, you can safely ignore this message.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend delivery error:', error);
      throw new Error(`Failed to send email OTP: ${error.message}`);
    }
  } else {
    // SMS Flow via MSG91 REST API
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      throw new Error(
        'MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is not configured in environment variables. Please configure MSG91 to send SMS OTPs.'
      );
    }

    // Clean phone number: remove non-digits
    const cleanMobile = identifier.replace(/\D/g, '');
    // Ensure country code prefix if 10-digit Indian number
    const formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    try {
      const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: formattedMobile,
          otp: otp,
          expiry: 5, // 5 minutes
        }),
      });

      const data = await response.json();
      if (!response.ok || (data.type && data.type.toLowerCase() === 'error')) {
        console.error('MSG91 API error response:', data);
        throw new Error(data.message || 'SMS delivery failed via MSG91');
      }
    } catch (err: any) {
      console.error('MSG91 fetch error:', err);
      throw new Error(`Failed to send SMS OTP: ${err.message}`);
    }
  }
}

/**
 * Validates the OTP against the database and deletes the record upon successful verification.
 */
export async function verifyOtp(identifier: string, code: string): Promise<boolean> {
  if (!identifier || !code) return false;

  const validOtp = await prisma.otpCode.findFirst({
    where: {
      identifier,
      code: code.trim(),
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!validOtp) {
    return false;
  }

  // Delete matching OTP record immediately so it cannot be reused
  await prisma.otpCode.deleteMany({
    where: { identifier },
  });

  return true;
}
