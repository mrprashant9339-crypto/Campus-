export type UserRole =
  | 'student'
  | 'teacher'
  | 'hod'
  | 'college_admin'
  | 'platform_admin'
  | 'alumni'
  | 'parent'
  | 'librarian'
  | 'lab_assistant'
  | 'accountant'
  | 'warden'
  | 'recruiter'
  | 'guest_faculty'
  | 'guest';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'appealed';

export type GroupType =
  | 'college_general'
  | 'department'
  | 'branch'
  | 'semester'
  | 'class'
  | 'teacher'
  | 'club'
  | 'project';

export type JoinPolicy =
  | 'open'
  | 'college_verified'
  | 'branch_restricted'
  | 'semester_restricted'
  | 'teacher_approval'
  | 'invite_only';

export type PostCategory =
  | 'official'
  | 'academic'
  | 'discussion'
  | 'notes'
  | 'opportunity'
  | 'achievement'
  | 'event'
  | 'question';

export type NotificationPriority = 'emergency' | 'high' | 'normal' | 'low';

export type SubmissionStatus =
  | 'submitted'
  | 'late'
  | 'not_submitted'
  | 'reviewed'
  | 'resubmit_requested';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'academic' | 'contribution' | 'research' | 'leadership' | 'attendance';

export interface AchievementBadge {
  id: string;
  name: string; // e.g. 'Top Contributor', 'Research Lead'
  tagline: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  dateEarned: string;
  issuer: string;
  isVerified: boolean;
  credentialId: string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  code: string;
  city: string;
  state: string;
  district?: string;
  logoUrl?: string;
  domainEmails: string[];
  verified: boolean;
  verifiedAt?: string;
  plan: 'free' | 'pro' | 'enterprise';
  aisheCode?: string;
  sbteCode?: string;
  establishedYear?: number;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  principalMessage?: string;
  address?: string;
  website?: string;
  helpline?: string;
  instituteCode?: string;
  branches?: string[];
  branchCount?: number;
  verifiedFaculty?: Array<{
    name: string;
    designation: string;
    qualification?: string;
    mobile?: string;
    email?: string;
  }>;
  departments?: any[];
  featureFlags: {
    ai: boolean;
    messaging: boolean;
    events: boolean;
    qrAttendance: boolean;
    interCollegeNetwork: boolean;
  };
  settings?: {
    timezone: string;
    locale: string;
  };
  academicProfile?: CollegeAcademicProfile;
}

export interface DocumentOcrData {
  extractedName?: string;
  extractedDob?: string;
  extractedRoll?: string;
  extractedFatherName?: string;
  extractedCollege?: string;
  confidenceScore: number;
  validationStatus: 'matched' | 'mismatch' | 'flagged';
  validationMessage: string;
  processedAt: string;
}

export interface UploadedProofDoc {
  id: string;
  name: string;
  type: 'id_card' | 'admission_letter' | 'fee_receipt' | 'marksheet' | 'certificate' | 'other';
  url: string;
  fileSize?: string;
  uploadedAt: string;
  status: 'verified' | 'pending' | 'rejected' | 'under_review';
  rejectionReason?: string;
  ocrData?: DocumentOcrData;
}

export interface EnrolledSubject {
  code: string;
  name: string;
  faculty: string;
  attendancePct: number;
  conducted: number;
  attended: number;
  marks?: string;
  credits: number;
  room?: string;
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  role: string;
  teamMembers: string[];
  techStack: string[];
  link?: string;
  githubUrl?: string;
  isVerified: boolean;
}

export interface StudentCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  qrHash: string;
  category: string;
  fileUrl?: string;
  isVerified: boolean;
}

export interface ClubMembership {
  id: string;
  name: string;
  role: 'member' | 'lead' | 'secretary' | 'coordinator';
  joinedYear: string;
  category?: string;
}

export interface AcademicEndorsement {
  id: string;
  skill: string;
  endorserId: string;
  endorserName: string;
  endorserRole: 'professor' | 'peer' | 'hod' | 'admin';
  endorserTitle?: string;
  endorserAvatar?: string;
  department?: string;
  comment?: string;
  createdAt: string;
  verified: boolean;
}

