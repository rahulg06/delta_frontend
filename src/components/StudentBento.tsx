/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Internship, Enrollment, Referral, SupportTicket, User, Announcement } from '../types';
import { 
  FileDown, Github, ExternalLink, Calendar, Users, Award, 
  Send, MessageCircle, AlertTriangle, ShieldCheck, HelpCircle, 
  ChevronRight, Sparkles, Copy, CheckCircle2, RefreshCw, Layers, FileText, Megaphone
} from 'lucide-react';
import { downloadCertificate, downloadOfferLetter } from '../utils/documentGenerator';

interface Props {
  currentUser: User | null;
  enrollments: Enrollment[];
  internships: Internship[];
  referrals: Referral[];
  tickets: SupportTicket[];
  refundThreshold: number; // config, default 3
  announcements?: Announcement[];
  onUploadSubmission: (enrollmentId: string, url: string, note: string) => void;
  onOpenTicket: (subject: string, message: string) => void;
  onAddTicketReply: (ticketId: string, replyMessage: string) => void;
  onClaimRefund: (enrollmentId: string) => void;
  onRefreshStates?: () => void;
}

export default function StudentBento({
  currentUser,
  enrollments,
  internships,
  referrals,
  tickets,
  refundThreshold,
  announcements = [],
  onUploadSubmission,
  onOpenTicket,
  onAddTicketReply,
  onClaimRefund,
  onRefreshStates,
}: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [simulateLastFiveDays, setSimulateLastFiveDays] = useState<Record<string, boolean>>({});

  // PDF Task sheet inline previewer
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfName, setPreviewPdfName] = useState<string>('');

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [infoCenterCategory, setInfoCenterCategory] = useState<'all' | 'urgent' | 'meetup' | 'task' | 'general'>('all');

  const activeUserEmail = currentUser?.email || 'vidolve@gmail.com';

  // Get active student's enrollments
  const studentEnrollments = enrollments.filter(
    (e) => e.studentEmail === activeUserEmail
  );

  // Filter announcements targeting this student
  const relevantAnnouncements = React.useMemo(() => {
    const enrolledIds = studentEnrollments.map(e => e.internshipId);
    const enrolledDurations = studentEnrollments.map(e => String(e.durationMonths || ''));

    const matched = announcements.filter(ann => {
      const matchInternship = ann.targetInternshipId === 'all' || enrolledIds.includes(ann.targetInternshipId);
      const matchDuration = ann.targetDuration === 'all' || enrolledDurations.includes(ann.targetDuration);
      return matchInternship && matchDuration;
    });

    if (infoCenterCategory === 'all') {
      return matched;
    }
    return matched.filter(ann => ann.badge === infoCenterCategory);
  }, [announcements, studentEnrollments, infoCenterCategory]);

  // Get referrals related to active user
  const studentReferrals = referrals.filter(
    (r) => r.referrerEmail === activeUserEmail
  );

  // Number of referred users who successfully approved/enrolled
  const enrolledReferralCount = studentReferrals.filter(
    (r) => r.status === 'enrolled'
  ).length;

  const getSubmissionWindowStatus = (expiryDateStr: string, enrollmentId: string) => {
    if (!expiryDateStr) return { isAllowed: true, daysRemaining: 0, startDateStr: '' };
    
    // Check if demo bypass is toggled
    if (simulateLastFiveDays[enrollmentId]) {
      return { isAllowed: true, daysRemaining: 0, startDateStr: '' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    
    // Last 5 days window calculation (expiry minus 5 days)
    const submissionStart = new Date(expiry.getTime() - 5 * 24 * 60 * 60 * 1000);
    submissionStart.setHours(0, 0, 0, 0);
    
    const isAllowed = today >= submissionStart;
    
    const diffMs = submissionStart.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      isAllowed,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      startDateStr: submissionStart.toISOString().substring(0, 10),
    };
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleProjectSubmit = (e: React.FormEvent, enrollmentId: string) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    onUploadSubmission(enrollmentId, githubUrl, submitNote);
    setGithubUrl('');
    setSubmitNote('');
    setSubmittingId(null);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    onOpenTicket(ticketSubject, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleReplySubmit = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddTicketReply(ticketId, replyText);
    setReplyText('');
  };

  return (
    <div id="student-bento-grid-dashboard" className="space-y-8">
      
      {/* Upper overview stats bar (Standard responsive single-column stack on mobile, dual-column on tablet, quad on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 shrink-0">
            <span className="text-lg sm:text-xl">🎓</span>
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">STUDENT WORKSPACE</div>
            <div className="font-bold text-xs sm:text-sm truncate max-w-[130px] sm:max-w-none">{currentUser?.name}</div>
          </div>
        </div>
 
        {/* Enrollments Counter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 dark:text-pink-400" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">ENROLLMENTS</div>
            <div className="font-bold text-xs sm:text-sm font-mono whitespace-nowrap">
              {studentEnrollments.length} Active / Completed
            </div>
          </div>
        </div>
 
        {/* XP Points Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-650 dark:text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">REWARD POINTS</div>
            <div className="font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 font-mono whitespace-nowrap">
              {currentUser?.points || 0} XP Credits
            </div>
          </div>
        </div>
 
        {/* Referrals Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-550" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">REFERRALS ENROLLED</div>
            <div className="font-bold text-xs sm:text-sm text-amber-655 dark:text-amber-500 font-mono whitespace-nowrap">
              {enrolledReferralCount} / {refundThreshold} Joined
            </div>
          </div>
        </div>
      </div>
 
      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Bento Grid Item 1: Enrolled Courses and Deliverables tracker (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Information Center & Broadcast Board */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest block bg-indigo-105/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded w-max mb-1">
                  📢 INFORMATION CENTER
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Hub Notifications & Day-to-Day Broadcasts</span>
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Get real-time updates from mentor teams directly.
                </p>
              </div>

              {/* Status Dot */}
              <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-xl border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DEV DESK CONNECTED</span>
              </div>
            </div>

            {/* Quick Filter buttons */}
            <div className="flex flex-wrap gap-1 mb-5">
              {[
                { id: 'all', label: 'All Notices', emoji: '🌐' },
                { id: 'urgent', label: 'Urgent Alerts', emoji: '⚠️' },
                { id: 'meetup', label: 'Q&A Meetups', emoji: '👥' },
                { id: 'task', label: 'Task Help', emoji: '🚀' },
                { id: 'general', label: 'General', emoji: '📝' }
              ].map((tab) => {
                const count = tab.id === 'all' 
                  ? announcements.filter(ann => {
                      const enrolledIds = studentEnrollments.map(e => e.internshipId);
                      const enrolledDurations = studentEnrollments.map(e => String(e.durationMonths || ''));
                      return (ann.targetInternshipId === 'all' || enrolledIds.includes(ann.targetInternshipId)) && (ann.targetDuration === 'all' || enrolledDurations.includes(ann.targetDuration));
                    }).length
                  : announcements.filter(ann => {
                      const enrolledIds = studentEnrollments.map(e => e.internshipId);
                      const enrolledDurations = studentEnrollments.map(e => String(e.durationMonths || ''));
                      return ann.badge === tab.id && (ann.targetInternshipId === 'all' || enrolledIds.includes(ann.targetInternshipId)) && (ann.targetDuration === 'all' || enrolledDurations.includes(ann.targetDuration));
                    }).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setInfoCenterCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[10.5px] font-medium transition-all hover:cursor-pointer flex items-center gap-1 font-sans ${
                      infoCenterCategory === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-605/10 scale-[1.01]'
                        : 'bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[8.5px] px-1 rounded-md font-mono ${
                      infoCenterCategory === tab.id
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-200/80 dark:bg-slate-900 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List of Announcements */}
            {relevantAnnouncements.length === 0 ? (
              <div className="bg-slate-50/50 dark:bg-neutral-950/30 border border-dashed border-slate-200 dark:border-neutral-800 p-8 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center mx-auto">
                  <Megaphone className="w-5 h-5 text-indigo-550 dark:text-indigo-400" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-neutral-200">No Broadcast Notices found</h4>
                <p className="text-[10.5px] text-slate-400 max-w-sm mx-auto">
                  There are no broadcasts matching this filter. Once the administrator posts an update, it will appear here instantly!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {relevantAnnouncements.map((ann) => {
                  let badgeColorClass = 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-205 dark:border-slate-700';
                  let badgeLabel = 'General';
                  if (ann.badge === 'urgent') {
                    badgeColorClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-450 border-rose-500/10';
                    badgeLabel = 'Urgent Notice';
                  } else if (ann.badge === 'meetup') {
                    badgeColorClass = 'bg-purple-500/15 text-purple-600 dark:text-purple-450 border-purple-500/10';
                    badgeLabel = 'Live Meetup';
                  } else if (ann.badge === 'task') {
                    badgeColorClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-450 border-amber-500/10';
                    badgeLabel = 'Task Sheet Release';
                  } else if (ann.badge === 'update') {
                    badgeColorClass = 'bg-blue-500/15 text-blue-600 dark:text-blue-450 border-blue-500/10';
                    badgeLabel = 'Release Update';
                  }

                  // Find targeted program name to show as helpful note
                  const tgtProg = internships.find(i => i.id === ann.targetInternshipId);
                  const cohortLabel = ann.targetInternshipId === 'all' 
                    ? 'All Cohorts' 
                    : (tgtProg ? `${tgtProg.title}` : 'Selected Cohort');

                  const durationLabel = ann.targetDuration === 'all' 
                    ? 'All Duration Terms' 
                    : `${ann.targetDuration} Months Term Only`;

                  return (
                    <div 
                      key={ann.id}
                      className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 transition-all font-sans"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-900/60">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border uppercase font-extrabold tracking-wide ${badgeColorClass}`}>
                            {badgeLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            📅 {ann.createdAt}
                          </span>
                        </div>
                        {/* Target Information Sticker */}
                        <div className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-xl border border-indigo-500/10">
                          👥 Targets: <strong className="font-bold">{cohortLabel}</strong> ({durationLabel})
                        </div>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-1.5 leading-tight">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed whitespace-pre-wrap">
                        {ann.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>📁</span> Project Tasks & Submissions
              </h3>
            </div>
 
            {studentEnrollments.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400 font-mono space-y-2">
                <p>You have no active enrollments yet.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Browse the Internship Catalog above to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {studentEnrollments.map((enrollment) => {
                  const program = internships.find((i) => i.id === enrollment.internshipId);
                  if (!program) return null;
 
                  return (
                    <div 
                      key={enrollment.id} 
                      className="bg-slate-50/50 dark:bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
                    >
                      {/* Course Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-900 pb-3">
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">{program.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">ID: {enrollment.id}</span>
                        </div>
 
                        {/* Status badges with responsive wrap support */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                          {enrollment.status === 'payment_pending' && (
                            <span className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-250 dark:border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                              Verifying Payment Screenshot
                            </span>
                          )}
                          {enrollment.status === 'payment_rejected' && (
                            <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-250 dark:border-red-500/20 px-2 py-0.5 rounded-md font-mono">
                              Screenshot Rejected (Click Reset UPI)
                            </span>
                          )}
                          {enrollment.status === 'active' && (
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/20 px-2 py-0.5 rounded-md font-mono animate-pulse">
                              In Progress
                            </span>
                          )}
                          {enrollment.status === 'submitted' && (
                            <span className="text-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-250 dark:border-purple-500/20 px-2 py-0.5 rounded-md font-mono">
                              Evaluation Pending
                            </span>
                          )}
                          {enrollment.status === 'redo' && (
                            <span className="text-[10px] bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-250 dark:border-orange-500/20 px-2 py-0.5 rounded-md font-mono">
                              Action Required: Redo Task
                            </span>
                          )}
                          {enrollment.status === 'completed' && (
                            <span className="text-[10px] bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-250 dark:border-cyan-500/20 px-2 py-0.5 rounded-md font-mono">
                              Graduated (Passed)
                            </span>
                          )}
                          {enrollment.status === 'expired' && (
                            <span className="text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 px-2 py-0.5 rounded-md font-mono">
                              Expired (Deadline Over)
                            </span>
                          )}
                        </div>
                      </div>

                      {enrollment.studentPhone && (
                        <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-[11px] grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 text-[8.5px] uppercase font-mono block">Mobile (WhatsApp)</span>
                            <span className="font-semibold text-slate-850 dark:text-slate-200">{enrollment.studentPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 text-[8.5px] uppercase font-mono block">Qualification</span>
                            <span className="font-semibold text-slate-850 dark:text-slate-200">{enrollment.qualification}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 dark:text-slate-500 text-[8.5px] uppercase font-mono block">College / University</span>
                            <span className="font-semibold text-slate-850 dark:text-slate-205 truncate block">{enrollment.collegeName}</span>
                          </div>
                        </div>
                      )}

                      {/* Content block depending on status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        
                        {/* Task materials container column */}
                        <div className="md:col-span-1 space-y-2.5">
                          <span className="font-mono text-slate-400 dark:text-neutral-500 block uppercase tracking-wide text-[9px]">
                            1. Deliverables
                          </span>
                          
                          {['active', 'submitted', 'redo', 'completed', 'expired'].includes(enrollment.status) ? (() => {
                            const enrollmentDuration = enrollment.durationMonths || program.durationMonths || 1;
                            const taskSheetPdfUrl = (program.taskSheetPdfUrls && program.taskSheetPdfUrls[enrollmentDuration])
                              || program.taskSheetPdfUrl;
                            const taskSheetName = (program.taskSheetNames && program.taskSheetNames[enrollmentDuration])
                              || program.taskSheetName;

                            return (
                              <div className="space-y-2">
                                <a
                                  href={taskSheetPdfUrl}
                                  download={taskSheetName || 'TaskSheet.pdf'}
                                  className="flex items-center gap-2 p-2.5 bg-white dark:bg-neutral-900 border border-slate-205 dark:border-neutral-805 rounded-xl hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-200 transition-colors"
                                >
                                  <FileDown className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <div className="text-left font-mono truncate text-[11px] flex-1 font-semibold">
                                    {taskSheetName}
                                  </div>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewPdfUrl(taskSheetPdfUrl);
                                    setPreviewPdfName(taskSheetName || 'Task Sheet.pdf');
                                  }}
                                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-550/15 dark:hover:bg-indigo-550/25 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-indigo-200/40 dark:border-indigo-500/10 transition-colors cursor-pointer text-[11px] font-sans"
                                >
                                  <span>👁</span>
                                  <span>Preview Task Sheet</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => downloadOfferLetter(currentUser?.name || "Intern", program.title, program.durationMonths || 1)}
                                  className="w-full flex items-center gap-2 p-2.5 bg-white dark:bg-neutral-900 border border-slate-205 dark:border-neutral-805 rounded-xl hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-850 text-slate-705 dark:text-neutral-205 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left font-mono text-[11px]"
                                >
                                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <div className="truncate text-slate-700 dark:text-neutral-300">Deltaclause_Offer_Letter.png</div>
                                </button>
                              </div>
                            );
                          })() : (
                            <div className="p-3 bg-slate-100/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 dark:text-neutral-500 text-center">
                              🔒 Unlocked after UPI screenshot approved by admin
                            </div>
                          )}

                          {enrollment.expiryDate && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                              <span>Deadline: <span className="text-red-500 dark:text-red-400 font-bold">{enrollment.expiryDate}</span></span>
                            </div>
                          )}
                        </div>

                        {/* Submission Panel Column */}
                        <div className="md:col-span-2 space-y-2.5">
                          <span className="font-mono text-slate-400 dark:text-neutral-500 block uppercase tracking-wide text-[9px]">
                            2. Review & Submit
                          </span>

                          {/* If not yet unlocked or rejected */}
                          {['payment_pending', 'payment_rejected'].includes(enrollment.status) && (
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-neutral-850 leading-relaxed font-mono">
                              Payment status: <span className="font-bold underline text-amber-600 dark:text-amber-500">{enrollment.status === 'payment_pending' ? 'PENDING' : 'REJECTED'}</span>. Once reviewed, materials appear here.
                            </p>
                          )}

                          {/* Active / Redo Status submission trigger */}
                          {['active', 'redo'].includes(enrollment.status) && (
                            <div>
                              {(() => {
                                const winStatus = getSubmissionWindowStatus(enrollment.expiryDate || '', enrollment.id);
                                if (!winStatus.isAllowed) {
                                  return (
                                    <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3 shadow-sm animate-fade-in">
                                      <div className="flex items-start gap-2.5">
                                        <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl border border-amber-500/10 shrink-0">
                                          <AlertTriangle className="w-5 h-5 text-amber-550" />
                                        </div>
                                        <div className="space-y-1">
                                          <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide font-mono flex items-center gap-1.5">
                                            <span>Submission Window Locked</span>
                                            <span className="text-[8px] font-mono bg-amber-500/10 text-amber-650 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">
                                              Restricted
                                            </span>
                                          </h5>
                                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-sans">
                                            Task submissions unlock exclusively during the <span className="font-bold text-slate-850 dark:text-slate-100">last 5 days</span> of your internship term to encourage complete project iterations.
                                          </p>
                                        </div>
                                      </div>

                                      <div className="p-2 px-3 bg-red-500/5 dark:bg-red-500/2 border border-red-500/10 rounded-xl flex items-center justify-between text-[10.5px] font-mono">
                                        <span className="text-slate-400">Submission Unlocks:</span>
                                        <span className="font-extrabold text-red-600 dark:text-red-400 uppercase select-none">
                                          📅 {winStatus.startDateStr} (in {winStatus.daysRemaining} days)
                                        </span>
                                      </div>

                                      {/* Demo Override Bypass Trigger for simple reviews */}
                                      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-slate-200/50 dark:border-neutral-850/50 mt-1">
                                        <span className="text-slate-400 dark:text-neutral-510 font-sans italic">Previewing the application?</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSimulateLastFiveDays(prev => ({
                                              ...prev,
                                              [enrollment.id]: true
                                            }));
                                          }}
                                          className="bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer text-[10px]"
                                        >
                                          🧪 Sim Last 5 Days
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                // Else window is open
                                return (
                                  <div className="space-y-2 animate-fade-in">
                                    {simulateLastFiveDays[enrollment.id] && (
                                      <div className="bg-indigo-605/10 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl text-[10px] font-mono font-bold flex items-center justify-between border border-indigo-500/15">
                                        <span className="flex items-center gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping inline-block" />
                                          🧪 SIMULATION ACTIVE: Submission window forced open
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSimulateLastFiveDays(prev => ({
                                              ...prev,
                                              [enrollment.id]: false
                                            }));
                                          }}
                                          className="underline text-[9px] font-extrabold cursor-pointer hover:text-indigo-500"
                                        >
                                          Reset Time Lock
                                        </button>
                                      </div>
                                    )}

                                    {submittingId === enrollment.id ? (
                                      <form 
                                        onSubmit={(e) => handleProjectSubmit(e, enrollment.id)}
                                        className="space-y-2 bg-slate-100/60 dark:bg-neutral-900/50 p-3 rounded-xl border border-slate-200 dark:border-neutral-800"
                                      >
                                        <div>
                                          <label className="block text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400 mb-1">
                                            GitHub / Drive Project URL
                                          </label>
                                          <input
                                            type="url"
                                            required
                                            placeholder="https://github.com/my-profile/repo-link"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-lg p-1.5 text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-505"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400 mb-1">
                                            Submission Notes (Optional)
                                          </label>
                                          <textarea
                                            rows={2}
                                            placeholder="Include deploy link or custom implementation details..."
                                            value={submitNote}
                                            onChange={(e) => setSubmitNote(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 rounded-lg p-1.5 text-[11px] text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-505"
                                          />
                                        </div>
                                        <div className="flex gap-2 font-sans font-medium">
                                          <button
                                            type="submit"
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-550 text-white text-[11px] font-bold py-1.5 rounded-lg hover:cursor-pointer transition-all hover:scale-[1.01]"
                                          >
                                            Submit Project
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setSubmittingId(null)}
                                            className="bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 text-[11px] px-3 rounded-lg"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </form>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setSubmittingId(enrollment.id)}
                                        className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-center font-bold hover:cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                                      >
                                        <Github className="w-3.5 h-3.5" />
                                        <span>Submit Task Deliverables</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Evaluation pending review */}
                          {enrollment.status === 'submitted' && (
                            <div className="bg-slate-100 dark:bg-neutral-900/60 p-3 rounded-xl border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-slate-600 dark:text-neutral-400 space-y-2">
                              <div className="text-purple-650 dark:text-purple-400 font-bold flex items-center gap-1 font-mono">
                                <span>⌛ Submitted Project Link:</span>
                                <a 
                                  href={enrollment.submissionUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 inline-block"
                                >
                                  Open <ExternalLink className="w-2.5 h-2.5 inline" />
                                </a>
                              </div>
                              <div className="bg-white dark:bg-neutral-950 p-2 rounded text-[10px] text-slate-500 dark:text-neutral-500 border border-slate-200 dark:border-neutral-900">
                                "{enrollment.submissionNote || 'No submission notes included.'}"
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 block">
                                Submitted on: {enrollment.submissionTimestamp}
                              </span>
                            </div>
                          )}

                          {/* Completed, display certificate download button */}
                          {enrollment.status === 'completed' && (
                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-[11px] text-slate-700 dark:text-neutral-300 font-mono space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-650 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Passed & Graduated!</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-neutral-400 leading-relaxed font-sans">
                                Your project meets all Deltaclause specifications. Use your unique Certificate ID below to view and print your digitally signed completion seal.
                              </p>
                              {enrollment.certificateId && (
                                <div className="space-y-2 pt-1 font-sans">
                                  <button
                                    type="button"
                                    onClick={() => downloadCertificate(
                                      currentUser?.name || enrollment.studentName,
                                      program.title,
                                      enrollment.certificateId!,
                                      enrollment.completionDate || new Date().toISOString().split('T')[0],
                                      program.durationMonths || 1
                                    )}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-550/15 dark:hover:bg-indigo-550/25 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-indigo-200/60 dark:border-indigo-500/10 transition-colors cursor-pointer text-xs"
                                  >
                                    <Award className="w-4 h-4 shrink-0 text-indigo-500" />
                                    <span>Download Certificate (PNG)</span>
                                  </button>
                                  <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2 rounded border border-slate-200/80 dark:border-neutral-800 text-[10px] text-slate-700 dark:text-neutral-305 font-mono">
                                    <span>ID: <code className="text-cyan-600 dark:text-cyan-400 font-bold">{enrollment.certificateId}</code></span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(enrollment.certificateId!)}
                                      className="text-indigo-600 dark:text-neutral-520 hover:text-indigo-500 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                      Copy ID
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Redo Feedback display */}
                          {enrollment.status === 'redo' && enrollment.adminNotes && (
                            <div className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 text-xs text-orange-650 dark:text-orange-400 font-mono space-y-2">
                              <span className="font-bold block">⚠️ Reviewer Comment (Redo Required):</span>
                              <div className="bg-white dark:bg-neutral-950 p-2 rounded text-[10px] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-900 leading-relaxed">
                                "{enrollment.adminNotes}"
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-neutral-500">
                                Review the notes, make the necessary corrections, and click the re-submit button when ready.
                              </p>
                            </div>
                          )}

                          {/* Expired display */}
                          {enrollment.status === 'expired' && (
                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-xs text-red-650 dark:text-red-400 font-mono space-y-1.5">
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-405 font-bold">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Attempt Expired</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                                This attempt surpassed the official duration. To receive a certificate, you may request an extension by opening a support ticket or enroll in a fresh program attempt.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bento Grid Item 2 & 3: Referral Workspace & Refunds (1 col wide on desktop) */}
        <div className="space-y-6">
          {/* Referral Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            
            <span className="text-[9px] sm:text-[10px] font-mono text-amber-600 dark:text-amber-500 uppercase font-bold block mb-1">
              Referral Program
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
              Get 100% Internship Refund
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              If <span className="text-amber-600 dark:text-amber-500 font-bold">{refundThreshold}</span> users enroll using your registered email as the referral code, Deltaclause awards a full refund!
            </p>

            {/* Custom Code Banner */}
            <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/80 p-3 rounded-2xl flex items-center justify-between mt-5 gap-2">
              <div>
                <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 uppercase block leading-none">Your Referral Code</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1 block">{activeUserEmail}</span>
              </div>
              <button
                onClick={() => handleCopyCode(activeUserEmail)}
                className="bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 transition-colors hover:cursor-pointer flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Progress counter */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Referrals progress</span>
                <span className="text-amber-600 dark:text-amber-500 font-bold">
                  {enrolledReferralCount} / {refundThreshold} Enrolled
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-950 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-neutral-850">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (enrolledReferralCount / refundThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Claim Refund button if threshold met */}
            {enrolledReferralCount >= refundThreshold && (
              <div className="mt-6">
                {studentEnrollments.some(e => e.status === 'active' && e.transactionId) ? (
                  <button
                    onClick={() => {
                      const activeEnr = studentEnrollments.find(e => e.status === 'active');
                      if (activeEnr) onClaimRefund(activeEnr.id);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs text-center hover:cursor-pointer transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>CLAIM 100% TUITION REFUND</span>
                  </button>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-500 font-mono p-3 rounded-xl mt-4 leading-relaxed text-center">
                    🎉 Threshold achieved! Active enrolled memberships qualify for full refund processing.
                  </div>
                )}
              </div>
            )}

            {/* Referred Joined List */}
            <div className="mt-6 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 block">Referrals Joined</span>
              {studentReferrals.length === 0 ? (
                <div className="text-[10px] text-slate-400 dark:text-neutral-600 font-mono text-center py-4">
                  No referrals tracked yet. Share code to start.
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {studentReferrals.map((ref) => (
                    <div 
                      key={ref.id} 
                      className="bg-slate-50 dark:bg-neutral-950/60 p-2 rounded-lg text-[10px] font-mono flex items-center justify-between border border-slate-200 dark:border-neutral-850"
                    >
                      <div>
                        <div className="text-slate-800 dark:text-neutral-300 font-semibold truncate max-w-28">{ref.referredName}</div>
                        <div className="text-slate-400 dark:text-neutral-500 truncate max-w-28 text-[9px]">{ref.referredEmail}</div>
                      </div>
                      <div>
                        {ref.status === 'enrolled' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] border border-emerald-500/10">
                            Enrolled (Counts)
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-neutral-400 bg-slate-200 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-[9px]">
                            Joined (Pending Pay)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Row 3: Support Ticketing System & Chat console (POV 3) */}
      <div id="student-support-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-6 font-sans">
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 rounded-md py-0.5 uppercase tracking-wider font-semibold">
              HELP & SUPPORT TICKETS
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
              Deltaclause Helpdesk & Chat
            </h3>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-neutral-500">Live Support Board</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Active Tickets - with separator styling on mobile viewports */}
          <div className="space-y-3 lg:border-r lg:border-slate-200 dark:lg:border-slate-800/80 lg:pr-6 pb-4 lg:pb-0 border-b border-slate-100 lg:border-b-0 dark:border-slate-800/40">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase block mb-1">Your Tickets</span>
            {tickets.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-neutral-600 font-mono text-center py-10">
                You have no active support tickets.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {tickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedTicketId(tkt.id)}
                    className={`p-3 rounded-xl border font-mono text-xs cursor-pointer transition-all ${
                      selectedTicketId === tkt.id
                        ? 'bg-slate-100 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-slate-950 dark:text-white'
                        : 'bg-slate-50 dark:bg-neutral-950/60 border-slate-200 dark:border-neutral-850 hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-slate-400 dark:text-neutral-500">#{tkt.id}</span>
                      <span className={`text-[9px] px-1.5 rounded uppercase ${
                        tkt.status === 'open' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {tkt.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-neutral-200 mt-1 truncate">{tkt.subject}</div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">{tkt.createdAt}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Chat Pane */}
          <div className="lg:col-span-2">
            {selectedTicketId ? (() => {
              const activeTicket = tickets.find(t => t.id === selectedTicketId);
              if (!activeTicket) return null;

              return (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  <div className="bg-slate-50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-slate-250 dark:border-neutral-800/60">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-900 pb-2 mb-3">
                      <div>
                        <strong className="text-xs text-slate-900 dark:text-neutral-105 font-mono">{activeTicket.subject}</strong>
                        <span className="block text-[9px] font-mono text-slate-400 dark:text-neutral-500">ID: {activeTicket.id}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTicketId(null)}
                        className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
                      >
                        Back
                      </button>
                    </div>

                    {/* Replies Container */}
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {activeTicket.replies.map((reply, index) => {
                        const isAdmin = reply.sender === 'admin';
                        return (
                          <div 
                            key={index} 
                            className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                          >
                            <div className={`p-2.5 rounded-2xl max-w-sm text-xs font-mono leading-relaxed ${
                              isAdmin ? 'bg-slate-200 dark:bg-neutral-850 text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'
                            }`}>
                              <span className="text-[8px] opacity-70 block font-bold mb-0.5">
                                {isAdmin ? 'ADMIN EVALUATOR' : 'YOU (STUDENT)'}
                              </span>
                              {reply.message}
                              <span className="text-[7px] text-right mt-1 block opacity-60 leading-none">
                                {reply.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply message submission box */}
                  <form 
                    onSubmit={(e) => handleReplySubmit(e, activeTicket.id)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Add response helper to active chat..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs font-mono placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-550"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-550 hover:cursor-pointer text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              );
            })() : (
              /* Ticket Creation Form */
              <form onSubmit={handleTicketSubmit} className="space-y-3.5 font-mono text-xs">
                <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase block">Raise Support Ticket</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Subject (e.g. SFTP materials access)"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 text-slate-900 dark:text-slate-50 rounded-xl p-2.5 font-mono placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-550"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold p-2.5 rounded-xl hover:cursor-pointer transition-colors text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Create Ticket</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Describe your issue with task sheet verification..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 text-slate-900 dark:text-slate-50 rounded-xl p-2.5 font-mono placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-550"
                />
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Task Sheet PDF Inline Viewer Overlay Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-205 dark:border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate max-w-md">
                  {previewPdfName || 'Task Sheet Document'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Embed PDF Viewer */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 relative">
              <object
                data={previewPdfUrl}
                type="application/pdf"
                className="w-full h-full rounded-2xl"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 font-mono text-xs">
                  <p className="text-slate-550 dark:text-slate-400 font-semibold">PDF reader plugin is disabled or your device cannot embed PDFs natively.</p>
                  <a
                    href={previewPdfUrl}
                    download={previewPdfName || "TaskSheet.pdf"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider transition-colors max-w-xs block mx-auto text-center"
                  >
                    Download Task PDF File
                  </a>
                </div>
              </object>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold px-5 py-2 rounded-xl text-xs uppercase"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
