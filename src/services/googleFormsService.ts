import { auth, googleProvider } from '../firebase/config';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export const GOOGLE_WORKSPACE_FORMS_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
];

// Configure googleProvider with the requested workspace scopes
GOOGLE_WORKSPACE_FORMS_SCOPES.forEach((scope) => {
  try {
    googleProvider.addScope(scope);
  } catch {
    // Ignore if already added
  }
});

// Deployment URLs provided by administrator
export const PUBLISHED_RUN_URL = 'https://aavrit-campus-network1-804263472202.asia-southeast1.run.app';
export const DEV_APP_URL = 'https://ais-dev-hhu6ignoinflyx43ifzgdz-507990647905.asia-east1.run.app';
export const GCP_PROJECT_ID = 'company-plasma-sh7nb';

// In-memory access token cache (CRITICAL: Do NOT store in localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
let isSigningIn = false;

// Listeners for token/auth changes
type AuthChangeListener = (token: string | null, user: FirebaseUser | null) => void;
const authListeners: Set<AuthChangeListener> = new Set();

function notifyListeners(user: FirebaseUser | null = auth.currentUser) {
  authListeners.forEach((listener) => listener(inMemoryAccessToken, user));
}

export function subscribeToGoogleFormsAuth(listener: AuthChangeListener): () => void {
  authListeners.add(listener);
  listener(inMemoryAccessToken, auth.currentUser);
  return () => {
    authListeners.delete(listener);
  };
}

// Clear token on sign-out as per workspace-integration skill
onAuthStateChanged(auth, (user) => {
  if (!user) {
    inMemoryAccessToken = null;
    notifyListeners(null);
  } else {
    notifyListeners(user);
  }
});

export function getCachedAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setManualAccessToken(token: string | null) {
  inMemoryAccessToken = token ? token.trim() : null;
  notifyListeners(auth.currentUser);
}

/**
 * Interactive Google Sign-In with popup
 * Requests all Google Forms and Drive scopes
 */
