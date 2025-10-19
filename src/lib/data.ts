
import type { Document, Queue, SharingLog, UserProfile } from "@/lib/types";
import { FileText, HeartPulse, Briefcase, GraduationCap, Building, Landmark, Hospital } from "lucide-react";

export const initialDocuments: Document[] = [
  { id: 'doc1', name: 'National ID Card', type: 'Personal', uploadDate: '2023-10-15', icon: FileText },
  { id: 'doc2', name: 'Bachelor\'s Degree', type: 'Education', uploadDate: '2023-09-20', icon: GraduationCap },
  { id: 'doc3', name: 'Health Insurance', type: 'Health', uploadDate: '2023-11-01', icon: HeartPulse },
  { id: 'doc4', name: 'Employment Contract', type: 'Official', uploadDate: '2023-08-05', icon: Briefcase },
  { id: 'doc5', name: 'Passport', type: 'Personal', uploadDate: '2023-10-28', icon: FileText },
  { id: 'doc6', name: 'Blood Test Results', type: 'Health', uploadDate: '2023-11-05', icon: HeartPulse },
];

const DOCS_STORAGE_KEY = 'flowidq_documents';

// Helper to get documents from localStorage or initial data
export const getDocuments = (): Document[] => {
  if (typeof window === 'undefined') {
    return initialDocuments;
  }
  const storedDocs = localStorage.getItem(DOCS_STORAGE_KEY);
  return storedDocs ? JSON.parse(storedDocs).map((doc: any) => ({...doc, icon: getDocumentTypeIcon(doc.type)})) : initialDocuments;
};

// Helper to add a new document to localStorage
export const addDocument = (newDoc: Document) => {
  if (typeof window === 'undefined') return;
  const currentDocs = getDocuments();
  const updatedDocs = [...currentDocs, newDoc];
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updatedDocs));
};

export const getDocumentTypeIcon = (type: Document['type']) => {
    switch (type) {
        case 'Personal': return FileText;
        case 'Education': return GraduationCap;
        case 'Health': return HeartPulse;
        case 'Official': return Briefcase;
        default: return FileText;
    }
}


export let initialQueueData = {
  organizationName: "City Hospital",
  nowServing: { token: 88, userName: "Alice" },
  upNext: [
    { token: 89, userName: "Bob" },
    { token: 90, userName: "Charlie" },
    { token: 91, userName: "David" },
    { token: 92, userName: "Eve" },
    { token: 93, userName: "Frank" },
  ],
  waiting: [
    { token: 94, userName: "Grace" },
    { token: 95, userName: "Heidi" },
    { token: 96, userName: "Ivan" },
    { token: 97, userName: "Judy" },
    { token: 98, userName: "Mallory" },
    { token: 99, userName: "Trent" },
  ],
};

export const queues: Queue[] = [
  { id: 'q1', organization: 'City Hospital', yourToken: 105, currentToken: 88, estimatedWaitTime: 15, icon: Hospital },
  { id: 'q2', organization: 'Downtown Bank', yourToken: 42, currentToken: 30, estimatedWaitTime: 25, icon: Landmark },
  { id: 'q3', organization: 'Govt. Records Office', yourToken: 217, currentToken: 190, estimatedWaitTime: 40, icon: Building },
];

export const sharingLogs: SharingLog[] = [
    { id: 'log1', documentName: 'National ID Card', sharedWith: 'City Hospital', date: '2023-11-02', status: 'Shared' },
    { id: 'log2', documentName: 'Bachelor\'s Degree', sharedWith: 'Tech Solutions Inc.', date: '2023-10-25', status: 'Shared' },
    { id: 'log3', documentName: 'Passport', sharedWith: 'International Bank', date: '2023-10-20', status: 'Denied' },
    { id: 'log4', documentName: 'Health Insurance', sharedWith: 'Downtown Clinic', date: '2023-11-05', status: 'Pending' },
];

export const userProfile: UserProfile = {
  name: 'John Doe',
  title: 'Senior Software Engineer',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  imageUrl: 'https://picsum.photos/seed/1/300/300',
  about: 'A passionate software engineer with over 10 years of experience in developing scalable web applications. I specialize in React, Node.js, and cloud technologies. Always eager to learn and take on new challenges.',
  skills: ['React', 'TypeScript', 'Node.js', 'Firebase', 'Next.js', 'Tailwind CSS', 'Docker', 'CI/CD'],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      period: '2020 - Present',
      description: 'Led the development of a new client-facing dashboard using Next.js and TypeScript. Mentored junior developers and improved code quality through code reviews and best practices.',
    },
    {
      role: 'Software Engineer',
      company: 'Innovate Co.',
      period: '2017 - 2020',
      description: 'Developed and maintained features for a large-scale e-commerce platform using React and Redux. Contributed to the migration of legacy code to a modern microservices architecture.',
    },
  ],
  education: [
    {
      degree: 'M.S. in Computer Science',
      institution: 'Stanford University',
      period: '2015 - 2017',
    },
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      period: '2011 - 2015',
    },
  ],
};
