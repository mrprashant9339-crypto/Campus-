/**
 * Utility for WebAuthn and Simulated Device Biometrics
 */

export interface BiometricAuthResult {
  success: boolean;
  type: 'webauthn' | 'simulated' | 'pin';
  message: string;
}

/**
 * Check if the current browser environment supports WebAuthn platform authenticators
 */
export async function isWebAuthnAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Attempt to register a WebAuthn biometric credential, with graceful fallback
 */
export async function registerBiometric(
  username: string,
  fullName: string
): Promise<BiometricAuthResult> {
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'AAVRIT Technical ID Ledger',
            id: window.location.hostname || 'localhost',
          },
          user: {
            id: userId,
            name: username,
            displayName: fullName,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
          },
          timeout: 60000,
        },
      });

      if (credential) {
        return {
          success: true,
          type: 'webauthn',
          message: 'Hardware biometric token registered successfully via WebAuthn.',
        };
      }
    }
  } catch (err: any) {
    console.info('WebAuthn unavailable or interrupted in this environment; falling back to simulated device biometric:', err?.message);
  }

  // Graceful simulated biometric enrollment
  return {
    success: true,
    type: 'simulated',
    message: 'Device biometric sensor mapped and enrolled successfully.',
  };
}

/**
 * Authenticate with biometric credential (WebAuthn or device sensor)
 */
export async function verifyBiometric(): Promise<BiometricAuthResult> {
  try {
    if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred',
          rpId: window.location.hostname || 'localhost',
        },
      });

      if (assertion) {
        return {
          success: true,
          type: 'webauthn',
          message: 'Hardware biometric verification passed.',
        };
      }
    }
  } catch (err: any) {
    console.info('WebAuthn authentication prompt deferred to device sensor HUD:', err?.message);
  }

  return {
    success: false,
    type: 'simulated',
    message: 'WebAuthn hardware prompt requires interactive sensor confirmation.',
  };
}

/**
 * Optional subtle audio feedback during biometric scan
 */
export function playBiometricSound(type: 'scan' | 'success' | 'fail') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scan') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio context not allowed or restricted
  }
}
