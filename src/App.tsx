/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Role, User, Internship, Enrollment, Referral, Certificate, SupportTicket, Announcement 
} from './types';
import { 
  INITIAL_INTERNSHIPS, PRELOADED_ENROLLMENTS, PRELOADED_CERTIFICATES, 
  PRELOADED_REFERRALS, PRELOADED_TICKETS, INITIAL_LEADERBOARD, PRELOADED_ANNOUNCEMENTS 
} from './data';

import InternshipCatalog from './components/InternshipCatalog';
import StudentBento from './components/StudentBento';
import AdminPanel from './components/AdminPanel';
import VerificationDesk from './components/VerificationDesk';
import LeaderboardPortfolio from './components/LeaderboardPortfolio';
import EnrollmentModal from './components/EnrollmentModal';
import InformationCenter from './components/InformationCenter';
import { DeltaClauseLogo } from './components/DeltaClauseLogo';
import { DynamicBannerPlacement } from './components/CustomBanners';
import { DocumentHead } from './components/DocumentHead';

import { 
  signInBackend, requestSignUpOtp, verifySignUpOtp, AuthResponse,
  createInternshipOnBackend, evaluateEnrollmentOnBackend,
  requestForgotPasswordOtp, resetPasswordWithOtp, fetchCatalogFromBackend,
  applyForProgram, fetchMyEnrollments, submitMilestoneOnBackend,
  fetchTicketsOnBackend, createTicketOnBackend, replyToTicketOnBackend, resolveTicketOnBackend,
  fetchReferralsOnBackend, addReferralOnBackend, updateReferralActionOnBackend,
  fetchAnnouncementsOnBackend, createAnnouncementOnBackend, deleteAnnouncementOnBackend,
  fetchRefundThresholdOnBackend, updateRefundThresholdOnBackend
} from './utils/backendService';

import { 
  BookOpen, LayoutDashboard, SearchCheck, Users, ShieldAlert,
  Sun, Moon, Users2, Shield, Plus, GraduationCap, Laptop, Terminal, Calendar, ShieldCheck
} from 'lucide-react';