export interface UserProfile {
  username?: string;
  bio?: string;
  gender?: string;
  city?: string;
  avatarUrl?: string;
  enrollmentNumber?: string;
  admissionYear?: number;
  passingYear?: number;
  batch?: string;
  branchCode?: 'ME' | 'CE' | 'CSE' | 'EE' | string;
  hostelBlock?: string;
  isHosteller?: boolean;
  verificationBadgeStatus?: 'verified' | 'pending' | 'rejected';
  resumeUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  careerInterests?: string[];
  openToCollaborate?: boolean;
  lookingFor?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
    isPrivate: boolean;
  };
  privacySettings?: {
    profile: 'public' | 'college_only' | 'class_only' | 'teachers_only' | 'private';
    phone: 'private' | 'college_only';
    email: 'private' | 'college_only';
    attendance: 'private' | 'teachers_only' | 'college_only';
    blockedUsers: string[];
    mutedGroups: string[];
  };
  notificationSettings?: {
    mode: 'all' | 'important_only' | 'mute' | 'schedule';
    assignments: boolean;
    notices: boolean;
    events: boolean;
    messages: boolean;
  };
  appSettings?: {
    language: 'english' | 'hindi' | 'hinglish';
    theme: 'light' | 'dark';
  };
  twoFactorEnabled?: boolean;
  aiSettings?: {
    copilotEnabled: boolean;
    retentionDays: number;
  };
  mentoringStats?: {
    peersHelped: number;
    rating: number;
    isSeniorMentor: boolean;
  };
  notesContribution?: {
    uploadedCount: number;
    totalDownloads: number;
    isTopContributor: boolean;
  };
  competitions?: Array<{
    id: string;
    title: string;
    teamName: string;
    rank: string;
    year: string;
  }>;
  academicStats?: {
    cgpa: number;
    attendancePct: number;
    completedAssignments: number;
    totalAssignments: number;
    onTimeSubmissions: number;
    lateSubmissions: number;
    pendingSubmissions: number;
  };
  verificationDocs?: UploadedProofDoc[];
  subjects?: EnrolledSubject[];
  projects?: StudentProject[];
  certificates?: StudentCertificate[];
  clubs?: ClubMembership[];
  academicEndorsements?: AcademicEndorsement[];
  savedNoteIds?: string[];
  savedPostIds?: string[];
  registeredEventsList?: Array<{
    eventId: string;
    title: string;
    ticketId: string;
    date: string;
    venue: string;
  }>;
  visibility: {
    profile: 'public' | 'college_only' | 'class_only' | 'teachers_only' | 'private';
    phone: 'public' | 'college_only' | 'private';
    email: 'public' | 'college_only' | 'private';
  };
}

export interface CollegeMembership {
  id: string;
  userId: string;
  collegeId: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  branchId?: string;
  branchCode?: 'ME' | 'CE' | 'CSE' | 'EE' | 'ALL' | string;
  branchName?: string;
  semesterNumber?: number;
  sectionName?: string;
  rollNumber?: string;
  registrationNumber?: string;
  employeeId?: string;
  hostelBlock?: string;
  isHosteller?: boolean;
  status: 'active' | 'alumni' | 'suspended';
  joinedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  profileCompleted?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  approverRole?: 'hod' | 'teacher' | 'admin' | 'principal';
  approverName?: string;
  approvalTargetBranch?: string;
  approvalTargetCollegeId?: string;
  uploadedDocument?: {
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  };
  institutionalVerification?: {
    isVerified: boolean;
    verifiedRoleTitle: string; // e.g. "Dr. Rajesh Verma, Principal & College Administrator"
    verifiedBy: string; // e.g. "SBTE Bihar Institutional Registrar & DSTTE"
    verificationSealCode: string; // e.g. "SBTE-BIHAR-GOV-2026-VAL-9021"
    otpVerifiedPhone?: string; // e.g. "+91 98765 33445"
    verifiedAt: string;
    clearanceLevel: string; // e.g. "Tier 1 - Executive Institutional Clearance"
    securityToken: string;
  };
  profile: UserProfile;
  membership: CollegeMembership;
  badges?: AchievementBadge[];
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  collegeId: string;
  collegeName: string;
  role: UserRole;
  status: VerificationStatus;
  submittedData: {
    department: string;
    branch: string;
    semester: number;
    section: string;
    rollNumber: string;
  };
  docType: 'id_card' | 'admission_letter' | 'fee_receipt' | 'other';
  docName: string;
  ocrConfidence: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  rejectionReason?: string;
  appealText?: string;
}

