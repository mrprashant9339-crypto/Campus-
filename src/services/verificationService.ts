import {
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { saveUserVerificationToFirestore } from '../firebase/service';

export interface PhoneOtpSendResult {
  success: boolean;
  sessionToken?: string;
  phone?: string;
  maskedPhone?: string;
  expiresInSeconds?: number;
  carrierGateway?: string;
  previewSms?: {
    sender: string;
    body: string;
    code: string;
  };
  error?: string;
}

export interface PhoneOtpVerifyResult {
  success: boolean;
  verified: boolean;
  message?: string;
  certificate?: {
    isVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    verifiedRoleTitle: string;
    verifiedBy: string;
    verificationSealCode: string;
    otpVerifiedPhone: string;
    verifiedAt: string;
    clearanceLevel: string;
    securityToken: string;
    digitalSignature: string;
  };
  error?: string;
}

export interface EmailOtpSendResult {
  success: boolean;
  sessionToken?: string;
  email?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  emailRelay?: string;
  previewEmail?: {
    from: string;
    subject: string;
    body: string;
    code: string;
  };
  error?: string;
}

export interface EmailOtpVerifyResult {
  success: boolean;
  verified: boolean;
  message?: string;
  certificate?: {
    isVerified: boolean;
    email: string;
    emailVerified: boolean;
    verifiedBy: string;
    verificationSealCode: string;
    verifiedAt: string;
    securityToken: string;
    digitalSignature: string;
  };
  error?: string;
}

/**
 * Dispatches a real OTP to the phone number via SBTE server relay.
 */
export async function sendRealPhoneOtp(
  phone: string,
  userId?: string,
  role?: string
): Promise<PhoneOtpSendResult> {
  try {
    const res = await fetch('/api/verify/send-phone-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, userId, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to dispatch phone OTP' };
    }
    return data;
  } catch (err: any) {
    console.error('sendRealPhoneOtp network error:', err);
    return { success: false, error: err.message || 'Network error connecting to verification gateway' };
  }
}

/**
 * Validates the 6-digit OTP code against the server session and issues signed certificate.
 */
export async function verifyRealPhoneOtp(
  phone: string,
  otp: string,
  sessionToken?: string,
  userId?: string
): Promise<PhoneOtpVerifyResult> {
  try {
    const res = await fetch('/api/verify/verify-phone-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, sessionToken, userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, verified: false, error: data.error || 'Invalid OTP code' };
    }

    // If userId provided, persist verification to Firestore
    if (userId && data.certificate) {
      try {
        await saveUserVerificationToFirestore(userId, data.certificate);
      } catch (e) {
        console.warn('Firestore verification persistence note:', e);
      }
    }

    return data;
  } catch (err: any) {
    console.error('verifyRealPhoneOtp network error:', err);
    return { success: false, verified: false, error: err.message || 'Network error verifying OTP' };
  }
}

/**
 * Dispatches a real institutional email OTP code via server relay.
 */
export async function sendRealEmailOtp(
  email: string,
  userId?: string,
  role?: string
): Promise<EmailOtpSendResult> {
  try {
    const res = await fetch('/api/verify/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to dispatch email verification' };
    }
    return data;
  } catch (err: any) {
    console.error('sendRealEmailOtp network error:', err);
    return { success: false, error: err.message || 'Network error connecting to email relay' };
  }
}

/**
 * Validates the email OTP code and issues signed certificate.
 */
export async function verifyRealEmailOtp(
  email: string,
  otp: string,
  sessionToken?: string,
  userId?: string
): Promise<EmailOtpVerifyResult> {
  try {
    const res = await fetch('/api/verify/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, sessionToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, verified: false, error: data.error || 'Invalid email verification code' };
    }

    if (userId && data.certificate) {
      try {
        await saveUserVerificationToFirestore(userId, {
          emailVerified: true,
          emailCertificate: data.certificate,
        });
      } catch (e) {
        console.warn('Firestore email verification persistence note:', e);
      }
    }

    return data;
  } catch (err: any) {
    console.error('verifyRealEmailOtp network error:', err);
    return { success: false, verified: false, error: err.message || 'Network error verifying email code' };
  }
}

/**
 * Real Firebase Authentication Email Verification Flow:
 * Triggers Firebase to send an official confirmation link to user's registered email.
 */
export async function sendFirebaseOfficialEmailVerification(user?: FirebaseUser | null): Promise<{
  success: boolean;
  message: string;
}> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    return {
      success: false,
      message: 'No active Firebase Authentication session found. Please sign in or use Institutional OTP verification.',
    };
  }

  try {
    await sendEmailVerification(targetUser, {
      url: window.location.origin + '?email_verified=true',
      handleCodeInApp: true,
    });
    return {
      success: true,
      message: `Official verification link sent to ${targetUser.email}. Please check your inbox and click the link.`,
    };
  } catch (err: any) {
    console.error('Firebase sendEmailVerification error:', err);
    if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'A verification email was recently sent. Please check your inbox or wait a moment before retrying.',
      };
    }
    return {
      success: false,
      message: err.message || 'Failed to dispatch Firebase verification email.',
    };
  }
}

/**
 * Reloads the Firebase user and returns current verified status.
 */
export async function checkFirebaseOfficialEmailStatus(user?: FirebaseUser | null): Promise<boolean> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return false;
  try {
    await targetUser.reload();
    return Boolean(targetUser.emailVerified);
  } catch (err) {
    console.warn('Failed to reload Firebase user:', err);
    return Boolean(targetUser.emailVerified);
  }
}

/**
 * Signs up with real Firebase Email & Password and triggers verification email.
 */
export async function signupWithRealFirebase(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser | null; error?: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Initial verification email note:', e);
    }
    return { user: cred.user };
  } catch (err: any) {
    console.error('Firebase signup error:', err);
    return { user: null, error: err.message || 'Failed to create Firebase account' };
  }
}

/**
 * Signs in with real Firebase Email & Password.
 */
export async function signinWithRealFirebase(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser | null; error?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { user: cred.user };
  } catch (err: any) {
    console.error('Firebase signin error:', err);
    return { user: null, error: err.message || 'Invalid email or password' };
  }
}

/**
 * Sends a real Firebase Password Reset Email.
 */
export async function sendFirebasePasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `Password reset instructions sent to ${email}. Check your inbox.`,
    };
  } catch (err: any) {
    console.error('Firebase password reset error:', err);
    return {
      success: false,
      message: err.message || 'Failed to send password reset email.',
    };
  }
}
