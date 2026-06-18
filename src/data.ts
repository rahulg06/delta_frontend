/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Internship, LeaderboardUser, Enrollment, Referral, SupportTicket, Certificate } from './types';

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: 'int-001',
    title: 'Full-Stack React + Spring Boot Developer',
    description: 'Learn to build professional-grade enterprise systems using Spring Boot backend APIs, JPA Hibernate, and Vite + React on the frontend. Complete 4 industry-level bento-grid modules.',
    price: 1499,
    taskSheetName: 'Deltaclause_FS_Java_TaskSheet_V1.pdf',
    taskSheetPdfUrl: 'https://deltaclause.com/sheets/fs-java-task-v1.pdf',
    enrolledCount: 342,
    category: 'Software Engineering',
    durationMonths: 2
  },
  {
    id: 'int-002',
    title: 'Enterprise Java Spring Architect',
    description: 'Master advanced architectural patterns including Spring Cloud, microservices, secure JWT/OAuth Auth engines, SFTP integration, Redis caching, and MySQL schema optimizations.',
    price: 1999,
    taskSheetName: 'Deltaclause_Backend_Spring_TaskSheet_V2.pdf',
    taskSheetPdfUrl: 'https://deltaclause.com/sheets/backend-spring-v2.pdf',
    enrolledCount: 219,
    category: 'Backend Development',
    durationMonths: 3
  },
  {
    id: 'int-003',
    title: 'Frontend Craftsmanship & UX Engineer',
    description: 'For engineers who want to design the top 1% responsive portals using Tailwind CSS, Framer Motion animations, complex React hooks, local state caching, and performance tuning.',
    price: 1199,
    taskSheetName: 'Deltaclause_Frontend_UX_TaskSheet_V3.pdf',
    taskSheetPdfUrl: 'https://deltaclause.com/sheets/frontend-ux-v3.pdf',
    enrolledCount: 512,
    category: 'Frontend Engineering',
    durationMonths: 2
  },
  {
    id: 'int-004',
    title: 'Next-Gen Data Platform & Analytics',
    description: 'Design highly scaled data pipelines, process analytics logs, build interactive interactive dashboards with Recharts, and store results securely in storage services.',
    price: 1599,
    taskSheetName: 'Deltaclause_Data_Analytics_TaskSheet_V1.pdf',
    taskSheetPdfUrl: 'https://deltaclause.com/sheets/data-analytics-v1.pdf',
    enrolledCount: 168,
    category: 'Data Science',
    durationMonths: 6
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Ananya Sharma', email: 'ananya@gmail.com', points: 1450, completedCount: 3, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya' },
  { rank: 2, name: 'Rahul Varma', email: 'rahul.v@yahoo.com', points: 1200, completedCount: 2, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul' },
  { rank: 3, name: 'Siddharth Roy', email: 'siddharth@gmail.com', points: 1150, completedCount: 2, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sid' },
  { rank: 4, name: 'Priya Patel', email: 'priya.patel@gmail.com', points: 950, completedCount: 2, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya' },
  { rank: 5, name: 'Vikram Singh', email: 'vikram.s@outlook.com', points: 700, completedCount: 1, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram' }
];

export const INITIAL_PORTFOLIOS = [
  {
    studentName: 'Ananya Sharma',
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya',
    internshipTitle: 'Full-Stack React + Spring Boot Developer',
    points: 1450,
    githubUrl: 'https://github.com/ananya-sharma/deltaclause-springboot-react-ecom',
    comment: 'Built a full-stack e-commerce marketplace featuring secure JWT Auth, Spring JPA queries, Stripe gateway, and automatic invoice PDFs emailed from the server.',
    completionDate: 'June 02, 2026',
    stars: 18,
    techStack: ['Spring Boot', 'React', 'MySQL', 'Tailwind', 'JWT']
  },
  {
    studentName: 'Rahul Varma',
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    internshipTitle: 'Enterprise Java Spring Architect',
    points: 1200,
    githubUrl: 'https://github.com/rahul-varma/deltaclause-service-mesh',
    comment: 'Developed a high-throughput microservices architecture with Spring Cloud Netflix Eureka, Spring Security gateway, and Redis cache sidecar.',
    completionDate: 'May 28, 2026',
    stars: 12,
    techStack: ['Java', 'Spring Cloud', 'Redis', 'Docker', 'PostgreSQL']
  }
];

// Preloaded transactional data to make the simulation rich and live from the start
export const PRELOADED_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-901',
    studentEmail: 'vidolve@gmail.com', // Active user context
    studentName: 'Vikas Sharma',
    internshipId: 'int-001',
    status: 'active',
    transactionId: 'TXN847293847',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=400&q=80', // Beautiful generic receipt mockup
    paymentTimestamp: '2026-06-14 10:20',
    expiryDate: '2026-08-14',
    taskAttempts: 1
  },
  {
    id: 'enr-902',
    studentEmail: 'aditya.k@gmail.com',
    studentName: 'Aditya Kumar',
    internshipId: 'int-002',
    status: 'payment_pending',
    transactionId: 'TXN493028302',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&q=80', // UPI Mock receipt
    paymentTimestamp: '2026-06-15 08:15',
    taskAttempts: 0
  },
  {
    id: 'enr-903',
    studentEmail: 'neha.r@gmail.com',
    studentName: 'Neha Rao',
    internshipId: 'int-003',
    status: 'submitted',
    transactionId: 'TXN102938475',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80',
    paymentTimestamp: '2026-06-12 14:00',
    submissionUrl: 'https://github.com/neha-r/deltaclause-ux-dashboard',
    submissionNote: 'Here is my complete UX Dashboard implementation with high-contrast light/dark mode and animations. Video link in readme!',
    submissionTimestamp: '2026-06-15 11:30',
    taskAttempts: 1
  },
  {
    id: 'enr-904',
    studentEmail: 'karan.j@gmail.com',
    studentName: 'Karan Johar',
    internshipId: 'int-004',
    status: 'completed',
    transactionId: 'TXN992817263',
    paymentScreenshotUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80',
    paymentTimestamp: '2026-05-10 11:00',
    submissionUrl: 'https://github.com/karanj/deltaclause-data-pipeline',
    submissionNote: 'Built the analytics pipeline using Apache Spark and saved processed tables into DB indices. Included Recharts reporting cards.',
    submissionTimestamp: '2026-06-08 17:45',
    completionDate: '2026-06-09',
    certificateId: 'DC-2026-8801',
    taskAttempts: 1
  }
];

export const PRELOADED_CERTIFICATES: Certificate[] = [
  {
    id: 'DC-2026-8801',
    enrollmentId: 'enr-904',
    studentName: 'Karan Johar',
    internshipTitle: 'Next-Gen Data Platform & Analytics',
    completionDate: '2026-06-09',
    durationMonths: 6
  },
  {
    id: 'DC-2026-0001',
    enrollmentId: 'enr-legacy-1',
    studentName: 'Ananya Sharma',
    internshipTitle: 'Full-Stack React + Spring Boot Developer',
    completionDate: '2026-06-02',
    durationMonths: 2
  }
];

export const PRELOADED_REFERRALS: Referral[] = [
  {
    id: 'ref-001',
    referrerEmail: 'vidolve@gmail.com', // Let active user track progress
    referredEmail: 'priya.sharma@gmail.com',
    referredName: 'Priya Sharma',
    signupDate: '2026-06-13',
    status: 'enrolled',
    rewardClaimed: false
  },
  {
    id: 'ref-002',
    referrerEmail: 'vidolve@gmail.com',
    referredEmail: 'deepak.v@gmail.com',
    referredName: 'Deepak Varma',
    signupDate: '2026-06-14',
    status: 'enrolled',
    rewardClaimed: false
  },
  // Active user has 2 enrolled referrals. They need 1 more (since default limit is 3) to claim a full refund! Perfect interactive state.
  {
    id: 'ref-003',
    referrerEmail: 'vidolve@gmail.com',
    referredEmail: 'aman.gupta@gmail.com',
    referredName: 'Aman Gupta',
    signupDate: '2026-06-15',
    status: 'joined', // Register but not yet paid, once Admin approves Aman's payment, this will count as 'enrolled' and unlock the Refund!
    rewardClaimed: false
  }
];

export const PRELOADED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    studentEmail: 'vidolve@gmail.com',
    studentName: 'Vikas Sharma',
    subject: 'Spring Security Session Filter issue',
    message: 'Getting 403 Forbidden even with correct Bearer header. Should I configure CORS permissions explicitly inside WebSecurityConfigurerAdapter?',
    status: 'open',
    createdAt: '2026-06-15 10:10',
    replies: [
      {
        sender: 'student',
        message: 'Getting 403 Forbidden even with correct Bearer header. Should I configure CORS permissions explicitly inside WebSecurityConfigurerAdapter?',
        timestamp: '2026-06-15 10:10'
      }
    ]
  },
  {
    id: 'tkt-002',
    studentEmail: 'neha.r@gmail.com',
    studentName: 'Neha Rao',
    subject: 'SVG Viewport clipping on responsive cards',
    message: 'My motion-animated SVGs clip on mobile viewports. Adding overflow-visible helps, is that ideal?',
    status: 'resolved',
    createdAt: '2026-06-13 15:40',
    replies: [
      {
        sender: 'student',
        message: 'My motion-animated SVGs clip on mobile viewports. Adding overflow-visible helps, is that ideal?',
        timestamp: '2026-06-13 15:40'
      },
      {
        sender: 'admin',
        message: 'Yes Neha! Using overflow-visible on container SVG is standard practice in CSS animations. Also ensure width-full and viewBox attributes are proportional.',
        timestamp: '2026-06-14 09:20'
      }
    ]
  }
];