export interface Group {
  id: string;
  collegeId: string;
  type: GroupType;
  name: string;
  description: string;
  joinPolicy: JoinPolicy;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  isMember?: boolean;
  isPending?: boolean;
  scopeRef?: string;
  badge?: string;
  branchCode?: 'CE' | 'ME' | 'EE' | 'CSE' | 'ECE' | 'ALL' | string;
  branchName?: string;
  allowedRoles?: UserRole[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorBadges?: AchievementBadge[];
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  collegeId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorVerified: boolean;
  authorBadges?: AchievementBadge[];
  groupId?: string;
  groupName?: string;
  category: PostCategory;
  title: string;
  body: string;
  isPinned: boolean;
  isOfficial: boolean;
  visibility: 'college' | 'group' | 'public_network';
  attachments?: { name: string; size: string; type: string }[];
  likesCount: number;
  hasLiked?: boolean;
  comments: Comment[];
  createdAt: string;
  scopeType?: 'departmental' | 'hostel' | 'general_academic';
  branchCode?: 'ME' | 'CE' | 'CSE' | 'EE' | 'ALL' | string;
  branchName?: string;
  hostelBlock?: string;
  departmentName?: string;
  requiresAck?: boolean;
  acknowledgedByMe?: boolean;
}

export type BulletinScope = 'all' | 'departmental' | 'hostel' | 'general_academic';

export interface Note {
  id: string;
  collegeId: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: string;
  isOfficial: boolean;
  title: string;
  subjectName: string;
  subjectCode: string;
  branchCode: string;
  semester: number;
  unit?: string;
  chapter?: string;
  type: 'notes' | 'pyq' | 'lab' | 'reference';
  description?: string;
  fileSize: string;
  downloadCount: number;
  tags: string[];
  pdfPreviewUrl?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  collegeId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  isPinned: boolean;
  requiresAck: boolean;
  targetGroup: string;
  readCount: number;
  totalTarget: number;
  acknowledgedByMe?: boolean;
  createdAt: string;
  expiresAt?: string;
  scopeType?: 'departmental' | 'hostel' | 'general_academic';
  branchCode?: 'ME' | 'CE' | 'CSE' | 'EE' | 'ALL' | string;
  branchName?: string;
  hostelBlock?: string;
  departmentName?: string;
  authorDepartment?: string;
  targetRoles?: UserRole[];
}

export interface Assignment {
  id: string;
  collegeId: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  sectionName: string;
  title: string;
  description: string;
  dueAt: string;
  maxMarks: number;
  submissionType: 'file' | 'text' | 'both';
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  mySubmission?: {
    status: SubmissionStatus;
    submittedAt: string;
    marks?: number;
    feedback?: string;
    content?: string;
    fileName?: string;
  };
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  status: SubmissionStatus;
  submittedAt: string;
  marks?: number;
  feedback?: string;
  content?: string;
  fileName?: string;
}

export interface AttendanceSession {
  id: string;
  collegeId: string;
  subjectName: string;
  sectionName: string;
  teacherId: string;
  teacherName: string;
  sessionCode: string;
  qrToken: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  totalStudents: number;
  markedStudents: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    markedAt: string;
    status: AttendanceStatus;
  }[];
}

export interface Event {
  id: string;
  collegeId?: string;
  collegeName?: string;
  organizerName: string;
  scope: 'college' | 'inter_college' | 'public';
  title: string;
  description: string;
  venue: string;
  isOnline: boolean;
  startAt: string;
  endAt?: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  eligibility: string;
  status: 'draft' | 'published' | 'completed';
  tags: string[];
  bannerGradient: string;
  isRegistered?: boolean;
  qrTicketCode?: string;
  certificateUid?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'assignment_due'
    | 'new_notice'
    | 'verification'
    | 'event_reminder'
    | 'grade_posted'
    | 'group_approval'
    | 'emergency'
    | 'message'
    | 'workshop'
    | 'announcement';
  category?: 'academic' | 'event' | 'message';
  priority: NotificationPriority;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  sender?: {
    name: string;
    role: string;
    avatar?: string;
  };
  metadata?: {
    course?: string;
    dueDate?: string;
    location?: string;
    eventTime?: string;
    senderId?: string;
    tag?: string;
  };
}

export interface AuditLog {
  id: string;
  collegeId?: string;
  collegeName?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  refType: string;
  meta: Record<string, any>;
  hash: string;
  prevHash: string;
  timestamp: string;
}

export interface Opportunity {
  id: string;
  collegeId: string;
  postedByName: string;
  type: 'scholarship' | 'internship' | 'hackathon' | 'job' | 'workshop';
  title: string;
  organization: string;
  description: string;
  stipendOrPrize?: string;
  deadline: string;
  sourceVerified: boolean;
  applyUrl: string;
  tags: string[];
}

