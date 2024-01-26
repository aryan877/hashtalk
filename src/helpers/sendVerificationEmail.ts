import { resend } from '@/lib/resend';
import { StandardApiResponse } from '@/types/ApiResponse';
import VerificationEmail from '../../emails/VerificationEmail';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<StandardApiResponse> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'HashTalk Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
