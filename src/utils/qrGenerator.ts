import QRCode from 'qrcode';

export interface StudentQrData {
  studentId: string;
  fullName: string;
  rollNumber: string;
  collegeId: string;
  collegeName: string;
  verificationUrl: string;
}

/**
 * Returns the public verification URL for a given student ID.
 * When scanned by any smartphone camera (iPhone, Android, Google Lens),
 * this URL opens the verified student card.
 */
export function getStudentVerificationUrl(studentId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/?verify_student=${encodeURIComponent(studentId)}`;
  }
  return `https://aavrit.bihar.gov.in/verify?id=${encodeURIComponent(studentId)}`;
}

/**
 * Generates a real, high-resolution QR code Data URL that can be scanned by any phone
 */
export async function generateStudentQrDataUrl(studentId: string): Promise<string> {
  const url = getStudentVerificationUrl(studentId);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: {
        dark: '#141414',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR data URL with qrcode library:', err);
    // Fallback URL generator
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  }
}
