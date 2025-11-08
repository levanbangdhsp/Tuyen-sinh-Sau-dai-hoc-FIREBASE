

export enum Page {
  Landing = 'LANDING',
  Login = 'LOGIN',
  Register = 'REGISTER',
  ForgotPassword = 'FORGOT_PASSWORD',
  Application = 'APPLICATION',
  ApplicationStatus = 'APPLICATION_STATUS',
  Home = 'HOME', // Added for completeness, maps to Landing for logged in users.
}

export interface User {
  id: string; // This will map to Firebase's `uid`
  email: string;
  fullName: string;
  phone: string;
  emailVerified: boolean;
}

export interface Program {
  id: string;
  name: string;
  faculty: string;
  description: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface DocumentFile {
  file: File | null;
  name: string;
}

export interface Applicant {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
  };
  program: Program | null;
  education: Education[];
  workExperience: WorkExperience[];
  documents: {
    statementOfPurpose: string;
    resume: DocumentFile;
    transcripts: DocumentFile;
    recommendationLetter1: DocumentFile;
  };
}

export enum ApplicationStatus {
  Submitted = 'Đã nộp',
  UnderReview = 'Đang xem xét',
  Interview = 'Lên lịch phỏng vấn',
  Accepted = 'Đã chấp nhận',
  Rejected = 'Đã từ chối',
}


export enum ApplicationStatusEnum {
  NOT_SUBMITTED = 'Chưa nộp',
  SUBMITTED = 'Đã nộp',
  NEEDS_UPDATE = 'Cần bổ sung',
  PROCESSING = 'Đang xử lý',
  VALID = 'Hợp lệ',
  INVALID = 'Không hợp lệ',
}

export interface TimelineEvent {
    stage: string;
    date: string | null;
    completed: boolean;
    current: boolean;
}

export interface ReviewDetails {
    graduationScore: number;
    hasResearchBonus: boolean;
    hasOtherAchievementsBonus: boolean;
    priorityScore: number;
    totalScore: number;
    scholarshipPolicy: string;
}

export interface AdmissionDetails {
    admittedMajor: string;
    admittedOrientation: string;
}

export interface ApplicationStatusData {
  status: ApplicationStatusEnum;
  details: string;
  timeline: TimelineEvent[];
  missingDocuments?: string[];
  reviewDetails?: ReviewDetails;
  admissionResult: 'Trúng tuyển' | 'Không trúng tuyển' | 'Chưa có';
  admissionDetails?: AdmissionDetails;
}

export interface ApplicationFormData {
  // Fix: Add index signature to allow dynamic property access with strings.
  [key: string]: string | 'research' | 'applied' | '';
  fullName: string;
  gender: string;
  dob: string;
  pob: string;
  ethnicity: string;
  nationality: string;
  idCardNumber: string;
  idCardIssueDate: string;
  idCardIssuePlace: string;
  phone: string;
  email: string;
  contactAddress: string;
  workplace: string;
  trainingFacility: string;
  firstChoiceMajor: string;
  secondChoiceMajor: string;
  thirdChoiceMajor: string;
  firstChoiceOrientation: 'research' | 'applied' | '';
  secondChoiceOrientation: 'research' | 'applied' | '';
  thirdChoiceOrientation: 'research' | 'applied' | '';
  university: string;
  graduationYear: string;
  gpa10: string;
  gpa4: string;
  graduationMajor: string;
  degreeClassification: string;
  graduationSystem: string;
  supplementaryCert: string;
  language: string;
  languageCertType: string;
  languageCertIssuer: string;
  languageScore: string;
  languageCertDate: string;
  researchAchievements: string;
  otherAchievements: string;
  priorityCategory: string;
  scholarshipPolicy: string;
  linkAnhThe: string;
  linkBangTotNghiep: string;
  linkBangDiem: string;
  linkChungChiNN: string;
  linkUuTien: string;
  linkNCKH: string;
}