export async function signInWithGoogleForms(): Promise<{
  user: FirebaseUser;
  accessToken: string;
}> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error(
        'Google OAuth access token was not returned. You can also paste an access token manually.'
      );
    }

    inMemoryAccessToken = credential.accessToken;
    notifyListeners(result.user);
    return { user: result.user, accessToken: inMemoryAccessToken };
  } catch (error: any) {
    console.error('Google Forms sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export interface OAuthHandshakeTriggerResult {
  authUrl: string;
  targetRedirectUri: string;
  isIframe: boolean;
  navigated: boolean;
}

/**
 * Triggers the manual OAuth handshake targeting the provided App URL or Published URL.
 * Handles both top-level navigation and iframe sandbox constraints.
 */
export async function triggerOAuthHandshake(options?: {
  redirectUri?: string;
  mode?: 'direct_google' | 'firebase_redirect';
}): Promise<OAuthHandshakeTriggerResult> {
  const targetRedirectUri =
    options?.redirectUri ||
    DEV_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const clientId = '804263472202-ukpnf1en1q70fdibi1hj3jnlnee1m1ab.apps.googleusercontent.com';
  const scopes = [
    'openid',
    'email',
    'profile',
    ...GOOGLE_WORKSPACE_FORMS_SCOPES,
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    targetRedirectUri
  )}&response_type=token&scope=${encodeURIComponent(
    scopes
  )}&include_granted_scopes=true&state=aavrit_manual_handshake&prompt=select_account`;

  if (options?.mode === 'firebase_redirect') {
    await signInWithRedirect(auth, googleProvider);
    return {
      authUrl,
      targetRedirectUri,
      isIframe: typeof window !== 'undefined' && window.self !== window.top,
      navigated: true,
    };
  }

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  let navigated = false;

  if (typeof window !== 'undefined') {
    if (!isIframe) {
      window.location.href = authUrl;
      navigated = true;
    } else {
      try {
        if (window.top) {
          window.top.location.href = authUrl;
          navigated = true;
        }
      } catch (e) {
        // Cross-origin iframe frame-ancestors prevents top navigation
        navigated = false;
      }
    }
  }

  return {
    authUrl,
    targetRedirectUri,
    isIframe,
    navigated,
  };
}

/**
 * Broadcasts an OAuth token across tabs using BroadcastChannel and window message
 */
export function broadcastOAuthToken(token: string) {
  if (typeof window === 'undefined' || !token) return;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('aavrit_oauth_handshake');
      bc.postMessage({ type: 'OAUTH_TOKEN_RECEIVED', token });
      bc.close();
    } catch {
      // ignore
    }
  }

  try {
    window.postMessage({ type: 'OAUTH_TOKEN_RECEIVED', token }, '*');
    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_TOKEN_RECEIVED', token }, '*');
    }
  } catch {
    // ignore
  }
}

/**
 * Parses and handles OAuth callback parameters (access_token, token, code, or error) from URL.
 */
export function handleOAuthCallbackFromUrl(): {
  success: boolean;
  token?: string;
  error?: string;
} {
  if (typeof window === 'undefined') return { success: false };

  try {
    // 1. Check hash parameters (Implicit flow: #access_token=...&token_type=Bearer)
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(rawHash);
    const tokenFromHash = hashParams.get('access_token');

    // 2. Check query parameters (?access_token=... or ?oauth_token=...)
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = queryParams.get('access_token') || queryParams.get('token');
    const errorParam = hashParams.get('error') || queryParams.get('error');

    if (errorParam) {
      console.warn('OAuth callback returned error:', errorParam);
      return { success: false, error: errorParam };
    }

    const token = tokenFromHash || tokenFromQuery;
    if (token) {
      setManualAccessToken(token);
      broadcastOAuthToken(token);

      // Clean up URL parameters to keep URL clean while retaining route
      const cleanSearch = new URLSearchParams(window.location.search);
      cleanSearch.delete('access_token');
      cleanSearch.delete('token');
      const searchStr = cleanSearch.toString() ? `?${cleanSearch.toString()}` : '';
      const cleanUrl = window.location.pathname + searchStr;
      window.history.replaceState({}, document.title, cleanUrl);

      return { success: true, token };
    }
  } catch (err: any) {
    console.error('OAuth callback parsing error:', err);
    return { success: false, error: err.message };
  }

  return { success: false };
}

/**
 * Formats Google Forms URLs safely with embedded=true
 */
export function formatGoogleFormEmbedUrl(rawUrlOrId: string): string {
  if (!rawUrlOrId) return '';
  const trimmed = rawUrlOrId.trim();

  // If already contains embedded=true
  if (trimmed.includes('embedded=true')) {
    return trimmed;
  }

  // Google Forms docs URL
  if (trimmed.includes('docs.google.com/forms')) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}embedded=true`;
  }

  // Raw Form ID
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return `https://docs.google.com/forms/d/e/${trimmed}/viewform?embedded=true`;
  }

  // Custom or Cloud Run URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://docs.google.com/forms/d/e/${encodeURIComponent(trimmed)}/viewform?embedded=true`;
}

export async function signOutGoogleForms(): Promise<void> {
  await signOut(auth);
  inMemoryAccessToken = null;
  notifyListeners(null);
}

// -------------------------------------------------------------
// Google Forms API Interfaces
// -------------------------------------------------------------

export interface FormQuestionItem {
  id?: string;
  title: string;
  description?: string;
  type: 'CHOICE' | 'TEXT' | 'PARAGRAPH' | 'SCALE';
  required?: boolean;
  options?: string[]; // For CHOICE
  lowScale?: number; // For SCALE
  highScale?: number;
  lowLabel?: string;
  highLabel?: string;
}

export interface GoogleFormMetadata {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  settings?: {
    quizSettings?: { isQuiz?: boolean };
  };
  items?: Array<{
    itemId: string;
    title: string;
    description?: string;
    questionItem?: {
      question: {
        questionId: string;
        required?: boolean;
        choiceQuestion?: {
          type: string;
          options: Array<{ value: string }>;
        };
        textQuestion?: {
          paragraph?: boolean;
        };
        scaleQuestion?: {
          low: number;
          high: number;
          lowLabel?: string;
          highLabel?: string;
        };
      };
    };
  }>;
  revisionId?: string;
  responderUri?: string;
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers?: Record<
    string,
    {
      questionId: string;
      textAnswers?: {
        answers: Array<{ value: string }>;
      };
    }
  >;
}

export interface GoogleFormsResponsesList {
  responses?: GoogleFormResponseItem[];
  nextPageToken?: string;
}

export interface DriveFormFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

