/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'ROLE_STUDENT' | 'ROLE_ADMIN';

export interface User {
  email: string;
  name: string;
  role: Role;
  referralCode: string; // registered email/phone
  points: number;
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  price: number;
  taskSheetName: string;
  taskSheetPdfUrl: string;
  enrolledCount: number;
  category: string;
  durationMonths: number; // 1, 2, 3, or 6 months
  prices?: Record<number, number>;
  taskSheetNames?: Record<number, string>;
  taskSheetPdfUrls?: Record<number, string>;
}

export interface Enrollment {
  id: string;
  studentEmail: string;
  studentName: string;
  internshipId: string;
  status: 'payment_pending' | 'payment_rejected' | 'active' | 'submitted' | 'completed' | 'failed' | 'redo' | 'expired';
  durationMonths?: number; // 2, 3, or 6 months selected
  
  // Payment Details
  transactionId?: string;
  paymentScreenshotUrl?: string; // Data URL or mockup URL
  paymentTimestamp?: string;
  
  // Submission Details
  submissionUrl?: string; // Github / Drive link
  submissionNote?: string;
  submissionTimestamp?: string;
  
  // Evaluation Details
  adminNotes?: string;
  completionDate?: string;
  expiryDate?: string;
  certificateId?: string;
  
  taskAttempts: number; // For Tracking task attempts
  
  // Custom student details collected during registration
  studentPhone?: string;
  qualification?: string;
  collegeName?: string;
  domainApplied?: string;
  agreedToPhases?: boolean;
  agreedToPayment?: boolean;
}

export interface Referral {
  id: string;
  referrerEmail: string;
  referredEmail: string;
  referredName: string;
  signupDate: string;
  status: 'joined' | 'enrolled'; // 'joined' on signup, 'enrolled' once payment approved
  rewardClaimed: boolean;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  studentName: string;
  internshipTitle: string;
  completionDate: string;
  durationMonths: number;
}

export interface SupportTicket {
  id: string;
  studentEmail: string;
  studentName: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  replies: {
    sender: 'student' | 'admin';
    message: string;
    timestamp: string;
  }[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  email: string;
  points: number;
  completedCount: number;
  avatarUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetInternshipId: string; // 'all' or specific internshipId
  targetDuration: string; // 'all' or '1', '2', '3', '6'
  badge: 'general' | 'update' | 'urgent' | 'meetup' | 'task';
  createdAt: string;
}

