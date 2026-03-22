export interface ContactInfo {
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  linkedin: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
}

export interface CertificationEntry {
  name: string;
  issuingBody: string;
  year: string;
}

export interface TailoredResume {
  contact: ContactInfo;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
}

export interface AtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}
