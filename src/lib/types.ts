
import type { LucideIcon } from "lucide-react";

export type Document = {
  id: string;
  name: string;
  type: 'Personal' | 'Education' | 'Health' | 'Official';
  uploadDate: string;
  icon: LucideIcon;
};

export type Queue = {
  id: string;
  organization: string;
  yourToken: number;
  currentToken: number;
  estimatedWaitTime: number;
  icon: LucideIcon;
};

export type SharingLog = {
  id: string;
  documentName: string;
  sharedWith: string;
  date: string;
  status: 'Shared' | 'Pending' | 'Denied';
};

export type UserProfile = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  imageUrl: string;
  about: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
};