/**
 * Extracts raw Form ID from a variety of Google Forms URLs or raw ID strings
 */
export function extractGoogleFormId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  // Matching: https://docs.google.com/forms/d/e/1FAIpQLS.../viewform
  // or https://docs.google.com/forms/d/1FAIpQLS.../edit
  const match = trimmed.match(/\/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Remove query params or slashes
  return trimmed.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
}

/**
 * Fetch Google Form metadata by Form ID
 */
export async function fetchGoogleForm(formId: string, customToken?: string): Promise<GoogleFormMetadata> {
  const token = customToken || inMemoryAccessToken;
  if (!token) {
    throw new Error('Authentication required: Please sign in with Google or provide an access token.');
  }

  const safeFormId = encodeURIComponent(extractGoogleFormId(formId));
  const response = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Forms API returned HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch Google Form Responses by Form ID
 */
export async function fetchGoogleFormResponses(
  formId: string,
  customToken?: string
): Promise<GoogleFormsResponsesList> {
  const token = customToken || inMemoryAccessToken;
  if (!token) {
    throw new Error('Authentication required: Please sign in with Google or provide an access token.');
  }

  const safeFormId = encodeURIComponent(extractGoogleFormId(formId));
  const response = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Forms Responses API returned HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Create a new Google Form using Google Forms API v1
 */
export async function createGoogleForm(
  title: string,
  description: string,
  questions: FormQuestionItem[],
  customToken?: string
): Promise<GoogleFormMetadata> {
  const token = customToken || inMemoryAccessToken;
  if (!token) {
    throw new Error('Authentication required: Please sign in with Google or provide an access token.');
  }

  // 1. Create the initial blank form with document title
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title.trim(),
        documentTitle: title.trim(),
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create form: HTTP ${createRes.status}`);
  }

  const createdForm: GoogleFormMetadata = await createRes.json();
  const formId = createdForm.formId;

  // 2. Batch update to add description and question items if requested
  const requests: any[] = [];

  // Update description
  if (description) {
    requests.push({
      updateFormInfo: {
        info: {
          description: description.trim(),
        },
        updateMask: 'description',
      },
    });
  }

  // Add questions
  questions.forEach((q, index) => {
    const questionObj: any = {
      required: !!q.required,
    };

    if (q.type === 'CHOICE') {
      questionObj.choiceQuestion = {
        type: 'RADIO',
        options: (q.options || ['Option 1', 'Option 2']).map((val) => ({ value: val })),
      };
    } else if (q.type === 'PARAGRAPH') {
      questionObj.textQuestion = {
        paragraph: true,
      };
    } else if (q.type === 'TEXT') {
      questionObj.textQuestion = {
        paragraph: false,
      };
    } else if (q.type === 'SCALE') {
      questionObj.scaleQuestion = {
        low: q.lowScale || 1,
        high: q.highScale || 5,
        lowLabel: q.lowLabel || 'Poor',
        highLabel: q.highLabel || 'Excellent',
      };
    }

    requests.push({
      createItem: {
        item: {
          title: q.title,
          description: q.description || '',
          questionItem: {
            question: questionObj,
          },
        },
        location: {
          index,
        },
      },
    });
  });

  if (requests.length > 0) {
    const updateRes = await fetch(
      `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!updateRes.ok) {
      console.warn('Batch update returned error, returning created form container:', await updateRes.text());
    }
  }

  // Fetch complete updated form metadata
  return fetchGoogleForm(formId, token);
}

/**
 * List Google Forms files stored in user Google Drive
 */