export default function App() {
  // 1. Theme state: default 'light' as it represents the Sleek user interface
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('dc_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('dc_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 2. Auth State (Mocking RBAC login switcher with standard persistent state)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dc_user_profile');
    try {
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      email: 'vidolve@gmail.com',
      name: 'Vikas Sharma',
      role: 'ROLE_STUDENT',
      referralCode: 'vidolve@gmail.com',
      points: 350
    };
  });

  // Simulated Login fields matching Screenshot 1
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUpTab, setIsSignUpTab] = useState(false);

  // Real Backend Integration states
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpReferral, setSignUpReferral] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [signUpOtp, setSignUpOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot Password flow states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('');

  // 3. Coordination stores
  const [internships, setInternships] = useState<Internship[]>(() => {
    const saved = localStorage.getItem('dc_internships');
    return saved ? JSON.parse(saved) : INITIAL_INTERNSHIPS;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('dc_enrollments');
    return saved ? JSON.parse(saved) : PRELOADED_ENROLLMENTS;
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('dc_referrals');
    return saved ? JSON.parse(saved) : PRELOADED_REFERRALS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('dc_certificates');
    return saved ? JSON.parse(saved) : PRELOADED_CERTIFICATES;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('dc_tickets');
    return saved ? JSON.parse(saved) : PRELOADED_TICKETS;
  });

  const [refundThreshold, setRefundThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('dc_refund_threshold');
    return saved ? parseInt(saved) : 3;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('dc_announcements');
    return saved ? JSON.parse(saved) : PRELOADED_ANNOUNCEMENTS;
  });

  // 4. Interface state
  const [activeTab, setActiveTab] = useState<'catalog' | 'student_dashboard' | 'admin_dashboard' | 'verifier' | 'community' | 'info'>('catalog');
  const [enrollingInternship, setEnrollingInternship] = useState<Internship | null>(null);

  // Admin Catalog Creation states
  const [showAddInternshipModal, setShowAddInternshipModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  
  // New/Edit Internship fields
  const [catTitle, setCatTitle] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catCategory, setCatCategory] = useState('Software Engineering');
  const [catPrice, setCatPrice] = useState(1499);
  const [catDuration, setCatDuration] = useState(2);
  const [catPdfName, setCatPdfName] = useState('');
  const [catPdfUrl, setCatPdfUrl] = useState('');

  // Duration-specific config states
  const [catPrices, setCatPrices] = useState<Record<number, number>>({
    1: 209,
    2: 1199,
    3: 1499,
    6: 1999
  });
  const [catPdfNames, setCatPdfNames] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    6: ''
  });
  const [catPdfUrls, setCatPdfUrls] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    6: ''
  });
  const [activeConfigDuration, setActiveConfigDuration] = useState<number>(1);

  const handlePdfUploadForDuration = (file: File, dur: number) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported for task sheets.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      alert('PDF is too large (max limit 6MB). Please select a compressed PDF.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCatPdfNames(prev => ({ ...prev, [dur]: file.name }));
        setCatPdfUrls(prev => ({ ...prev, [dur]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported for task sheets.');
      return;
    }
    
    // Check file size, maximum 6MB to fit fine within localStorage/DB limits
    if (file.size > 6 * 1024 * 1024) {
      alert('PDF is too large (max limit 6MB). Please select a compressed PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCatPdfName(file.name);
        setCatPdfUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Dynamically compute the leaderboard using state variables so it is fully live!
  const computedLeaderboard = React.useMemo(() => {
    // Start with a clone of pre-loaded or static users from INITIAL_LEADERBOARD
    const list = [...INITIAL_LEADERBOARD];

    if (currentUser && currentUser.role === 'ROLE_STUDENT') {
      const completedCount = enrollments.filter(
        (e) => e.studentEmail.toLowerCase() === currentUser.email.toLowerCase() && e.status === 'completed'
      ).length;

      const existingIndex = list.findIndex(
        (u) => u.email.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (existingIndex > -1) {
        list[existingIndex] = {
          ...list[existingIndex],
          name: currentUser.name,
          points: currentUser.points,
          completedCount: completedCount,
        };
      } else {
        list.push({
          rank: 0,
          name: currentUser.name,
          email: currentUser.email,
          points: currentUser.points,
          completedCount: completedCount,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`,
        });
      }
    }

    // Sort descending by points, and then by completed count
    list.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.completedCount - a.completedCount;
    });

    // Re-assign ranks based on sorted placement
    return list.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [currentUser, enrollments]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dc_internships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('dc_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('dc_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('dc_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('dc_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('dc_refund_threshold', refundThreshold.toString());
  }, [refundThreshold]);

  useEffect(() => {
    localStorage.setItem('dc_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Sync state points
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dc_user_profile', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dc_user_profile');
    }
  }, [currentUser]);

  // Load dynamic catalog from Spring Boot endpoint on startup if online
  useEffect(() => {
    let active = true;
    const loadDynamicCatalog = async () => {
      try {
        const remoteItems = await fetchCatalogFromBackend();
        if (remoteItems && remoteItems.length > 0 && active) {
          console.log('%c[Full-Stack Catalog] Syncing dynamic internships catalog from Redis & Spring Boot database.', 'color: #10b981; font-weight: bold;');
          setInternships(remoteItems);
        }
      } catch (e) {
        console.warn('Backend database is currently offline or running in sandbox simulation.', e);
      }
    };
    loadDynamicCatalog();
    return () => {
      active = false;
    };
  }, []);

  // Load dynamic student data and server settings from backend when logged in or initialized
  useEffect(() => {
    let active = true;

    const syncSystemSettings = async () => {
      try {
        const threshold = await fetchRefundThresholdOnBackend();
        if (threshold !== null && active) {
          setRefundThreshold(threshold);
        }
        const remoteAnnouncements = await fetchAnnouncementsOnBackend();
        if (remoteAnnouncements && remoteAnnouncements.length > 0 && active) {
          setAnnouncements(remoteAnnouncements);
        }
      } catch (err) {
        console.warn('System settings fetch offline:', err);
      }
    };
    syncSystemSettings();

    const syncUserData = async () => {
      if (!currentUser) return;
      try {
        // Fetch enrollments
        const remoteEnrollments = await fetchMyEnrollments();
        if (remoteEnrollments && remoteEnrollments.length > 0 && active) {
          console.log('%c[Full-Stack Enrollments] Syncing user achievements from Spring Boot database...', 'color: #3b82f6; font-weight: bold;');
          setEnrollments((prev) => {
            const merged = [...prev];
            remoteEnrollments.forEach((re: any) => {
              if (!merged.some(m => m.id === re.id)) {
                merged.unshift(re);
              } else {
                const idx = merged.findIndex(m => m.id === re.id);
                merged[idx] = { ...merged[idx], ...re };
              }
            });
            return merged;
          });
        }

        // Fetch tickets
        const remoteTickets = await fetchTicketsOnBackend();
        if (remoteTickets && remoteTickets.length > 0 && active) {
          setTickets((prev) => {
            const merged = [...prev];
            remoteTickets.forEach((rt: any) => {
              if (!merged.some(m => m.id === rt.id)) {
                merged.unshift(rt);
              } else {
                const idx = merged.findIndex(m => m.id === rt.id);
                merged[idx] = { ...merged[idx], ...rt };
              }
            });
            return merged;
          });
        }

        // Fetch referrals
        const remoteReferrals = await fetchReferralsOnBackend();
        if (remoteReferrals && remoteReferrals.length > 0 && active) {
          setReferrals((prev) => {
            const merged = [...prev];
            remoteReferrals.forEach((rr: any) => {
              if (!merged.some(m => m.id === rr.id)) {
                merged.unshift(rr);
              } else {
                const idx = merged.findIndex(m => m.id === rr.id);
                merged[idx] = { ...merged[idx], ...rr };
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn('Backend user data sync offline:', err);
      }
    };
    syncUserData();

    return () => { active = false; };
  }, [currentUser]);

  // Synchronize URL Hash with activeTab for deep-linking & LinkedIn recruit shares
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['catalog', 'student_dashboard', 'admin_dashboard', 'verifier', 'community', 'info'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash as any);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    } else {
      window.history.replaceState(null, '', '#catalog');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash !== activeTab) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  // Handle Role/Profile Toggles
  const handleToggleRole = (role: Role) => {
    if (role === 'ROLE_ADMIN') {
      setCurrentUser({
        email: 'rahulguptaendless@gmail.com',
        name: 'Rahul Gupta',
        role: 'ROLE_ADMIN',
        referralCode: 'rahul123',
        points: 0
      });
      setActiveTab('admin_dashboard');
    } else {
      setCurrentUser({
        email: 'vidolve@gmail.com',
        name: 'Vikas Sharma',
        role: 'ROLE_STUDENT',
        referralCode: 'vidolve@gmail.com',
        points: 350
      });
      setActiveTab('catalog');
    }
  };

  // Perform Live Spring Boot Auth Logins
  const handleSignInSubmit = async (email: string, pass: string) => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail) {
      setAuthError('Please enter a valid email.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');

    // Check local overridden passwords first
    const savedOverrides = localStorage.getItem('dc_overridden_passwords');
    const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};

    try {
      let res: AuthResponse;

      if (overrides[formattedEmail] && overrides[formattedEmail] === pass) {
        // Successful login via local password override
        const isAdmin = formattedEmail === 'rahulguptaendless@gmail.com';
        res = {
          token: 'mock-override-jwt-token',
          email: formattedEmail,
          name: isAdmin ? 'Rahul Gupta' : (formattedEmail === 'vidolve@gmail.com' ? 'Vikas Sharma' : formattedEmail.split('@')[0]),
          role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_STUDENT',
          points: isAdmin ? 0 : 350,
          referralCode: formattedEmail
        };
      } else {
        try {
          res = await signInBackend(formattedEmail, pass);
        } catch (backendErr: any) {
          // Robust client offline fallback for corporate simulations
          const isOffline = backendErr.message && backendErr.message.includes('Boot security server');
          if (isOffline) {
            const isVikas = formattedEmail === 'vidolve@gmail.com' && pass === 'vikas123';
            const isAdmin = formattedEmail === 'rahulguptaendless@gmail.com' && pass === 'rahul123';
            
            if (isVikas || isAdmin) {
              res = {
                token: 'mock-offline-jwt-token',
                email: formattedEmail,
                name: isAdmin ? 'Rahul Gupta' : 'Vikas Sharma',
                role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_STUDENT',
                points: isAdmin ? 0 : 350,
                referralCode: formattedEmail
              };
            } else {
              throw backendErr;
            }
          } else {
            throw backendErr;
          }
        }
      }

      localStorage.setItem('dc_bearer_token', res.token);
      
      setCurrentUser({
        email: res.email,
        name: res.name,
        role: res.role as Role,
        referralCode: res.referralCode,
        points: res.points
      });
      
      if (res.role === 'ROLE_ADMIN') {
        setActiveTab('admin_dashboard');
      } else {
        setActiveTab('catalog');
      }
      setShowSignInModal(false);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Verification rejected.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Password Recovery / Forgotten password flow dispatch code
  const handleRequestPasswordResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = forgotEmail.trim().toLowerCase();
    if (!formattedEmail) {
      setAuthError('Please enter a registered email address.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // Real Spring Boot + Redis + Java Mail integration
      await requestForgotPasswordOtp(formattedEmail);
      setForgotGeneratedOtp('BACKEND_VERIFIED'); // backend manages and validates OTP code in Redis
      setForgotOtpSent(true);
      setAuthLoading(false);
      
      setForgotSuccessMessage(`Verification recovery OTP code has been successfully dispatched to ${formattedEmail} via Spring Boot SMTP mail service!`);
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      console.log(`[SMTP - ${timestamp}] Dispatched reset mail code to ${formattedEmail} via backend service.`);
    } catch (backendErr: any) {
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168.'));
      const isOffline = backendErr.message && backendErr.message.includes('Boot security server');
      
      if (isOffline && isLocalhost) {
        setTimeout(() => {
          const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setForgotGeneratedOtp(randomOtp);
          setForgotOtpSent(true);
          setAuthLoading(false);
          
          setForgotSuccessMessage(`Verification OTP dispatched (Sandbox Simulation)! Please check your developer console (Press F12 / inspect) to retrieve your 6-digit reset code.`);
          
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          console.log(`%c[SMTP - ${timestamp}] Sandbox Password Reset OTP for ${formattedEmail}: ${randomOtp}`, 'background: #312e81; color: #818cf8; padding: 4px; font-weight: bold; border-radius: 4px');
        }, 600);
      } else {
        setAuthLoading(false);
        // Display clear developer connection error or user-friendly message
        if (isOffline) {
          setAuthError('The secure authentication gateway is temporarily offline or unreachable. Please try again shortly or contact system administration.');
        } else {
          setAuthError(backendErr.message || 'An unexpected error occurred during password reset.');
        }
      }
    }
  };

  // Perform secure forgotten password override in local credential store
  const handleVerifyPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = forgotEmail.trim().toLowerCase();

    if (!forgotOtp || forgotOtp.trim().length === 0) {
      setAuthError('Please enter the 6-digit OTP reset code.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setAuthError('New password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError('Select matching passwords.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    // If sandbox simulated OTP matching
    if (forgotGeneratedOtp !== 'BACKEND_VERIFIED') {
      if (forgotOtp.trim() !== forgotGeneratedOtp) {
        setAuthLoading(false);
        setAuthError('Incorrect OTP reset code entered. Please check and try again.');
        return;
      }

      // Save password override securely in localStorage sandbox simulation
      setTimeout(() => {
        const savedOverrides = localStorage.getItem('dc_overridden_passwords');
        const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
        overrides[formattedEmail] = forgotNewPassword;
        localStorage.setItem('dc_overridden_passwords', JSON.stringify(overrides));

        setAuthLoading(false);
        alert('Password reset successful (Sandbox Simulation)! You can now log in using your new credentials.');
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotOtpSent(false);
        setForgotGeneratedOtp('');
        setForgotSuccessMessage('');
        setIsForgotPassword(false);
      }, 600);
      return;
    }

    try {
      // Connect to real Spring Boot backend password update
      await resetPasswordWithOtp(formattedEmail, forgotOtp.trim(), forgotNewPassword);

      // Keep localStorage in sync as local copy override
      const savedOverrides = localStorage.getItem('dc_overridden_passwords');
      const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
      overrides[formattedEmail] = forgotNewPassword;
      localStorage.setItem('dc_overridden_passwords', JSON.stringify(overrides));

      setAuthLoading(false);
      alert('Password reset successful and updated on Spring Boot secure database! You can now log in using your new credentials.');
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotOtpSent(false);
      setForgotGeneratedOtp('');
      setForgotSuccessMessage('');
      setIsForgotPassword(false);
    } catch (backendErr: any) {
      setAuthLoading(false);
      setAuthError(backendErr.message || 'OTP verification failed or has expired.');
    }
  };

  // Phase 1: Request OTP code via Spring Boot SMTP and Redis integration
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = signUpEmail.trim().toLowerCase();
    const formattedName = signUpName.trim();
    if (!formattedEmail || !formattedName) {
      setAuthError('Please enter a valid email and full name.');
      return;
    }

    if (!signUpPassword) {
      setAuthError('Please select a security password.');
      return;
    }

    if (signUpPassword.length < 6) {
      setAuthError('Security password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Both security passwords must match.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await requestSignUpOtp(formattedEmail, formattedName, signUpReferral);
      setOtpSent(true);
      setAuthError('');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Failed to request OTP code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Phase 2: Verify custom security code and finalize account creation via dynamic JPA Hibernate registers
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = signUpEmail.trim().toLowerCase();
    const formattedName = signUpName.trim();
    const code = signUpOtp.trim();
    if (!formattedEmail || !formattedName || !code) {
      setAuthError('Missing verification fields or OTP code.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await verifySignUpOtp(formattedEmail, code, formattedName, signUpReferral, signUpPassword);
      localStorage.setItem('dc_bearer_token', res.token);
      
      setCurrentUser({
        email: res.email,
        name: res.name,
        role: res.role as Role,
        referralCode: res.referralCode,
        points: res.points
      });
      
      setActiveTab('catalog');
      setShowSignInModal(false);
      setOtpSent(false);
      setSignUpEmail('');
      setSignUpName('');
      setSignUpReferral('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      setSignUpOtp('');
      alert('Congratulations! Your official verification is complete and your Deltaclause account has been registered!');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'OTP verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('catalog');
  };


  // Student Actions: Enroll click
  const handleEnrollClick = (program: Internship) => {
    if (!currentUser) {
      setAuthError('Authentication required: Please sign in or register a new account to enroll in our practical internship programs.');
      setShowSignInModal(true);
      return;
    }
    setEnrollingInternship(program);
  };

  const handleSubmitEnrollment = (
    internshipId: string,
    transactionId: string,
    screenshotDataUrl: string,
    refCodeApplied: string,
    durationMonths?: number,
    customDetails?: {
      studentName?: string;
      studentEmail?: string;
      studentPhone?: string;
      qualification?: string;
      collegeName?: string;
      domainApplied?: string;
      agreedToPhases?: boolean;
      agreedToPayment?: boolean;
    }
  ) => {
    const months = durationMonths || 2;
    const expiryDateObj = new Date();
    expiryDateObj.setMonth(expiryDateObj.getMonth() + months);
    const calculatedExpiry = expiryDateObj.toISOString().substring(0, 10);

    const newEnrollment: Enrollment = {
      id: `enr-${Math.floor(100000 + Math.random() * 900000)}`,
      studentEmail: customDetails?.studentEmail || currentUser?.email || '',
      studentName: customDetails?.studentName || currentUser?.name || '',
      internshipId,
      status: 'payment_pending',
      durationMonths: months,
      transactionId,
      paymentScreenshotUrl: screenshotDataUrl,
      paymentTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      taskAttempts: 1,
      expiryDate: calculatedExpiry,
      studentPhone: customDetails?.studentPhone,
      qualification: customDetails?.qualification,
      collegeName: customDetails?.collegeName,
      domainApplied: customDetails?.domainApplied,
      agreedToPhases: customDetails?.agreedToPhases,
      agreedToPayment: customDetails?.agreedToPayment,
    };

    setEnrollments([newEnrollment, ...enrollments]);

    // Persist on database backend
    applyForProgram(newEnrollment).then((backendResult) => {
      if (backendResult && backendResult.id) {
        console.log('Enrollment successfully persisted on backend DB:', backendResult);
        // Safely update with the actual server-generated enrollment ID
        setEnrollments((prev) => 
          prev.map((e) => e.id === newEnrollment.id ? { ...e, ...backendResult } : e)
        );
      }
    }).catch(err => {
      console.warn('Backend enrollment persistent task failure:', err);
    });

    // Handle referral enrollment tracking
    if (refCodeApplied && refCodeApplied.trim()) {
      // Find matching referrer, adding referee info
      const newReferral: Referral = {
        id: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
        referrerEmail: refCodeApplied.trim(),
        referredEmail: currentUser?.email || '',
        referredName: currentUser?.name || '',
        signupDate: new Date().toISOString().substring(0, 10),
        status: 'joined', // starts as joined, moves to 'enrolled' once payment approved!
        rewardClaimed: false
      };
      setReferrals([newReferral, ...referrals]);

      addReferralOnBackend(refCodeApplied.trim(), currentUser?.email || '', currentUser?.name || '').then((backendResult) => {
        if (backendResult && backendResult.id) {
          console.log('Referral successfully saved on backend DB:', backendResult);
          setReferrals(prev => prev.map(r => r.id === newReferral.id ? backendResult : r));
        }
      }).catch(err => {
        console.warn('Backend referral task registry offline:', err);
      });
    }

    // Switch view to student dashboard to wait for approval
    setActiveTab('student_dashboard');
  };

  // Student Actions: Submit Github Link / Drive URL
  const handleUploadSubmission = (enrollmentId: string, url: string, note: string) => {
    const updated = enrollments.map((e) => {
      if (e.id === enrollmentId) {
        return {
          ...e,
          status: 'submitted' as const,
          submissionUrl: url,
          submissionNote: note,
          submissionTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      }
      return e;
    });
    setEnrollments(updated);

    submitMilestoneOnBackend(enrollmentId, url, note).then((backendResult) => {
      if (backendResult) {
        console.log('Milestone submission successfully updated on backend:', backendResult);
      }
    }).catch(err => {
      console.warn('Backend milestone submission warning:', err);
    });
  };

  // Student Actions: Support tickets
  const handleOpenTicket = (subject: string, message: string) => {
    const newTicket: SupportTicket = {
      id: `tkt-${Math.floor(100 + Math.random() * 900)}`,
      studentEmail: currentUser?.email || '',
      studentName: currentUser?.name || '',
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      replies: [
        {
          sender: 'student',
          message,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
      ]
    };
    setTickets([newTicket, ...tickets]);

    createTicketOnBackend(subject, message).then((backendResult) => {
      if (backendResult && backendResult.id) {
        console.log('Ticket successfully created on database backend:', backendResult);
        setTickets(prev => prev.map(t => t.id === newTicket.id ? backendResult : t));
      }
    }).catch(err => {
      console.warn('Backend ticket creation offline:', err);
    });
  };

  const handleStudentTicketReply = (ticketId: string, replyMsg: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          replies: [
            ...t.replies,
            {
              sender: 'student' as const,
              message: replyMsg,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          ]
        };
      }
      return t;
    });
    setTickets(updated);

    replyToTicketOnBackend(ticketId, replyMsg, 'student').then((backendResult) => {
      if (backendResult) {
        console.log('Ticket reply successfully persisted on database backend:', backendResult);
      }
    }).catch(err => {
      console.warn('Backend ticket reply offline:', err);
    });
  };

  // Admin Actions: Approve student's payment, unlocks deliverables and update referral status
  const handleApprovePayment = (enrollmentId: string) => {
    const targetEnrollment = enrollments.find(e => e.id === enrollmentId);
    if (!targetEnrollment) return;

    // 1. Mark enrollment as active (now has task sheet materials)
    const updatedEnrollments = enrollments.map((e) => {
      if (e.id === enrollmentId) {
        return {
          ...e,
          status: 'active' as const,
          expiryDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        };
      }
      return e;
    });

    // 2. If this student had registered a referral code when enrolling, update that tracking referral status to 'enrolled' which counts towards full refund!
    const updatedReferrals = referrals.map((r) => {
      if (r.referredEmail === targetEnrollment.studentEmail) {
        return { ...r, status: 'enrolled' as const };
      }
      return r;
    });

    setEnrollments(updatedEnrollments);
    setReferrals(updatedReferrals);

    // Sync referral reward state update on backend
    referrals.forEach((r) => {
      if (r.referredEmail.toLowerCase() === targetEnrollment.studentEmail.toLowerCase()) {
        updateReferralActionOnBackend(r.id, 'enrolled').then((backendResult) => {
          if (backendResult) {
            console.log('Referral state synced on backend database:', backendResult);
          }
        }).catch(err => {
          console.warn('Backend referral status sync offline:', err);
        });
      }
    });

    // Call Spring Boot evaluate API in parallel to dispatch the dynamic Offer Letter email
    evaluateEnrollmentOnBackend(enrollmentId, 'active');
  };

  // Admin Actions: Reject payment screenshot
  const handleRejectPayment = (enrollmentId: string, notes: string) => {
    const updated = enrollments.map((e) => {
      if (e.id === enrollmentId) {
        return {
          ...e,
          status: 'payment_rejected' as const,
          adminNotes: notes,
        };
      }
      return e;
    });
    setEnrollments(updated);

    // Sync rejection with Spring Boot backend
    evaluateEnrollmentOnBackend(enrollmentId, 'payment_rejected', notes);
  };

  // Admin Actions: Grade Github Repo
  const handleGradeSubmission = (
    enrollmentId: string,
    status: 'completed' | 'failed' | 'redo',
    notes: string
  ) => {
    if (status === 'completed') {
      // Create new certificate record
      const enr = enrollments.find(e => e.id === enrollmentId);
      const program = internships.find(i => i.id === enr?.internshipId);

      const uniqueCertId = `DC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCert: Certificate = {
        id: uniqueCertId,
        enrollmentId,
        studentName: enr?.studentName || 'Unregistered Candidate',
        internshipTitle: program?.title || 'Unknown Internship Program',
        completionDate: new Date().toISOString().substring(0, 10),
        durationMonths: program?.durationMonths || 2,
      };

      setCertificates([newCert, ...certificates]);

      // Give student 500 bonus coins for passing
      if (enr?.studentEmail === currentUser.email) {
        setCurrentUser(prev => ({ ...prev, points: prev.points + 500 }));
      }

      const updatedEnrollments = enrollments.map((e) => {
        if (e.id === enrollmentId) {
          return {
            ...e,
            status: 'completed' as const,
            adminNotes: 'Excellent task submissions, verified perfectly!',
            completionDate: new Date().toISOString().substring(0, 10),
            certificateId: uniqueCertId,
          };
        }
        return e;
      });
      setEnrollments(updatedEnrollments);

      // Call Spring Boot evaluate API in parallel to dispatch dynamic Certification emails
      evaluateEnrollmentOnBackend(enrollmentId, 'completed', 'Excellent task submissions, verified perfectly!', uniqueCertId);

    } else {
      // Failed or Redo required
      const updatedEnrollments = enrollments.map((e) => {
        if (e.id === enrollmentId) {
          return {
            ...e,
            status: status as any,
            adminNotes: notes,
          };
        }
        return e;
      });
      setEnrollments(updatedEnrollments);

      // Call Spring Boot evaluate API
      evaluateEnrollmentOnBackend(enrollmentId, status, notes);
    }
  };

  const handleUpdateRefundThreshold = (val: number) => {
    setRefundThreshold(val);
    updateRefundThresholdOnBackend(val).catch(err => {
      console.warn('Backend update refund threshold offline:', err);
    });
  };

  const handleUpdateAnnouncements = async (updated: Announcement[]) => {
    // Determine if we added or removed an announcement
    if (updated.length > announcements.length) {
      // Find what was added
      const added = updated.filter(u => !announcements.some(a => String(a.id) === String(u.id)));
      if (added.length > 0) {
        setAnnouncements(updated);
        try {
          await createAnnouncementOnBackend(added[0]);
          console.log('Announcement successfully synchronized on backend database.');
        } catch (err) {
          console.warn('Backend create announcement offline:', err);
        }
      }
    } else if (updated.length < announcements.length) {
      // Find what was deleted
      const deleted = announcements.filter(a => !updated.some(u => String(u.id) === String(a.id)));
      if (deleted.length > 0) {
        setAnnouncements(updated);
        try {
          await deleteAnnouncementOnBackend(deleted[0].id);
          console.log('Announcement successfully retracted from backend database.');
        } catch (err) {
          console.warn('Backend delete announcement offline:', err);
        }
      }
    } else {
      setAnnouncements(updated);
    }
  };

  // Admin Actions: Reply to tickets
  const handleResolveTicket = (ticketId: string, replyMessage: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolved' as const,
          replies: [
            ...t.replies,
            {
              sender: 'admin' as const,
              message: replyMessage,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          ]
        };
      }
      return t;
    });
    setTickets(updated);

    resolveTicketOnBackend(ticketId, replyMessage).then((backendResult) => {
      if (backendResult) {
        console.log('Ticket resolved successfully on backend database:', backendResult);
      }
    }).catch(err => {
      console.warn('Backend ticket resolution offline:', err);
    });
  };

  // Student Actions: Claim full refund once referral N is met
  const handleClaimRefund = (enrollmentId: string) => {
    const updated = enrollments.map((e) => {
      if (e.id === enrollmentId) {
        return {
          ...e,
          adminNotes: '✓ 100% Tuition refund approved and credited back to UPI source of vikas!',
        };
      }
      return e;
    });
    setEnrollments(updated);
    alert('Tuition refund request registered! ₹1499 will be transferred back to your original payment UPI handle.');
  };

  // Admin: CRUD Internship catalog Addition/Edits
  const handleSaveInternship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle.trim() || !catDesc.trim()) return;

    if (editingInternship) {
      // Edit
      const updated = internships.map((i) => {
        if (i.id === editingInternship.id) {
          return {
            ...i,
            title: catTitle,
            description: catDesc,
            category: catCategory,
            // Fallback base values of the general object
            price: catPrices[2] || 1199,
            durationMonths: 2,
            taskSheetName: catPdfNames[2] || i.taskSheetName,
            taskSheetPdfUrl: catPdfUrls[2] || i.taskSheetPdfUrl,
            // Custom multi-duration config schemas (1M, 2M, 3M, 6M)
            prices: { ...catPrices },
            taskSheetNames: { ...catPdfNames },
            taskSheetPdfUrls: { ...catPdfUrls }
          };
        }
        return i;
      });
      setInternships(updated);
      setEditingInternship(null);
    } else {
      // Create
      const newInternship: Internship = {
        id: `int-${Math.floor(100 + Math.random() * 900)}`,
        title: catTitle,
        description: catDesc,
        category: catCategory,
        // Fallback base values representing standard 2 Months
        price: catPrices[2] || 1199,
        durationMonths: 2,
        taskSheetName: catPdfNames[2] || `Deltaclause_${catTitle.replace(/\s+/g, '_')}_2M_TaskSheet.pdf`,
        taskSheetPdfUrl: catPdfUrls[2] || 'https://deltaclause.com/sheets/custom-v1.pdf',
        enrolledCount: 0,
        // Custom multi-duration config schemas (1M, 2M, 3M, 6M)
        prices: { ...catPrices },
        taskSheetNames: { ...catPdfNames },
        taskSheetPdfUrls: { ...catPdfUrls }
      };
      setInternships([...internships, newInternship]);
      
      // Sync creation with Spring Boot backend in parallel
      createInternshipOnBackend(newInternship);
    }

    // Reset Form
    setCatTitle('');
    setCatDesc('');
    setCatCategory('Software Engineering');
    setCatPrices({
      1: 209,
      2: 1199,
      3: 1499,
      6: 1999
    });
    setCatPdfNames({ 1: '', 2: '', 3: '', 6: '' });
    setCatPdfUrls({ 1: '', 2: '', 3: '', 6: '' });
    setActiveConfigDuration(1);
    setShowAddInternshipModal(false);
  };

  const handleEditInternshipTrigger = (program: Internship) => {
    setEditingInternship(program);
    setCatTitle(program.title);
    setCatDesc(program.description);
    setCatCategory(program.category);

    const initPrices = program.prices || {
      1: program.durationMonths === 1 ? program.price : 209,
      2: program.durationMonths === 2 ? program.price : 1199,
      3: program.durationMonths === 3 ? program.price : 1499,
      6: program.durationMonths === 6 ? program.price : 1999
    };
    
    const initPdfNames = program.taskSheetNames || {
      1: program.durationMonths === 1 ? program.taskSheetName : '',
      2: program.durationMonths === 2 ? program.taskSheetName : '',
      3: program.durationMonths === 3 ? program.taskSheetName : '',
      6: program.durationMonths === 6 ? program.taskSheetName : ''
    };

    const initPdfUrls = program.taskSheetPdfUrls || {
      1: program.durationMonths === 1 ? program.taskSheetPdfUrl : '',
      2: program.durationMonths === 2 ? program.taskSheetPdfUrl : '',
      3: program.durationMonths === 3 ? program.taskSheetPdfUrl : '',
      6: program.durationMonths === 6 ? program.taskSheetPdfUrl : ''
    };

    setCatPrices(initPrices);
    setCatPdfNames(initPdfNames);
    setCatPdfUrls(initPdfUrls);
    setActiveConfigDuration(1);
    setShowAddInternshipModal(true);
  };

  const handleDeleteInternship = (id: string) => {
    if (confirm('Are you sure you want to delete this internship program from the primary registry?')) {
      setInternships(internships.filter((i) => i.id !== id));
    }
  };

  // Toggle Theme Class on document
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Compute page SEO metadata dynamically for search placement & LinkedIn sharing
  const getMetaDetails = () => {
    const defaultImg = '/favicon.svg';
    switch (activeTab) {
      case 'catalog':
        return {
          title: 'Virtual US Technical Internships & Verifiable Credentials | DeltaClause',
          description: 'Ready to break into the US job market? Secure elite global virtual internships. DeltaClause provides verifiable academic experience, structured task sheets, and certified mentoring for remote candidates.',
          ogImage: defaultImg
        };
      case 'student_dashboard':
        return {
          title: `${currentUser ? currentUser.name + "'s" : "Student"} Internship Office & Worksheets | DeltaClause`,
          description: 'Official DeltaClause Student Workstation. Check active 1-6 Month terms, download verified offer letters, review academic task sheets, and submit peer-reviewed deliverables.',
          ogImage: defaultImg
        };
      case 'admin_dashboard':
        return {
          title: 'Operations Command & Enrollment Ledger | DeltaClause Admin',
          description: 'Operations database command. Register new technical programs, adjust custom pricing matrices, publish live student feeds, and verify certifications.',
          ogImage: defaultImg
        };
      case 'verifier':
        return {
          title: 'Verifiable Academic Credential Ledger & Audit | DeltaClause Verifier',
          description: 'Public verifiable credential verification workspace. Audit transaction context files, live screenshot submissions, and authentic student status registrations.',
          ogImage: defaultImg
        };
      case 'community':
        return {
          title: 'Developer Peer Forums & Real-Time Performance Board | DeltaClause Network',
          description: 'Connect with talented student engineers from leading state universities. Review live daily streaks, submission timelines, and global mentor announcements.',
          ogImage: defaultImg
        };
      case 'info':
        return {
          title: 'US Academic Placement Standards & Program FAQ | DeltaClause Guide',
          description: 'Comprehensive compliance roadmap for United States student recruitment. Discover guidelines for remote project delivery, credential verification, and interview prep.',
          ogImage: defaultImg
        };
      default:
        return {
          title: 'DeltaClause - Premium Verifiable Credentials Platform',
          description: 'Virtual academic internships pairing rigorous structured curriulums with automated verification software.',
          ogImage: defaultImg
        };
    }
  };

  const metaDetails = getMetaDetails();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0b0f19] text-slate-200' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Dynamic SEO Head with LinkedIn micro-formatting and USA georouting */}
      <DocumentHead {...metaDetails} />
      
      {/* Modern, clean persistent navbar */}
      <header className={`border-b sticky top-0 z-45 backdrop-blur-lg transition-all ${
        theme === 'dark' ? 'border-slate-900 bg-[#0b0f19]/90' : 'border-slate-200/80 bg-[#f8fafc]/92'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo brand */}
          <button
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 bg-transparent border-0 p-0 text-left cursor-pointer outline-none group"
          >
            <DeltaClauseLogo size="sm" showText={true} />
          </button>

          {/* Navigation Tab Menu */}
          <nav className="hidden md:flex items-center gap-1.5 select-none">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                activeTab === 'catalog' 
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Trainings
              {activeTab === 'catalog' && (
                <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                activeTab === 'verifier' 
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Verify Certificate
              {activeTab === 'verifier' && (
                <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>

            {currentUser?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                  activeTab === 'admin_dashboard' 
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Admin Dashboard
                {activeTab === 'admin_dashboard' && (
                  <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            )}

            {currentUser?.role === 'ROLE_STUDENT' && (
              <button
                onClick={() => setActiveTab('student_dashboard')}
                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                  activeTab === 'student_dashboard' 
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                My Progress
                {activeTab === 'student_dashboard' && (
                  <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('community')}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                activeTab === 'community' 
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Leaderboard
              {activeTab === 'community' && (
                <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:cursor-pointer ${
                activeTab === 'info' 
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Info Center
              {activeTab === 'info' && (
                <span className="absolute bottom-[-14px] left-4 right-4 h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          </nav>

          {/* Action Tools & User badge */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Visual Point Counter (Aesthetic & gamified) */}
            {currentUser && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 text-[10px] sm:text-xs font-mono font-bold text-amber-700 dark:text-amber-400 select-none py-1 sm:py-1.5 rounded-full">
                🪙 <span>{currentUser.points} Pts</span>
              </div>
            )}

            {/* Dark & Light preference toggler */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl transition-all border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 hover:cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              title="Change theme mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 h-4 text-violet-600" />}
            </button>

            {/* Simulated Auth dropdown info */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-2.5 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:flex flex-col select-none leading-none gap-0.5">
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-100">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[8px] font-bold text-indigo-505 dark:text-indigo-400 uppercase tracking-widest">{currentUser.role === 'ROLE_ADMIN' ? 'ADMIN' : 'STUDENT'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <span className="sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError('');
                  setShowSignInModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4.5 rounded-xl text-[11px] sm:text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Sign In
              </button>
            )}

          </div>
        </div>

        {/* Small screen navigation grid helper */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-3 text-[11.5px] font-bold uppercase select-none shadow-lg">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'catalog' 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Trainings
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'verifier' 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Verify
          </button>
          
          {currentUser?.role === 'ROLE_STUDENT' && (
            <button
              onClick={() => setActiveTab('student_dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'student_dashboard' 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              My Progress
            </button>
          )}

          {currentUser?.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin_dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin_dashboard' 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              Admin
            </button>
          )}

          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'community' 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Scores
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'info' 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            FAQ
          </button>
        </div>
      </header>

      {/* Primary Page Canvas CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Workspace Active Views */}
        <div className="space-y-12">
          
          {/* CATALOG VIEW */}
          {activeTab === 'catalog' && (
            <div className="space-y-12 animate-fade-in">
              
              {/* Massive Gorgeous Landing Hero Banner matching Screenshot 5 */}
              <div className="relative py-12 px-4 text-center space-y-6 max-w-4xl mx-auto overflow-hidden select-none">
                {/* Ambient background blur circles */}
                <div className="absolute top-12 left-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-400 tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Verified Skill Credentials Platform</span>
                </div>

                <h1 className="text-4.5xl sm:text-5.5xl md:text-6.5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] max-w-3xl mx-auto font-sans">
                  Deploy Your Career Code with <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Deltaclause</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2.5xl mx-auto leading-relaxed">
                  Master production-ready web platforms and pipelines on your own timeline. Complete modular industry task sheets, receive custom team grading, and unlock verifiable digital credentials.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                  <button
                    onClick={() => {
                      const catalogSection = document.getElementById('internship-catalog-workspace');
                      if (catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-600/15 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Browse Field Programs &rarr;
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('verifier');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-300 font-bold py-3 px-8 rounded-2xl transition-all border border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Verify Credential ID
                  </button>
                </div>
              </div>

              {/* Top Customizable Banner Placement */}
              <div className="max-w-6xl mx-auto pt-2 select-none">
                <DynamicBannerPlacement placement="catalog_top" currentUser={currentUser} />
              </div>

              {/* Scrolling Target anchor */}
              <div id="internship-catalog-workspace" className="pt-4">
                <InternshipCatalog
                  internships={internships}
                  enrollments={enrollments}
                  currentUser={currentUser?.role === 'ROLE_STUDENT' ? currentUser : null}
                  onEnrollClick={handleEnrollClick}
                  isAdminMode={currentUser?.role === 'ROLE_ADMIN'}
                  onAddInternship={() => {
                    setEditingInternship(null);
                    setCatTitle('');
                    setCatDesc('');
                    setCatCategory('Software Engineering');
                    setCatPrice(1499);
                    setCatDuration(8);
                    setShowAddInternshipModal(true);
                  }}
                  onEditInternship={handleEditInternshipTrigger}
                  onDeleteInternship={handleDeleteInternship}
                />
              </div>

              {/* Bottom Customizable Banner Placement */}
              <div className="max-w-6xl mx-auto pt-4 select-none">
                <DynamicBannerPlacement placement="catalog_bottom" currentUser={currentUser} />
              </div>

            </div>
          )}

           {/* STUDENT DASHBOARD BENTO VIEW */}
          {activeTab === 'student_dashboard' && currentUser?.role === 'ROLE_STUDENT' && (
            <div className="animate-fade-in space-y-8">
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5">
                <h2 className="text-2.5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🧑‍🎓</span> Vikas' Dashboard Workspace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Welcome back, Vikas. Manage your task sheet submissions, support tickets, and check your refund progress.</p>
              </div>

              {/* Top Customizable Banner Placement on Dashboard */}
              <div className="max-w-6xl select-none">
                <DynamicBannerPlacement placement="student_dashboard_top" currentUser={currentUser} />
              </div>

              <StudentBento
                currentUser={currentUser}
                enrollments={enrollments}
                internships={internships}
                referrals={referrals}
                tickets={tickets}
                refundThreshold={refundThreshold}
                announcements={announcements}
                onUploadSubmission={handleUploadSubmission}
                onOpenTicket={handleOpenTicket}
                onAddTicketReply={handleStudentTicketReply}
                onClaimRefund={handleClaimRefund}
              />

              {/* Bottom Customizable Banner Placement on Dashboard */}
              <div className="max-w-6xl pt-4 select-none">
                <DynamicBannerPlacement placement="student_dashboard_bottom" currentUser={currentUser} />
              </div>
            </div>
          )}

          {/* ADMIN MANAGEMENT PANEL VIEW */}
          {activeTab === 'admin_dashboard' && currentUser?.role === 'ROLE_ADMIN' && (
            <div className="animate-fade-in space-y-8">
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5">
                <h2 className="text-2.5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>👑</span> Administrative Command Center
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Verify payments, evaluate codebases, manage support tickets, and adjust referral systems settings.
                </p>
              </div>
              <AdminPanel
                enrollments={enrollments}
                internships={internships}
                referrals={referrals}
                tickets={tickets}
                certificates={certificates}
                refundThreshold={refundThreshold}
                setRefundThreshold={handleUpdateRefundThreshold}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                onGradeSubmission={handleGradeSubmission}
                onResolveTicket={handleResolveTicket}
                onUpdateInternshipCatalog={setInternships}
                announcements={announcements}
                onUpdateAnnouncements={handleUpdateAnnouncements}
              />
            </div>
          )}

          {/* VERIFIER DESK VIEW */}
          {activeTab === 'verifier' && (
            <div className="animate-fade-in space-y-6">
              {/* Customizable Banner Placement above verifier */}
              <div className="max-w-6xl pt-2 select-none">
                <DynamicBannerPlacement placement="verifier_top" currentUser={currentUser} />
              </div>

              <VerificationDesk certificates={certificates} />
            </div>
          )}

          {/* COMMUNITY LEADERS VIEW */}
          {activeTab === 'community' && (
            <div className="animate-fade-in">
              <LeaderboardPortfolio leaderboard={computedLeaderboard} />
            </div>
          )}

          {/* INFORMATION CENTER FAQ VIEW */}
          {activeTab === 'info' && (
            <div className="animate-fade-in">
              <InformationCenter 
                currentUser={currentUser}
                onOpenSupportTicket={() => {
                  if (!currentUser) {
                    setShowSignInModal(true);
                  } else if (currentUser.role === 'ROLE_ADMIN') {
                    setActiveTab('admin_dashboard');
                  } else {
                    setActiveTab('student_dashboard');
                    setTimeout(() => {
                      const el = document.getElementById('student-support-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 150);
                  }
                }}
              />
            </div>
          )}

        </div>
      </main>

      {/* Elegant, clean responsive page footer */}
      <footer className={`border-t py-12 mt-20 text-xs font-mono text-center transition-colors ${
        theme === 'dark' ? 'border-none bg-slate-950/70 text-slate-500' : 'border-slate-200 text-slate-500 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="max-w-md mx-auto leading-relaxed">
            Deltaclause ® 2026. Designed for corporate training portals, student projects, and HR certificate lookups. High-contrast layout with responsive dashboards.
          </p>
        </div>
      </footer>

      {/* MODAL 1: Payment Checkout & Screenshot Submission */}
      <EnrollmentModal
        internship={enrollingInternship}
        currentUser={currentUser}
        isOpen={enrollingInternship !== null}
        onClose={() => setEnrollingInternship(null)}
        onSubmitEnrollment={handleSubmitEnrollment}
      />

      {/* MODAL 2: Create / Edit Internship listing in Catalog */}
      {showAddInternshipModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4.5 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                {editingInternship ? 'Edit Catalog Entry' : 'Create Custom Internship Sheet'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddInternshipModal(false); setEditingInternship(null); }}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInternship} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internship Title</label>
                <input
                  type="text"
                  required
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="e.g. Node + Flutter Mobile Suite Engineer"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                <textarea
                  required
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Describe program modules, sftp attachments, etc..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Category Tag</label>
                <select
                  value={catCategory}
                  onChange={(e) => setCatCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white font-semibold cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Frontend Engineering">Frontend Engineering</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              {/* Dynamic Duration-Specific Setup Area for [1M, 2M, 3M, 6M] */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[10px] uppercase font-bold text-indigo-650 dark:text-indigo-400 tracking-wider block">
                  Configure Individual Duration Prices &amp; Task Sheets
                </span>
                
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  {[1, 2, 3, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setActiveConfigDuration(num)}
                      className={`py-1.5 px-1 font-mono text-[10px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                        activeConfigDuration === num
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-450 shadow-sm font-black'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      {num === 1 ? '1 Month' : `${num} Months`}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-1 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      Price for {activeConfigDuration === 1 ? '1 Month (4 Weeks)' : `${activeConfigDuration} Months`} (INR)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={catPrices[activeConfigDuration] || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setCatPrices(prev => ({ ...prev, [activeConfigDuration]: val }));
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      Task Sheet PDF Config for {activeConfigDuration === 1 ? '1 Month' : `${activeConfigDuration} Months`}
                    </label>
                    
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50/10');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/10');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/10');
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handlePdfUploadForDuration(e.dataTransfer.files[0], activeConfigDuration);
                        }
                      }}
                      onClick={() => document.getElementById(`dur-pdf-${activeConfigDuration}`)?.click()}
                      className="border border-dashed border-slate-300 dark:border-slate-800 p-3 rounded-xl text-center cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900-50 bg-white/50 dark:bg-slate-900/30"
                    >
                      <input
                        id={`dur-pdf-${activeConfigDuration}`}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePdfUploadForDuration(e.target.files[0], activeConfigDuration);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center space-y-0.5 text-[10px]">
                        <span>📄</span>
                        {catPdfNames[activeConfigDuration] ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-600 dark:text-emerald-450 font-bold block truncate max-w-[280px]">
                              ✓ {catPdfNames[activeConfigDuration]}
                            </span>
                            <span className="text-[8.5px] text-slate-450 block font-sans">Click/Drag to replace PDF</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-slate-450 block font-sans font-medium">Use Default Task Sheet</span>
                            <span className="text-[8.5px] text-slate-400 block font-sans">Drag PDF or Click to upload custom {activeConfigDuration}M deliverables</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">
                        Or enter direct Task Sheet PDF URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/custom-tasks.pdf"
                        value={catPdfUrls[activeConfigDuration] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCatPdfUrls(prev => ({ ...prev, [activeConfigDuration]: val }));
                          if (val && !catPdfNames[activeConfigDuration]) {
                            setCatPdfNames(prev => ({ ...prev, [activeConfigDuration]: `External_TaskSheet_${activeConfigDuration}M.pdf` }));
                          }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-1.5 px-2 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddInternshipModal(false); setEditingInternship(null); setCatPdfName(''); setCatPdfUrl(''); }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-6 rounded-2xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Sign-in Modal matching Screenshot 1 */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-800 dark:text-slate-100 p-6 sm:p-8">
            
            {/* Modal Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsSignUpTab(false)}
                  className={`text-base font-bold pb-2 relative transition-all ${
                    !isSignUpTab ? 'text-indigo-600 font-extrabold font-display' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                  {!isSignUpTab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUpTab(true)}
                  className={`text-base font-bold pb-2 relative transition-all ${
                    isSignUpTab ? 'text-indigo-600 font-extrabold font-display' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Generate Account
                  {isSignUpTab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Real Auth login / OTP registration forms */}
            {isForgotPassword ? (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setAuthError('');
                    }}
                    className="hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>

                {!forgotOtpSent ? (
                  <form onSubmit={handleRequestPasswordResetOtp} className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Enter your registered email address bellow. We will dispatch a 6-digit verification code to reset your account password.
                    </p>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your-email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                      />
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1 font-mono leading-normal">
                        <p className="font-bold">⚠️ Action Failed</p>
                        <p className="text-[11px] opacity-90">{authError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-indigo-600/15 text-xs uppercase tracking-wider cursor-pointer font-sans"
                    >
                      {authLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPasswordReset} className="space-y-4">
                    {forgotSuccessMessage && (
                      <div className="text-xs text-emerald-605 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-1 font-mono leading-normal">
                        <p className="font-bold">✓ OTP Sent</p>
                        <p className="text-[11px] opacity-90">{forgotSuccessMessage}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-1000 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-550/20 font-mono text-center tracking-widest font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        New Security Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                      />
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1 font-mono leading-normal">
                        <p className="font-bold">⚠️ Verification Failed</p>
                        <p className="text-[11px] opacity-90">{authError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-indigo-600/15 text-xs uppercase tracking-wider cursor-pointer font-sans"
                    >
                      {authLoading ? 'Updating credentials...' : 'Reset Password'}
                    </button>
                  </form>
                )}
              </div>
            ) : !isSignUpTab ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignInSubmit(signInEmail, signInPassword);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                    Verify Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthError('');
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                  />
                </div>

                {authError && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1 font-mono leading-normal">
                    <p className="font-bold">⚠️ Connection / Auth Failed</p>
                    <p className="text-[11px] opacity-90">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-indigo-600/15 text-xs uppercase tracking-wider cursor-pointer font-sans"
                >
                  {authLoading ? 'Verifying Credentials...' : 'Verify Access Clearance'}
                </button>
              </form>
            ) : (
              /* High-Fidelity OTP SignUp Form matching Spring Boot design */
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikas Sharma"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="vikas@school.edu"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Referral / Invitation Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter email or unique handle"
                        value={signUpReferral}
                        onChange={(e) => setSignUpReferral(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 font-medium"
                      />
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1 font-mono leading-normal">
                        <p className="font-bold">⚠️ Connection / Request Failed</p>
                        <p className="text-[11px] opacity-90">{authError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-indigo-600/15 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {authLoading ? 'Dispatching Verification...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/50 p-4 rounded-2xl text-xs space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-400">Passcode Outbound Complete!</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        A 6-digit confirmation code was routed to <span className="font-bold text-slate-800 dark:text-white">{signUpEmail}</span>.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={signUpOtp}
                        onChange={(e) => setSignUpOtp(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-2xl px-4 py-3 text-center text-sm font-bold tracking-widest text-slate-900 dark:text-slate-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1 font-mono leading-normal">
                        <p className="font-bold">⚠️ OTP Validation Failed</p>
                        <p className="text-[11px] opacity-90">{authError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setAuthError('');
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-2xl text-xs uppercase cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-emerald-600/15 text-xs uppercase tracking-wider cursor-pointer"
                      >
                        {authLoading ? 'Verifying...' : 'Verify & Register'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
  