export interface ProjectShowcase {
  id: string;
  collegeId: string;
  collegeName: string;
  title: string;
  problem: string;
  solution: string;
  technologies: string[];
  teamLeader: string;
  teamSize: number;
  lookingForRoles?: string[];
  likes: number;
}

export interface CourseAttendance {
  courseCode: string;
  courseName: string;
  facultyName: string;
  credits: number;
  attended: number;
  total: number;
  percentage: number;
  mandatoryThreshold: number; // e.g. 75
  category: 'theory' | 'lab';
  lastUpdated: string;
  status: 'safe' | 'warning' | 'critical';
  missableClasses: number;
  requiredConsecutiveClasses: number;
  recentRecords?: {
    date: string;
    status: 'present' | 'absent' | 'leave';
    topic?: string;
  }[];
}

export type CalendarEventType = 'assignment' | 'exam' | 'holiday' | 'event';

export interface AcademicCalendarItem {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  time?: string;
  subjectOrOrganizer?: string;
  venueOrRoom?: string;
  description: string;
  priority?: 'normal' | 'high' | 'critical';
  color: string;
  badgeLabel: string;
  actionType?: 'assignment' | 'exam' | 'holiday' | 'event';
  referenceId?: string;
}

export type VerificationAuditCategory =
  | 'email_verified'
  | 'phone_otp_verified'
  | 'institutional_seal'
  | 'biometric_bound'
  | 'doc_ocr_verified'
  | 'account_roster_matched'
  | 'security_alert'
  | 'session_reauth';

export interface VerificationAuditEvent {
  id: string;
  userId: string;
  eventType: VerificationAuditCategory;
  title: string; // e.g. "Email Verified at 14:32:05 IST"
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "14:32:05 IST"
  formattedDate: string; // e.g. "11 Oct 2026"
  actor: string; // e.g. "Self (prashant@student.gpp.ac.in)"
  nodeId: string; // e.g. "SBTE-PATNA-AUTH-NODE-03"
  ipAddress?: string; // e.g. "192.168.1.104"
  status: 'immutable_committed' | 'verified' | 'flagged';
  details: string; // Detailed description of the verification check
  metadata: {
    targetValue?: string; // email address or masked phone number
    sealCode?: string;
    securityToken?: string;
    authMethod?: string;
    confidenceScore?: number;
    channel?: string;
    [key: string]: any;
  };
  hash: string;
  prevHash: string;
  blockNumber: number;
}

export interface DepartmentHistoryItem {
  deptCode: string;
  deptName: string;
  establishedYear: number;
  accreditation: string;
  facultyCount: number;
  studentCount: number;
  facultyStudentRatio: string; // e.g. "1:15"
  historicalMilestones: string[];
  historicalHods: Array<{ name: string; period: string }>;
}

export interface SyllabusModuleUnit {
  unitNumber: number;
  title: string;
  hours: number;
  weightagePct: number;
  topics: string[];
}

export interface SyllabusMetadataItem {
  courseCode: string;
  courseTitle: string;
  branch: string;
  semester: number;
  credits: number;
  lectureHoursPerWeek: number;
  tutorialHoursPerWeek: number;
  practicalHoursPerWeek: number;
  internalMarks: number;
  boardMarks: number;
  totalMarks: number;
  facultyStudentRatio: string;
  modules: SyllabusModuleUnit[];
  prescribedTextbooks: string[];
  prerequisites?: string[];
}

export interface SemesterGradeMetric {
  semester: number;
  batchYear: string;
  totalEnrolled: number;
  appeared: number;
  passed: number;
  passPercentage: number;
  distinctionCount: number;
  firstDivisionCount: number;
  averageCgpa: number;
  topperName: string;
  topperCgpa: number;
}

export interface LaboratoryAssignmentRecord {
  id: string;
  labCode: string;
  labName: string;
  branch: string;
  semester: number;
  assignmentNumber: number;
  experimentTitle: string;
  apparatus: string[];
  objectives: string;
  submissionDeadline: string;
  maxMarks: number;
  safetyGuidelines: string;
}

export interface CollegeAcademicProfile {
  collegeId: string;
  collegeName: string;
  instituteCode: string;
  overallFacultyStudentRatio: string;
  totalFacultyCount: number;
  totalStudentCount: number;
  aisheCode: string;
  sbteCode: string;
  departmentHistories: DepartmentHistoryItem[];
  syllabusMetadata: SyllabusMetadataItem[];
  semesterGrades: SemesterGradeMetric[];
  laboratoryAssignments: LaboratoryAssignmentRecord[];
  source: 'centralized_database' | 'synced_cache';
  lastSyncedAt: string;
}