export async function listDriveGoogleForms(customToken?: string): Promise<DriveFormFile[]> {
  const token = customToken || inMemoryAccessToken;
  if (!token) {
    throw new Error('Authentication required to browse Google Drive files.');
  }

  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.form' and trashed = false");
  const fields = encodeURIComponent('files(id, name, mimeType, webViewLink, createdTime, modifiedTime, owners)');

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

// -------------------------------------------------------------
// Pre-Configured Campus Bihar Polytechnic Forms
// -------------------------------------------------------------

export interface CampusFormTemplate {
  id: string;
  title: string;
  category: 'academic' | 'grievance' | 'event' | 'hostel' | 'placement';
  targetAudience: string;
  description: string;
  isPrivate?: boolean;
  requiredRoleType?: 'student_or_staff' | 'staff_only' | 'student_only';
  embedUrl?: string;
  publishedUrl?: string;
  questions: FormQuestionItem[];
}

export const CAMPUS_FORM_TEMPLATES: CampusFormTemplate[] = [
  {
    id: 'tmpl-sbte-feedback-2026',
    title: 'SBTE Bihar End-Semester Faculty & Course Feedback 2026',
    category: 'academic',
    targetAudience: 'All Diploma Students (Semesters I to VI)',
    description:
      'Official statutory student feedback survey evaluating curriculum delivery, teacher pedagogy, practical lab engagement, and syllabus completion according to AICTE/SBTE standards.',
    isPrivate: true,
    requiredRoleType: 'student_or_staff',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-bihar-polytechnic-faculty-eval-2026/viewform?embedded=true',
    publishedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-bihar-polytechnic-faculty-eval-2026/viewform',
    questions: [
      {
        title: 'Select Your Institution & Department',
        type: 'CHOICE',
        required: true,
        options: [
          'GP Patna-7 (Mechanical Engineering)',
          'GP Patna-7 (Civil Engineering)',
          'GP Patna-7 (Electrical Engineering)',
          'GP Patna-7 (Computer Science)',
          'GP Barauni (All Branches)',
          'GP Muzaffarpur (All Branches)',
          'Other Government Polytechnic',
        ],
      },
      {
        title: 'Course Syllabus Coverage & Pace of Teaching',
        type: 'SCALE',
        required: true,
        lowScale: 1,
        highScale: 5,
        lowLabel: 'Below 60% Covered',
        highLabel: '100% Comprehensive Coverage',
      },
      {
        title: 'Laboratory Apparatus Availability & Hands-On Practical Experience',
        type: 'SCALE',
        required: true,
        lowScale: 1,
        highScale: 5,
        lowLabel: 'Insufficient Testing Rigs',
        highLabel: 'Excellent Practical Bay',
      },
      {
        title: 'What specific academic improvements or guest lectures would you recommend?',
        type: 'PARAGRAPH',
        required: false,
      },
    ],
  },
  {
    id: 'tmpl-lab-grievance',
    title: 'Polytechnic Laboratory Testing Rig & Apparatus Grievance Form',
    category: 'grievance',
    targetAudience: 'Faculty, HODs, & Student Lab Representatives',
    description:
      'Direct maintenance and repair reporting form for Department Laboratories, strength of materials apparatus, CNC machines, thermodynamics boilers, and computer network switches.',
    isPrivate: true,
    requiredRoleType: 'student_or_staff',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLS-bihar-lab-apparatus-maintenance/viewform?embedded=true',
    publishedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLS-bihar-lab-apparatus-maintenance/viewform',
    questions: [
      {
        title: 'Laboratory Bay Name & Machine Model',
        type: 'TEXT',
        required: true,
        description: 'e.g. Strength of Materials UTM Universal Testing Machine #02',
      },
      {
        title: 'Nature of Fault or Malfunction',
        type: 'CHOICE',
        required: true,
        options: [
          'Mechanical breakdown / Calibration error',
          'Electrical power supply / Earthing trip',
          'Software / Firmware driver corruption',
          'Consumable reagent / Oil / Tool wear',
          'Safety guard missing or broken',
        ],
      },
      {
        title: 'Urgency Level for Academic Schedule',
        type: 'CHOICE',
        required: true,
        options: [
          'Critical: Mid-Term practical viva scheduled within 7 days',
          'High: Regular weekly laboratory experiments stalled',
          'Normal: Minor calibration needed',
        ],
      },
      {
        title: 'Detailed Symptoms & Fault Description',
        type: 'PARAGRAPH',
        required: true,
      },
    ],
  },
  {
    id: 'tmpl-techfest-reg',
    title: 'Inter-College State Hackathon & TechFest 2026 Registration',
    category: 'event',
    targetAudience: 'Students across all 46 Bihar Government Polytechnics',
    description:
      'Official entry registration form for competitive robotics arena, CAD 3D modeling sprint, solar IoT rover challenge, and diploma code-fest organized under DSTTE Bihar.',
    isPrivate: false,
    requiredRoleType: 'student_or_staff',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd-bihar-polytechnic-techfest-reg/viewform?embedded=true',
    publishedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd-bihar-polytechnic-techfest-reg/viewform',
    questions: [
      {
        title: 'Team Name & Primary Project Title',
        type: 'TEXT',
        required: true,
      },
      {
        title: 'Competitive Track Category',
        type: 'CHOICE',
        required: true,
        options: [
          'AgriTech Low-Cost Mechanization & IoT',
          'Autonomous Rover & Drone Navigation',
          'Renewable Energy & Solar Inverter Innovation',
          'Web & Mobile App for Bihar Public Services',
          'Precision CAD 3D Modeling & Stress Simulation',
        ],
      },
      {
        title: 'Team Leader Full Name & SBTE Roll Number',
        type: 'TEXT',
        required: true,
      },
      {
        title: 'Team Members Count (Max 4 Engineers)',
        type: 'CHOICE',
        required: true,
        options: ['1 (Solo Maker)', '2 Members', '3 Members', '4 Members'],
      },
      {
        title: 'Executive Summary of Working Hardware/Software Prototype',
        type: 'PARAGRAPH',
        required: true,
      },
    ],
  },
  {
    id: 'tmpl-hostel-mess',
    title: 'Campus Hostel Welfare & Dining Quality Assessment Survey',
    category: 'hostel',
    targetAudience: 'Resident Hostellers & Wardens',
    description:
      'Bi-monthly food hygiene, drinking water RO filtration, Wi-Fi speed, and hostel maintenance feedback collected directly by the Warden and Principal Administration.',
    isPrivate: true,
    requiredRoleType: 'student_or_staff',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe-bihar-hostel-mess-quality/viewform?embedded=true',
    publishedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe-bihar-hostel-mess-quality/viewform',
    questions: [
      {
        title: 'Hostel Block & Room Wing',
        type: 'CHOICE',
        required: true,
        options: [
          'Hostel 1 (Senior Boys Block A)',
          'Hostel 2 (Junior Boys Block B)',
          'Hostel 3 (Girls Polytechnic Campus Block)',
          'Annexure Dormitory Wing',
        ],
      },
      {
        title: 'Mess Nutritional Quality, Cleanliness & Taste',
        type: 'SCALE',
        required: true,
        lowScale: 1,
        highScale: 5,
        lowLabel: 'Substandard / Unhygienic',
        highLabel: 'Nutritious & Wholesome',
      },
      {
        title: 'Water Purification (RO) & Electricity Back-Up Reliability',
        type: 'SCALE',
        required: true,
        lowScale: 1,
        highScale: 5,
        lowLabel: 'Frequent Disruption',
        highLabel: 'Continuous 24/7 Supply',
      },
      {
        title: 'Specific Grievances or Dining Menu Suggestions',
        type: 'PARAGRAPH',
        required: false,
      },
    ],
  },
  {
    id: 'tmpl-placement-pref',
    title: 'Final Year Placement Drive & NATS Apprenticeship Preference',
    category: 'placement',
    targetAudience: 'Semester V & VI Diploma Engineers',
    description:
      'Training and Placement Cell (T&P) survey mapping core engineering industry preferences, public sector PSU aspirations (SSC JE, RRB JE), and B.Tech lateral entry goals.',
    isPrivate: true,
    requiredRoleType: 'student_or_staff',
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf-bihar-placement-apprenticeship/viewform?embedded=true',
    publishedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf-bihar-placement-apprenticeship/viewform',
    questions: [
      {
        title: 'Post-Diploma Primary Career Objective',
        type: 'CHOICE',
        required: true,
        options: [
          'Core Industry Campus Placement (Private Sector)',
          'NATS 1-Year Paid Government Apprenticeship (BHEL, IOCL, NTPC)',
          'BCECE LEET B.Tech Lateral Entry to Engineering College',
          'Government Technical Exams (SSC JE / RRB JE / State JE)',
          'Own Startup or Workshop Business',
        ],
      },
      {
        title: 'Willingness to Relocate Outside Bihar for Job Roles',
        type: 'CHOICE',
        required: true,
        options: [
          'Yes - Anywhere across India (NCR, Pune, Bangalore, Gujarat)',
          'Within Bihar & Eastern India Region only',
          'Home District preferred only',
        ],
      },
      {
        title: 'Preferred Industrial Sectors',
        type: 'TEXT',
        required: true,
        description: 'e.g. Automotive, Metro Rail, Renewable Solar, Construction, Software',
      },
    ],
  },
];