export const PRELOADED_ANNOUNCEMENTS = [
  {
    id: 'ann-001',
    title: '📢 Weekly Mentor Q&A Meeting - New WhatsApp & Webinar Join Link!',
    message: 'Hello everyone! Our weekly interactive cohort meetup and code reviews are scheduled for Saturday at 5:00 PM IST. Join using our Zoom link or stay tuned in the WhatsApp community forum. We will review task submissions and do live bug solving for all active domains!',
    targetInternshipId: 'all',
    targetDuration: 'all',
    badge: 'meetup',
    createdAt: '2026-06-16 11:30'
  },
  {
    id: 'ann-002',
    title: '🚀 Guidelines for Web Projects and Task Submissions',
    message: 'To all Full-Stack developers and UX Engineers: Remember to structure your project repository correctly. Keep all server APIs behind /api/ and ensure your client is built to /dist folder. Do NOT commit node_modules or application config secrets!',
    targetInternshipId: 'int-001',
    targetDuration: 'all',
    badge: 'task',
    createdAt: '2526-06-15 14:20'
  },
  {
    id: 'ann-003',
    title: '⚠️ AICTE and MSME Registry Verification Portal Status',
    message: 'We have updated our internal verification engine. Once your enrollment is reviewed and marked as active by the registrar office, you will immediately unlock your official, secure MSME-registered digital Offer Letter on your dashboard inside the Credentials module.',
    targetInternshipId: 'all',
    targetDuration: 'all',
    badge: 'urgent',
    createdAt: '2026-06-14 09:00'
  }
];

