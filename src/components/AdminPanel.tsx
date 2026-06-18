import React, { useState } from 'react';
import { Internship, Enrollment, SupportTicket, Announcement } from '../types';
import { 
  Users, Check, X, ShieldAlert, Award, FileSpreadsheet, Search, CheckSquare, 
  Square, RefreshCw, MessageSquare, ExternalLink, Settings, ShieldCheck, Mail,
  Globe, CreditCard, LayoutDashboard, DollarSign, Calendar, ChevronLeft, ChevronRight,
  Sliders, Database, BookOpen, Clock, Paperclip, Trash2, Upload, FileText, Megaphone
} from 'lucide-react';
import { AdminBannerManagementHub } from './CustomBanners';

interface Props {
  enrollments: Enrollment[];
  internships: Internship[];
  tickets: SupportTicket[];
  refundThreshold: number;
  setRefundThreshold: (val: number) => void;
  onApprovePayment: (enrollmentId: string) => void;
  onRejectPayment: (enrollmentId: string, reason: string) => void;
  onGradeSubmission: (enrollmentId: string, status: 'completed' | 'redo' | 'failed', remarks: string) => void;
  onResolveTicket: (ticketId: string, replyMessage: string) => void;
  referrals?: any;
  certificates?: any;
  onUpdateInternshipCatalog?: any;
  announcements?: Announcement[];
  onUpdateAnnouncements?: (ann: Announcement[]) => void;
}

type AdminMenuTab = 'overview' | 'students' | 'payments' | 'submissions' | 'support' | 'settings' | 'emails' | 'announcements';

export default function AdminPanel({
  enrollments,
  internships,
  tickets,
  refundThreshold,
  setRefundThreshold,
  onApprovePayment,
  onRejectPayment,
  onGradeSubmission,
  onResolveTicket,
  announcements = [],
  onUpdateAnnouncements,
}: Props) {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const senderTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (senderTimerRef.current) {
        clearTimeout(senderTimerRef.current);
      }
    };
  }, []);
  
  // Grid/page states
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);
  
  const itemsPerPage = 5;

  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending_review' | 'graded'>('all');

  // Selection states for bulk actions
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Grading states
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradingStatus, setGradingStatus] = useState<'completed' | 'redo' | 'failed'>('completed');
  const [gradingNotes, setGradingNotes] = useState('');

  // Tickets active resolution reply state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Email Campaign Creator & Sender Simulator States
  const [campaignInternshipId, setCampaignInternshipId] = useState<string>('all');
  const [campaignDurationMonths, setCampaignDurationMonths] = useState<string>('all');
  const [campaignTemplateId, setCampaignTemplateId] = useState<string>('welcome');
  const [campaignSubject, setCampaignSubject] = useState<string>('');
  const [campaignBody, setCampaignBody] = useState<string>('');
  const [isSendingCampaign, setIsSendingCampaign] = useState<boolean>(false);
  const [campaignSendingProgress, setCampaignSendingProgress] = useState<number>(0);
  const [campaignSendLogs, setCampaignSendLogs] = useState<string[]>([]);
  const [campaignSentSuccess, setCampaignSentSuccess] = useState<boolean>(false);

  // Email Campaign Attachment States
  const [campaignAttachmentType, setCampaignAttachmentType] = useState<string>('none'); // 'none' | 'task_sheet' | 'offer_letter' | 'custom'
  const [campaignAttachmentName, setCampaignAttachmentName] = useState<string>('');
  const [campaignAttachmentSize, setCampaignAttachmentSize] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const EMAIL_TEMPLATES_PRESETS = {
    welcome: {
      subject: "[Deltaclause] Welcome aboard! Setup your codebase sandbox: {title}",
      body: `Hello {name},

Congratulations on enrolling in the {duration}-Month {title} program at DeltaClause!

We have verified your payment transaction {txn}. Here are your critical cohort milestones:
- Program Duration: {duration} Months ({weeks} Weeks)
- Deliverable Deadline: {deadline}
- Official Task Sheet: {sheet_name}

Task Deliverable Rules: Note that you can only submit your completed GitHub workspace link during the final 5 days of your internship term (starting from {submission_start}).

Join the cohort Discord & WhatsApp channel here: https://chat.whatsapp.com/GzCisT7B3Ww92uX5deltacl

Happy coding!,
DeltaClause Registrar Team`
    },
    midterm: {
      subject: "[Deltaclause Hub] Mid-term Milestone Evaluation: {title}",
      body: `Dear {name},

We are now halfway through your {duration}-Month practical internship program for {title}.

Please make sure you are actively reviewing the task sheet ({sheet_name}) and implementing bento-grid components.
Your deadline is {deadline}. The submission interface will open exactly 5 days before your deadline on {submission_start}.

If you have any doubts, resolve them on our WhatsApp channel or submit a support coupon in the developer console.

Best regards,
DeltaClause Support Desk`
    },
    final_alert: {
      subject: "[URGENT] Final Tasks Submission Window is OPEN - Deadline: {deadline}",
      body: `Hello {name},

This is an official final reminder that the submission window is now OPEN for your {duration}-Month internship in {title}.

As per our administrative policy, you are permitted to submit your project URL only within the final 5 days of your term. That window has officially arrived!

Submission Specifications:
- Program Deadline Date: {deadline}
- Target GitHub/Drive Deliverable: URL Link Setup
- Grading Notes: Please include any custom feature enhancements.

Ensure your deliverables are uploaded to the dashboard prior to {deadline} 23:59 UTC.

Sincerely,
DeltaClause Evaluation Board`
    }
  };

  React.useEffect(() => {
    const preset = EMAIL_TEMPLATES_PRESETS[campaignTemplateId as keyof typeof EMAIL_TEMPLATES_PRESETS];
    if (preset) {
      setCampaignSubject(preset.subject);
      setCampaignBody(preset.body);
      
      // Auto suggest appropriate default attachments for presets
      if (campaignTemplateId === 'welcome') {
        setCampaignAttachmentType('offer_letter');
      } else if (campaignTemplateId === 'midterm' || campaignTemplateId === 'final_alert') {
        setCampaignAttachmentType('task_sheet');
      } else {
        setCampaignAttachmentType('none');
      }
    }
  }, [campaignTemplateId]);

  React.useEffect(() => {
    if (campaignAttachmentType === 'task_sheet') {
      setCampaignAttachmentName('deltaclause_internship_tasks_sheet.pdf');
      setCampaignAttachmentSize('1.42 MB');
    } else if (campaignAttachmentType === 'offer_letter') {
      setCampaignAttachmentName('deltaclause_official_offer_letter.pdf');
      setCampaignAttachmentSize('785 KB');
    } else if (campaignAttachmentType === 'none') {
      setCampaignAttachmentName('');
      setCampaignAttachmentSize('');
    }
  }, [campaignAttachmentType]);

  // Announcement creator states
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annBadge, setAnnBadge] = useState<'general' | 'update' | 'urgent' | 'meetup' | 'task'>('general');
  const [annTargetInternshipId, setAnnTargetInternshipId] = useState('all');
  const [annTargetDuration, setAnnTargetDuration] = useState('all');
  const [annSearchFilter, setAnnSearchFilter] = useState('');
  const [annSuccessMessage, setAnnSuccessMessage] = useState('');

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      alert('Please fill out both the title and message body.');
      return;
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      message: annMessage.trim(),
      targetInternshipId: annTargetInternshipId,
      targetDuration: annTargetDuration,
      badge: annBadge,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    if (onUpdateAnnouncements) {
      onUpdateAnnouncements([newAnn, ...announcements]);
    }

    // Reset fields
    setAnnTitle('');
    setAnnMessage('');
    setAnnSuccessMessage('📣 Broadcast announcement successfully published to the selected cohort audience!');
    setTimeout(() => setAnnSuccessMessage(''), 4000);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to retract/delete this announcement? It will immediately disappear from the students dashboard.')) {
      if (onUpdateAnnouncements) {
        onUpdateAnnouncements(announcements.filter(ann => ann.id !== id));
      }
    }
  };

  // Helper: Verify if payment is dynamic international (PayPal)
  // We can look at transaction ID structure (PayPal transactions start with 'F-' or don't include 'TXN')
  const checkIsUSD = (e: Enrollment): boolean => {
    if (!e.transactionId) return false;
    const tid = e.transactionId.toUpperCase();
    return tid.startsWith('F-') || tid.includes('_PP') || /^[A-Z]-[0-9A-Z]+$/.test(tid) || tid.length === 12 && !tid.startsWith('TXN');
  };

  // Helper: Get local/usd price paid
  const getEnrollmentPrice = (e: Enrollment): { amount: number; isUSD: boolean } => {
    const program = internships.find((p) => p.id === e.internshipId);
    if (!program) return { amount: 0, isUSD: false };
    
    const isUSD = checkIsUSD(e);
    if (isUSD) {
      const usdPrice = Math.round(
        program.price === 1499 ? 39 : 
        program.price === 1999 ? 49 : 
        program.price === 1199 ? 29 : 
        program.price === 1599 ? 39 : 
        Math.ceil(program.price / 40)
      );
      // If code was applied, give dynamic $10 discount
      const hasDiscount = e.adminNotes?.toLowerCase().includes('discount') || false; 
      return { amount: hasDiscount ? Math.max(0, usdPrice - 10) : usdPrice, isUSD: true };
    } else {
      const hasDiscount = e.adminNotes?.toLowerCase().includes('discount') || false; 
      return { amount: hasDiscount ? Math.max(0, program.price - 300) : program.price, isUSD: false };
    }
  };

  // 1. Core Analytics Calculations
  const activeApprovedEnrollments = enrollments.filter((e) => e.status !== 'payment_pending' && e.status !== 'payment_rejected');
  
  let totalEarningsINR = 0;
  let totalEarningsUSD = 0;

  activeApprovedEnrollments.forEach((e) => {
    const p = getEnrollmentPrice(e);
    if (p.isUSD) {
      totalEarningsUSD += p.amount;
    } else {
      totalEarningsINR += p.amount;
    }
  });

  const pendingPaymentsCount = enrollments.filter((e) => e.status === 'payment_pending').length;
  const pendingSubmissionsCount = enrollments.filter((e) => e.status === 'submitted').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;
  const activeStudentsCount = enrollments.filter((e) => e.status === 'active' || e.status === 'redo').length;
  const completedStudentsCount = enrollments.filter((e) => e.status === 'completed').length;

  // Group daily enrollments for trending chart
  const dailyEnrollments: { [dateStr: string]: number } = {};
  enrollments.forEach((e) => {
    const rawDate = e.paymentTimestamp ? e.paymentTimestamp.split(' ')[0] : '2026-06-16';
    // Format to short date
    dailyEnrollments[rawDate] = (dailyEnrollments[rawDate] || 0) + 1;
  });

  const chartData = Object.keys(dailyEnrollments).sort().map(date => ({
    date: date.substring(5), // Keep MM-DD
    count: dailyEnrollments[date],
  })).slice(-7); // Last 7 days

  // Filter lists based on global Search
  const filteredAllStudents = enrollments.filter((e) => {
    const term = searchTerm.toLowerCase();
    const program = internships.find((p) => p.id === e.internshipId);
    return e.studentName.toLowerCase().includes(term) ||
           e.studentEmail.toLowerCase().includes(term) ||
           (program?.title && program.title.toLowerCase().includes(term)) ||
           e.status.toLowerCase().includes(term);
  });

  const filteredEnrollmentsForPayments = enrollments.filter((e) => {
    const matchSearch = e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (e.transactionId && e.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchSearch) return false;
    
    if (paymentFilter === 'pending') {
      return e.status === 'payment_pending';
    } else if (paymentFilter === 'approved') {
      return !['payment_pending', 'payment_rejected'].includes(e.status);
    }
    return true;
  });

  const filteredEnrollmentsForSubmissions = enrollments.filter((e) => {
    const matchSearch = e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (submissionFilter === 'pending_review') {
      return e.status === 'submitted';
    } else if (submissionFilter === 'graded') {
      return ['completed', 'redo', 'failed'].includes(e.status);
    }
    return true;
  });

  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return t.studentName.toLowerCase().includes(term) || 
           t.studentEmail.toLowerCase().includes(term) ||
           t.subject.toLowerCase().includes(term) ||
           t.message.toLowerCase().includes(term);
  });

  // Bulk selectors
  const handleToggleSelectItem = (id: string) => {
    if (selectedEnrollments.includes(id)) {
      setSelectedEnrollments(selectedEnrollments.filter((item) => item !== id));
    } else {
      setSelectedEnrollments([...selectedEnrollments, id]);
    }
  };

  const handleToggleSelectAll = () => {
    const pendingOnCurrentView = filteredEnrollmentsForPayments
      .filter((e) => e.status === 'payment_pending')
      .map((e) => e.id);

    if (selectedEnrollments.length === pendingOnCurrentView.length) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(pendingOnCurrentView);
    }
  };

  const handleBulkApprove = () => {
    if (selectedEnrollments.length === 0) return;
    if (confirm(`Are you sure you want to approve ${selectedEnrollments.length} transactions, allocating program sheets instantly?`)) {
      selectedEnrollments.forEach((id) => onApprovePayment(id));
      setSelectedEnrollments([]);
    }
  };

  const handleToggleSelectSubmission = (id: string) => {
    if (selectedSubmissions.includes(id)) {
      setSelectedSubmissions(selectedSubmissions.filter((item) => item !== id));
    } else {
      setSelectedSubmissions([...selectedSubmissions, id]);
    }
  };

  const handleToggleSelectAllSubmissions = () => {
    const pendingSubmissionsOnView = filteredEnrollmentsForSubmissions
      .filter((e) => e.status === 'submitted')
      .map((e) => e.id);

    const allSelected = pendingSubmissionsOnView.every((id) => selectedSubmissions.includes(id));
    if (allSelected) {
      setSelectedSubmissions(selectedSubmissions.filter((id) => !pendingSubmissionsOnView.includes(id)));
    } else {
      const union = Array.from(new Set([...selectedSubmissions, ...pendingSubmissionsOnView]));
      setSelectedSubmissions(union);
    }
  };

  const handleBulkApproveSubmissions = () => {
    const pendingToApprove = selectedSubmissions.filter(id => {
      const enr = enrollments.find(e => e.id === id);
      return enr && enr.status === 'submitted';
    });
    if (pendingToApprove.length === 0) return;
    if (confirm(`Are you sure you want to bulk approve graduation certificates for ${pendingToApprove.length} selected project submissions?`)) {
      pendingToApprove.forEach((id) => onGradeSubmission(id, 'completed', 'Outstanding completion! Verified and approved in bulk.'));
      setSelectedSubmissions([]);
    }
  };

  const handleIndividualApprove = (id: string) => {
    onApprovePayment(id);
  };

  const handleIndividualRejectSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    onRejectPayment(id, rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  const handleGradeSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    onGradeSubmission(id, gradingStatus, gradingNotes);
    setGradingId(null);
    setGradingNotes('');
  };

  const handleTicketReplySubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;
    onResolveTicket(id, adminReplyText);
    setActiveTicketId(null);
    setAdminReplyText('');
  };

  const getCampaignFilteredEnrollments = () => {
    return enrollments.filter(e => {
      // Must be processed and in good standing
      if (['payment_pending', 'payment_rejected'].includes(e.status)) return false;
      
      // Filter by internship if not "all"
      if (campaignInternshipId !== 'all' && e.internshipId !== campaignInternshipId) return false;
      
      // Filter by duration if not "all"
      if (campaignDurationMonths !== 'all') {
        const dMonths = parseInt(campaignDurationMonths);
        const enrollDuration = e.durationMonths || 3; 
        if (enrollDuration !== dMonths) return false;
      }
      
      return true;
    });
  };

  const handleSendCampaign = () => {
    const list = getCampaignFilteredEnrollments();
    if (list.length === 0) {
      alert("No approved active applicants match your selected program + duration criteria. Please modify list parameters.");
      return;
    }
    
    let confirmMessage = `Are you sure you want to broadcast personalized email campaign templates to all ${list.length} candidate(s)?`;
    if (campaignAttachmentType !== 'none' && campaignAttachmentName) {
      confirmMessage += `\n\n🖇️ Attachment Included: "${campaignAttachmentName}" (${campaignAttachmentSize})`;
    }

    if (confirm(confirmMessage)) {
      setIsSendingCampaign(true);
      setCampaignSendingProgress(0);
      setCampaignSentSuccess(false);
      setCampaignSendLogs([
        "[SMTP] Initializing SMTP mail handshakes with DeltaClause secure gateway...",
        "[SMTP] Fetching active student registration catalogs..."
      ]);
      
      let index = 0;
      const intervalMs = Math.max(250, 1500 / list.length);
      
      const sendNext = () => {
        if (index >= list.length) {
          setCampaignSendingProgress(100);
          setIsSendingCampaign(false);
          setCampaignSentSuccess(true);
          setCampaignSendLogs(prev => [
            ...prev,
            `[SMTP] SUCCESS: All campaigns dispatched. ${list.length} personalized messages delivered to recipients (100% SUCCESS).`
          ]);
          if (senderTimerRef.current) {
            clearTimeout(senderTimerRef.current);
            senderTimerRef.current = null;
          }
          return;
        }
        
        const candidate = list[index];
        const prog = internships.find(i => i.id === candidate.internshipId) || { title: "Custom Internship", durationWeeks: 12 };
        const duration = candidate.durationMonths || 3;
        
        const deadlineDateStr = candidate.expiryDate || new Date(new Date().getTime() + duration * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        
        const expiryDateObj = new Date(deadlineDateStr);
        const submissionStartObj = new Date(expiryDateObj.getTime() - 5 * 24 * 60 * 60 * 1000);
        const submissionStartStr = submissionStartObj.toISOString().substring(0, 10);

        setCampaignSendLogs(prev => {
          const newLogs = [
            ...prev,
            `[SMTP] 📨 Rendered custom body parameters for recipient: ${candidate.studentName} <${candidate.studentEmail}>`,
            `[SMTP] ✍️ Injected values: {name="${candidate.studentName}", title="${prog.title}", duration=${duration} Months, deadline=${deadlineDateStr}, submission_start=${submissionStartStr}}`
          ];

          if (campaignAttachmentType !== 'none' && campaignAttachmentName) {
            newLogs.push(`[SMTP] 🖇️ Bundled Attachment Binary: "${campaignAttachmentName}" (${campaignAttachmentSize})`);
            newLogs.push(`[SMTP] ⚙️ Attachment MIME Base64 Content hash: MD5-a3f28d8b9...`);
          }

          newLogs.push(`[SMTP] STARTTLS Secure Handshake Handled ...`);
          newLogs.push(`[SMTP] 🚀 Message successfully accepted for delivery to router: <${candidate.studentEmail}> (250 OK)`);
          return newLogs;
        });
        
        index++;
        setCampaignSendingProgress(Math.floor((index / list.length) * 100));
        senderTimerRef.current = setTimeout(sendNext, intervalMs);
      };
      
      senderTimerRef.current = setTimeout(sendNext, 400);
    }
  };

  const handleDirectSingleSend = (candidate: Enrollment) => {
    const prog = internships.find(i => i.id === candidate.internshipId) || { title: "Custom Internship", durationWeeks: 12 };
    const duration = candidate.durationMonths || 3;
    const deadlineDateStr = candidate.expiryDate || new Date(new Date().getTime() + duration * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const expiryDateObj = new Date(deadlineDateStr);
    const submissionStartObj = new Date(expiryDateObj.getTime() - 5 * 24 * 60 * 60 * 1000);
    const submissionStartStr = submissionStartObj.toISOString().substring(0, 10);
    const sheetNameStr = (prog.title.toLowerCase().includes('frontend') || prog.title.toLowerCase().includes('react')) 
      ? "Frontend_Internship_Task_Sheet.pdf" 
      : "Fullstack_Developer_Task_Sheet.pdf";

    // Personalize template subject & body
    let customizedSubject = campaignSubject
      .replace(/{title}/g, prog.title)
      .replace(/{name}/g, candidate.studentName)
      .replace(/{duration}/g, duration.toString())
      .replace(/{weeks}/g, (duration * 4).toString())
      .replace(/{deadline}/g, deadlineDateStr)
      .replace(/{submission_start}/g, submissionStartStr)
      .replace(/{sheet_name}/g, sheetNameStr)
      .replace(/{txn}/g, candidate.transactionId || "TXN-DEMO1234");

    let customizedBody = campaignBody
      .replace(/{title}/g, prog.title)
      .replace(/{name}/g, candidate.studentName)
      .replace(/{duration}/g, duration.toString())
      .replace(/{weeks}/g, (duration * 4).toString())
      .replace(/{deadline}/g, deadlineDateStr)
      .replace(/{submission_start}/g, submissionStartStr)
      .replace(/{sheet_name}/g, sheetNameStr)
      .replace(/{txn}/g, candidate.transactionId || "TXN-DEMO1234");

    // Construct mailto link
    const mailtoUrl = `mailto:${encodeURIComponent(candidate.studentEmail)}?subject=${encodeURIComponent(customizedSubject)}&body=${encodeURIComponent(customizedBody)}`;
    
    // Popup advice if they chose an attachment
    if (campaignAttachmentType !== 'none' && campaignAttachmentName) {
      alert(`📬 Launching system mail client!\n\nSubject: "${customizedSubject}"\nRecipient: <${candidate.studentEmail}>\n\n⚠️ MAIL ATTACHMENT NOTICE:\nDue to security standards, web browsers cannot programmatically attach local system files to 'mailto:' links.\n\nPlease click "OK" and manually attach the file:\n👉 "${campaignAttachmentName}" (${campaignAttachmentSize})\ninside your email client before hitting send.`);
    } else {
      alert(`📬 Launching system mail client for direct send to ${candidate.studentName} <${candidate.studentEmail}>!`);
    }
    
    window.open(mailtoUrl, '_blank');
  };

  const handleCustomFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCampaignAttachmentType('custom');
      setCampaignAttachmentName(file.name);
      setCampaignAttachmentSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const handleCustomFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCampaignAttachmentType('custom');
      setCampaignAttachmentName(file.name);
      setCampaignAttachmentSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  // Pagination Calculation Helpers
  const getPaginatedItems = (items: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: any[]) => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header with dynamic counters summary */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-bold uppercase">ADMIN COMMAND HQ</span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">DeltaClause Management Portal</h2>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5">Scale educational operations, verify payments, track active enrollments, and award certificates.</p>
        </div>
        
        {/* Quick action Search bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Universal search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaymentsPage(1);
              setStudentsPage(1);
              setSubmissionsPage(1);
              setTicketsPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-mono outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 2. Horizontal Menu Segments Navbar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-900 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-405 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'students'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-405 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Listings</span>
          {activeStudentsCount > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {activeStudentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
            activeTab === 'payments'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-405 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments Desk</span>
          {pendingPaymentsCount > 0 && (
            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {pendingPaymentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'submissions'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-405 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Code Evaluations</span>
          {pendingSubmissionsCount > 0 && (
            <span className="bg-blue-105 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'support'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-405 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tickets</span>
          {openTicketsCount > 0 && (
            <span className="bg-pink-100 dark:bg-pink-905/30 text-pink-700 dark:text-pink-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'emails'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-450 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Campaigns</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'announcements'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-450 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Information Center</span>
          <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-450 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* 3. Main Switch Render Tab Contents */}

      {/* ===================== TAB A: OVERVIEW & ANALYTICS ===================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Key metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Split Earnings Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block font-bold">Total Earnings Split</span>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white flex items-center">
                    ₹{totalEarningsINR.toLocaleString()}
                  </span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 text-indigo-700 dark:text-indigo-400 rounded font-mono font-bold">INR Domestic</span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-1.5 flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center">
                    ${totalEarningsUSD.toLocaleString()}
                  </span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400 rounded font-mono font-bold">USD Global</span>
                </div>
              </div>
            </div>

            {/* Total students */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/25 flex items-center justify-center text-blue-605">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase block font-bold">Students Directory</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">{enrollments.length} Registrations</span>
                <span className="text-[10px] text-slate-455 font-mono">{activeStudentsCount} currently learning</span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/25 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase block font-bold">Certified Graduates</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">{completedStudentsCount} Issued</span>
                <span className="text-[10px] text-emerald-605 font-mono">
                  {enrollments.length ? Math.round((completedStudentsCount / enrollments.length) * 100) : 0}% Graduation rate
                </span>
              </div>
            </div>

            {/* Verification backlog */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/25 flex items-center justify-center text-orange-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase block font-bold">Operational backlog</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">{pendingPaymentsCount + pendingSubmissionsCount} items</span>
                <span className="text-[10px] text-slate-400 font-mono">{pendingPaymentsCount} pay review, {pendingSubmissionsCount} git review</span>
              </div>
            </div>
          </div>

          {/* Graphical Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG Enrollment Trends chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl lg:col-span-2 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">📈 Daily Registration Trends</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Enrollment growth pattern over the last 7 active session checkpoints.</p>
                </div>
                <span className="font-mono text-[10px] font-bold text-indigo-650 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">Real-time stats</span>
              </div>

              {chartData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs font-mono text-slate-400">
                  Insufficient timeline logs to render vector graphs.
                </div>
              ) : (
                <div className="pt-2">
                  {/* Custom pure SVG chart */}
                  <svg className="w-full h-44" viewBox="0 0 500 180">
                    {/* Y-axis grids */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="#e2e8f0" className="dark:stroke-slate-800" />

                    {/* Chart columns loop */}
                    {chartData.map((d, index) => {
                      const barWidth = 32;
                      const gap = (440 - (chartData.length * barWidth)) / (chartData.length - 1 || 1);
                      const x = 40 + index * (barWidth + gap);
                      
                      // Normalize heights (max count in scale)
                      const maxVal = Math.max(...chartData.map(item => item.count), 4);
                      const heightRatio = 120 / maxVal;
                      const barHeight = Math.max(12, d.count * heightRatio);
                      const y = 150 - barHeight;

                      return (
                        <g key={index} className="group cursor-help">
                          {/* Hover effect backdrop */}
                          <rect x={x - 4} y={15} width={barWidth + 8} height={145} fill="transparent" className="hover:fill-slate-50/40 dark:hover:fill-slate-800/10 rounded transition-colors" />
                          
                          {/* Vector Bar */}
                          <rect 
                            x={x} 
                            y={y} 
                            width={barWidth} 
                            height={barHeight} 
                            rx="6"
                            fill="url(#indigo-gradient)"
                            className="transition-all hover:opacity-90"
                          />

                          {/* Value tooltip label above bar */}
                          <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[10px] font-bold font-mono text-indigo-650 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor">
                            {d.count}
                          </text>

                          {/* X labels */}
                          <text x={x + barWidth / 2} y={168} textAnchor="middle" className="text-[9px] font-mono text-slate-400" fill="currentColor">
                            {d.date}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>

            {/* Quick configuration insight card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-6 rounded-3xl text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold uppercase block">Verification rules engine</span>
                <h4 className="text-lg font-black leading-snug">Nuclear Referral refund configurations</h4>
                <p className="text-xs text-indigo-100/70 leading-relaxed font-mono">
                  Currently configured to grant 100% tuition refund once <span className="text-amber-400 font-bold">{refundThreshold}</span> of a referrer's invites enroll in programs successfully.
                </p>
              </div>

              <div className="bg-black/25 border border-indigo-500/20 rounded-2xl p-4 mt-6">
                <div className="text-[10px] text-indigo-300 font-mono font-bold uppercase">Backlog Health</div>
                <div className="flex items-center justify-between text-xs font-mono mt-1 pt-1 border-t border-indigo-500/10">
                  <span className="text-indigo-200">Unresolved Tickets</span>
                  <span className="font-bold text-pink-400">{openTicketsCount} open</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono mt-1">
                  <span className="text-indigo-200">Awaiting Grade</span>
                  <span className="font-bold text-blue-400">{pendingSubmissionsCount} reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ===================== TAB B: STUDENT LIST LISTINGS ===================== */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Student Details & Progress Directory</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A complete operational directory of registered students and their live course statuses.
              </p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-indigo-605 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-xl">
                {filteredAllStudents.length} Students Total
              </span>
            </div>
          </div>

          {filteredAllStudents.length === 0 ? (
            <div className="text-center py-12 font-mono text-xs text-slate-400">
              No students found matching your search term.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/85">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Student Profile</th>
                      <th className="py-3 px-3">E-Mail Address</th>
                      <th className="py-3 px-3">Internship Program</th>
                      <th className="py-3 px-3">Enrolled Status</th>
                      <th className="py-3 px-3 text-right">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {getPaginatedItems(filteredAllStudents, studentsPage).map((student: Enrollment) => {
                      const program = internships.find((p) => p.id === student.internshipId);
                      
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-950/45 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 dark:text-neutral-100">{student.studentName}</div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">UID: {student.id}</span>
                            
                            {student.studentPhone && (
                              <div className="mt-1 text-[10.5px] text-slate-550 dark:text-neutral-400 space-y-0.5 bg-slate-100/50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/40 font-sans">
                                <p>📱 <strong className="font-bold">WhatsApp:</strong> {student.studentPhone}</p>
                                <p>🎓 <strong className="font-bold">Education:</strong> {student.qualification}</p>
                                <p>🏢 <strong className="font-bold">College:</strong> {student.collegeName}</p>
                                {student.domainApplied && <p>🏷️ <strong className="font-bold">Applied Domain:</strong> {student.domainApplied}</p>}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {student.studentEmail}
                          </td>
                          <td className="py-4 px-3">
                            <span className="font-semibold text-indigo-650 dark:text-indigo-400 truncate max-w-48 block">
                              {program?.title || student.internshipId}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {program ? `${program.durationMonths} ${program.durationMonths === 1 ? 'Month' : 'Months'}` : ''} curriculum
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              student.status === 'completed' ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                              student.status === 'active' ? 'bg-blue-100/50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                              student.status === 'submitted' ? 'bg-cyan-100/50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' :
                              student.status === 'payment_pending' ? 'bg-amber-100/50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                              student.status === 'redo' ? 'bg-orange-100/50 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                              'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-455'
                            }`}>
                              {student.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right font-mono font-bold text-slate-700 dark:text-white">
                            {student.taskAttempts || 0} Attempts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-455 font-mono">
                  Showing page <strong>{studentsPage}</strong> of {getTotalPages(filteredAllStudents)} ({filteredAllStudents.length} matched)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={studentsPage === 1}
                    onClick={() => setStudentsPage(Math.max(1, studentsPage - 1))}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 hover:border-slate-400 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 disabled:opacity-40 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={studentsPage >= getTotalPages(filteredAllStudents)}
                    onClick={() => setStudentsPage(studentsPage + 1)}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 hover:border-slate-400 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 disabled:opacity-40 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ===================== TAB C: PAYMENTS DESK ===================== */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-650" />
                <span>Payments Audit & Approval Desk</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Audit screenshots and approve access keys or reject mismatching transaction receipts.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setPaymentFilter('all'); setPaymentsPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  paymentFilter === 'all' ? 'bg-indigo-600 text-white border-indigo-550' : 'bg-slate-50 dark:bg-neutral-950 text-slate-650 dark:text-neutral-400 border-slate-200 dark:border-slate-800 hover:border-slate-350'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => { setPaymentFilter('pending'); setPaymentsPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  paymentFilter === 'pending' ? 'bg-amber-500/15 border-amber-300 text-amber-605 font-bold' : 'bg-slate-50 dark:bg-neutral-950 text-slate-650 dark:text-neutral-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                Awaiting Check ({pendingPaymentsCount})
              </button>
            </div>
          </div>

          {/* Bulk actions tools trigger */}
          {selectedEnrollments.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40 p-3 border border-indigo-100 dark:border-indigo-900 rounded-2xl">
              <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400 font-bold">
                {selectedEnrollments.length} Pending Transactions selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="bg-emerald-600 hover:bg-emerald-505 text-white font-mono text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Bulk Approve Payments ({selectedEnrollments.length})</span>
              </button>
            </div>
          )}

          {filteredEnrollmentsForPayments.length === 0 ? (
            <div className="text-center py-10 font-mono text-xs text-slate-400">
              No payments captured with current constraints.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-mono text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-3 w-10">
                        <button 
                          onClick={handleToggleSelectAll} 
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          type="button"
                        >
                          {selectedEnrollments.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      </th>
                      <th className="py-3 px-2">Student Profiles</th>
                      <th className="py-3 px-2">Internship Program</th>
                      <th className="py-3 px-2">Currency Type</th>
                      <th className="py-3 px-2">Transaction ID</th>
                      <th className="py-3 px-2">Proof screenshot</th>
                      <th className="py-3 px-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {getPaginatedItems(filteredEnrollmentsForPayments, paymentsPage).map((e) => {
                      const program = internships.find((i) => i.id === e.internshipId);
                      const isPending = e.status === 'payment_pending';
                      const isSelected = selectedEnrollments.includes(e.id);
                      const isUSD = checkIsUSD(e);
                      const priceObj = getEnrollmentPrice(e);

                      return (
                        <tr key={e.id} className={`hover:bg-slate-50/50 dark:hover:bg-neutral-950/40 transition-colors ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'text-slate-800 dark:text-slate-150'
                        }`}>
                          <td className="py-4 px-3">
                            {isPending ? (
                              <button 
                                onClick={() => handleToggleSelectItem(e.id)}
                                className="text-slate-400 hover:text-slate-900 cursor-pointer"
                                type="button"
                              >
                                {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                              </button>
                            ) : (
                              <Check className="w-4 h-4 text-emerald-555" />
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <div className="font-bold text-slate-900 dark:text-neutral-100">{e.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{e.studentEmail}</div>
                          </td>
                          <td className="py-2 px-2 font-semibold">
                            {program?.title}
                          </td>
                          <td className="py-2 px-2">
                            {isUSD ? (
                              <span className="text-emerald-650 bg-emerald-50 dark:bg-emerald-905/20 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                                🌎 PAYPAL / ${priceObj.amount} USD
                              </span>
                            ) : (
                              <span className="text-indigo-650 bg-indigo-50 dark:bg-indigo-905/20 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                                🇮🇳 UPI / ₹{priceObj.amount} INR
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-indigo-605">
                            {e.transactionId || 'N/A'}
                          </td>
                          <td className="py-2 px-2">
                            {e.paymentScreenshotUrl ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={e.paymentScreenshotUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-8 h-8 rounded border overflow-hidden block bg-slate-100 dark:bg-slate-950"
                                >
                                  <img
                                    src={e.paymentScreenshotUrl}
                                    alt="Receipt proof"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                                <span className="text-[9px] text-slate-400 font-mono">Zoom</span>
                              </div>
                            ) : (
                              <span className="italic text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleIndividualApprove(e.id)}
                                  className="bg-emerald-600 hover:bg-emerald-551 text-white p-1 px-2 rounded font-mono font-bold text-[10px] cursor-pointer"
                                  type="button"
                                >
                                  Approve
                                </button>
                                
                                {rejectId === e.id ? (
                                  <form 
                                    onSubmit={(ev) => handleIndividualRejectSubmit(ev, e.id)}
                                    className="absolute right-4 p-3 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 rounded-xl z-20 shadow-xl text-left max-w-xs space-y-2 mt-4"
                                  >
                                    <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Rejection Reason</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Reason..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded text-xs text-slate-900 dark:text-white"
                                    />
                                    <div className="flex gap-1">
                                      <button type="submit" className="bg-red-650 text-white p-1 rounded font-bold text-[10px] flex-1">Confirm</button>
                                      <button type="button" onClick={() => setRejectId(null)} className="bg-slate-100 dark:bg-neutral-800 p-1 rounded text-[10px] flex-1 text-slate-600">Cancel</button>
                                    </div>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => { setRejectId(e.id); setRejectReason(''); }}
                                    className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white p-1 px-2 rounded border border-rose-200 font-mono font-bold text-[10px] cursor-pointer"
                                    type="button"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className={`font-mono text-[10px] font-bold uppercase ${e.status === 'payment_rejected' ? 'text-red-500' : 'text-emerald-600'}`}>
                                {e.status === 'payment_rejected' ? 'Rejected' : 'Approved'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Payments Pagination */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-455 font-mono">
                  Showing page <strong>{paymentsPage}</strong> of {getTotalPages(filteredEnrollmentsForPayments)} ({filteredEnrollmentsForPayments.length} matched)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={paymentsPage === 1}
                    onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 hover:border-slate-405 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={paymentsPage >= getTotalPages(filteredEnrollmentsForPayments)}
                    onClick={() => setPaymentsPage(paymentsPage + 1)}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 hover:border-slate-405 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ===================== TAB D: CODE EVALUATIONS DESK ===================== */}
      {activeTab === 'submissions' && (
        <div id="project-submissions-review" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm animate-fade-in space-y-4">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-650" />
                <span>Student Deliverables Review Console</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluate student bento repository submissions. Pass results generates active PDF certificates dynamically.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setSubmissionFilter('all'); setSubmissionsPage(1); }}
                className={`px-3 py-1.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer hover:border-slate-350 ${
                  submissionFilter === 'all' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400 dark:border-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Submissions
              </button>
              <button
                onClick={() => { setSubmissionFilter('pending_review'); setSubmissionsPage(1); }}
                className={`px-3 py-1.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer hover:border-slate-350 ${
                  submissionFilter === 'pending_review' ? 'text-blue-600 dark:text-blue-400 border-blue-400 dark:border-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Awaiting Grade ({pendingSubmissionsCount})
              </button>
            </div>
          </div>

          {/* Bulk actions and Select All tools for project submissions */}
          {filteredEnrollmentsForSubmissions.filter(e => e.status === 'submitted').length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleToggleSelectAllSubmissions}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 text-slate-705 dark:text-neutral-305 rounded-xl transition-all font-mono text-[11px] font-bold cursor-pointer"
              >
                {selectedSubmissions.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Toggle Select All On Page</span>
              </button>

              {selectedSubmissions.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-950 p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-mono text-slate-600 dark:text-neutral-400 px-1 font-bold">
                    {selectedSubmissions.filter(id => enrollments.some(e => e.id === id && e.status === 'submitted')).length} Selected
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkApproveSubmissions}
                    className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Graduation certificates bulk issue</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {filteredEnrollmentsForSubmissions.length === 0 ? (
            <div className="text-center py-10 font-mono text-xs text-slate-400">
              No code submissions captured with current filters.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {getPaginatedItems(filteredEnrollmentsForSubmissions, submissionsPage).map((enr) => {
                  const program = internships.find((i) => i.id === enr.internshipId);
                  const isSubmitted = enr.status === 'submitted';
                  const isSelected = selectedSubmissions.includes(enr.id);

                  return (
                    <div 
                      key={enr.id} 
                      className={`border p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-slate-800 dark:text-slate-200 transition-all ${
                        isSelected 
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-250 dark:border-indigo-500/30' 
                          : 'bg-slate-50/55 dark:bg-neutral-950 border-slate-200 dark:border-slate-850 hover:border-slate-250 dark:hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                        {isSubmitted ? (
                          <button 
                            onClick={() => handleToggleSelectSubmission(enr.id)}
                            className="text-slate-400 dark:text-slate-500 hover:text-slate-900 cursor-pointer shrink-0 mt-1 md:mt-0"
                            type="button"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                          </button>
                        ) : (
                          <div className="w-4 h-4 text-emerald-500 shrink-0 mt-1 md:mt-0 flex items-center justify-center">
                            {enr.status === 'completed' ? <Check className="w-4 h-4 text-emerald-555" /> : <div className="w-4 h-4" />}
                          </div>
                        )}

                        <div className="space-y-2 max-w-xl min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap text-left">
                            <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">{enr.studentName}</span>
                            <span className="text-[10px] font-mono text-slate-400">({enr.studentEmail})</span>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-indigo-400">&rarr; {program?.title}</span>
                          </div>

                          <div className="text-xs font-mono text-slate-500 dark:text-neutral-400 space-y-1 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-slate-400">GitHub Link:</strong>
                              {enr.submissionUrl ? (
                                <a 
                                  href={enr.submissionUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                                >
                                  {enr.submissionUrl} <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="italic text-slate-400">No URL included</span>
                              )}
                            </div>
                            <div className="p-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-850 rounded text-[10px] italic">
                              "{enr.submissionNote || 'No student notes included.'}"
                            </div>
                            {enr.adminNotes && (
                              <div className="text-[11px] text-orange-605">
                                <strong className="text-slate-400">Last Feedback:</strong> "{enr.adminNotes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="text-right shrink-0">
                        {isSubmitted ? (
                          <div>
                            {gradingId === enr.id ? (
                              <form 
                                onSubmit={(e) => handleGradeSubmit(e, enr.id)}
                                className="bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 p-3 rounded-xl max-w-sm text-left space-y-3 shadow-xl relative z-10"
                              >
                                <label className="block text-[10px] uppercase font-mono text-slate-500">Evaluation Grade</label>
                                <div className="flex gap-2">
                                  {['completed', 'redo', 'failed'].map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => setGradingStatus(st as any)}
                                      className={`flex-1 p-1.5 px-2 rounded font-mono text-[10px] uppercase font-bold text-center border transition-all ${
                                        gradingStatus === st
                                          ? 'bg-indigo-650 text-white border-indigo-550'
                                          : 'bg-slate-50 dark:bg-neutral-950 text-slate-500 border-slate-200 dark:border-neutral-800'
                                      }`}
                                    >
                                      {st === 'completed' ? 'Pass' : st === 'redo' ? 'Re-Do' : 'Fail'}
                                    </button>
                                  ))}
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Remarks</label>
                                  <textarea
                                    value={gradingNotes}
                                    required={gradingStatus === 'redo'}
                                    onChange={(e) => setGradingNotes(e.target.value)}
                                    placeholder="Provide feedback remarks..."
                                    rows={2}
                                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-1 text-xs text-slate-900 dark:text-white"
                                  />
                                </div>

                                <div className="flex gap-2 text-[10px]">
                                  <button type="submit" className="bg-indigo-650 text-white py-1 px-3 rounded font-bold">Save</button>
                                  <button type="button" onClick={() => setGradingId(null)} className="bg-slate-100 dark:bg-neutral-800 text-slate-600 py-1 px-3 rounded">Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => { setGradingId(enr.id); setGradingNotes(''); setGradingStatus('completed'); }}
                                className="bg-indigo-650 text-white hover:bg-indigo-600 text-xs font-bold py-2 px-3 rounded-xl cursor-pointer"
                                type="button"
                              >
                                Grade Task &rarr;
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 font-mono text-xs">
                            {enr.status === 'completed' && (
                              <div className="text-right space-y-1">
                                <span className="text-emerald-600 font-bold bg-emerald-100/40 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase text-[10px]">Graduated</span>
                                {enr.certificateId && <code className="block text-[10px] text-indigo-600 font-bold">{enr.certificateId}</code>}
                              </div>
                            )}
                            {enr.status === 'redo' && <span className="text-orange-605 font-bold bg-orange-100/40 dark:bg-orange-955/20 px-2 py-0.5 rounded border border-orange-500/10 uppercase text-[10px]">Redo Sent</span>}
                            {enr.status === 'failed' && <span className="text-red-500 font-bold bg-red-400/10 px-2 py-0.5 rounded uppercase text-[10px]">Failed</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submissions Pagination */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-455 font-mono">
                  Showing page <strong>{submissionsPage}</strong> of {getTotalPages(filteredEnrollmentsForSubmissions)} ({filteredEnrollmentsForSubmissions.length} matched)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={submissionsPage === 1}
                    onClick={() => setSubmissionsPage(Math.max(1, submissionsPage - 1))}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={submissionsPage >= getTotalPages(filteredEnrollmentsForSubmissions)}
                    onClick={() => setSubmissionsPage(submissionsPage + 1)}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ===================== TAB E: LIVE TICKETS SUPPORT ===================== */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-650" />
                <span>Operational Support Desk</span>
              </h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 font-sans">
                Reply to active student tickets to resolve system blockers or clear deadline queries.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-3 py-1 rounded-xl">
              {filteredTickets.filter(t => t.status === 'open').length} Open Tickets
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-10 font-mono text-slate-400 text-xs">
              No tickets found matching current parameters.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPaginatedItems(filteredTickets, ticketsPage).map((tkt: SupportTicket) => (
                  <div key={tkt.id} className={`p-4 border rounded-2xl font-mono text-xs space-y-3 transition-colors ${
                    tkt.status === 'open' ? 'bg-slate-50 dark:bg-neutral-950 border-orange-251 dark:border-orange-500/20' : 'bg-slate-50/60 dark:bg-neutral-950/60 border-slate-200 dark:border-neutral-850'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Ticket #{tkt.id}</span>
                      <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${
                        tkt.status === 'open' ? 'bg-orange-500/20 text-orange-600' : 'bg-emerald-500/20 text-emerald-600'
                      }`}>
                        {tkt.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900 dark:text-neutral-100">{tkt.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">By: {tkt.studentName} ({tkt.studentEmail})</div>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-850 rounded text-[11px] text-slate-650 dark:text-neutral-400 italic">
                      "{tkt.message}"
                    </div>

                    {activeTicketId === tkt.id ? (
                      <form onSubmit={(e) => handleTicketReplySubmit(e, tkt.id)} className="space-y-2 mt-3">
                        <textarea
                          required
                          placeholder="Type your official reply..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          rows={2}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-800 p-2 rounded text-xs text-slate-909 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="bg-indigo-650 text-white font-bold text-[10px] py-1 px-3 rounded">Send & Resolve</button>
                          <button type="button" onClick={() => setActiveTicketId(null)} className="bg-slate-100 dark:bg-neutral-800 text-slate-600 text-[10px] py-1 px-3 rounded">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        {tkt.status === 'open' ? (
                          <button
                            onClick={() => { setActiveTicketId(tkt.id); setAdminReplyText(''); }}
                            className="bg-indigo-50 hover:bg-indigo-600 border border-indigo-250 text-indigo-650 hover:text-white text-[11px] p-1 px-3 rounded-lg font-sans font-bold cursor-pointer transition-colors"
                            type="button"
                          >
                            Reply & Resolve &rarr;
                          </button>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-bold font-sans">
                            ✓ Ticket Resolved & Replied
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Tickets Pagination */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-455 font-mono">
                  Showing page <strong>{ticketsPage}</strong> of {getTotalPages(filteredTickets)} ({filteredTickets.length} matched)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={ticketsPage === 1}
                    onClick={() => setTicketsPage(Math.max(1, ticketsPage - 1))}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={ticketsPage >= getTotalPages(filteredTickets)}
                    onClick={() => setTicketsPage(ticketsPage + 1)}
                    className="p-1.5 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 disabled:opacity-40"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      {/* ===================== TAB E: CUSTOM MAIL CAMPAIGNS ===================== */}
      {activeTab === 'emails' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Stats Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase block font-mono">DELTA MAIL GATEWAY</span>
              <h3 className="text-lg font-extrabold tracking-tight">Mass Broadcast Campaign Console</h3>
              <p className="text-xs text-slate-400 font-sans">
                Filter approved student cohorts by selected Internship category and active term duration, compose dynamic variables, and send.
              </p>
            </div>
            <div className="bg-white/10 p-2.5 px-4 rounded-2xl border border-white/5 text-right flex items-center gap-3">
              <div className="font-mono text-xs">
                <span className="text-slate-455 block text-[9.5px] uppercase font-bold text-center">Eligible Recipients</span>
                <span className="font-extrabold text-indigo-300 text-lg block text-center mt-0.5">
                  {getCampaignFilteredEnrollments().length} Students
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Filter Controls and Template Choice */}
            <div className="space-y-5 lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  1. Filter Cohort Recipients
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Program */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-neutral-400 block">
                      Target Internship Program
                    </label>
                    <select
                      value={campaignInternshipId}
                      onChange={(e) => setCampaignInternshipId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white"
                    >
                      <option value="all">All Programs (Show Combined Listings)</option>
                      {internships.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Duration */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-neutral-400 block">
                      Desired Internship Duration
                    </label>
                    <select
                      value={campaignDurationMonths}
                      onChange={(e) => setCampaignDurationMonths(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-505 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white"
                    >
                      <option value="all">All Durations (1, 2, 3, or 6 Months)</option>
                      <option value="1">1 Month Promo Term</option>
                      <option value="2">2 Months Term</option>
                      <option value="3">3 Months Term</option>
                      <option value="6">6 Months Term</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Editor */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    2. Customize Mail Templates
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] text-slate-400 uppercase font-mono block">Preset:</span>
                    <select
                      value={campaignTemplateId}
                      onChange={(e) => setCampaignTemplateId(e.target.value)}
                      className="bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg py-1 px-2.5 text-[10px] font-bold outline-none text-indigo-600 dark:text-indigo-400"
                    >
                      <option value="welcome">Welcome & Offer Onboarding Letter</option>
                      <option value="midterm">Milestone Term Progress Report</option>
                      <option value="final_alert">Final Overdue Deliverable Link Request</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                      Email Subject Header
                    </label>
                    <input
                      type="text"
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="e.g. [Deltaclause] Action Required..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        Email Body Markup (Editable)
                      </label>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        Supports: <code className="font-bold underline text-indigo-600">{`{name}`}</code>, <code className="font-bold underline text-indigo-600">{`{title}`}</code>, <code className="font-bold underline text-indigo-600">{`{duration}`}</code>/Weeks, <code className="font-bold underline text-indigo-600">{`{deadline}`}</code>, <code className="font-bold underline text-indigo-600">{`{submission_start}`}</code>
                      </span>
                    </div>
                    <textarea
                      rows={11}
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      placeholder="Compose email template body..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs outline-none text-slate-900 dark:text-white font-mono leading-relaxed resize-y"
                    />
                  </div>

                  {/* File Attachment Control Section */}
                  <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-4 mt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-neutral-400 block flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-505" />
                        <span>Dynamic Campaign Attachment</span>
                      </label>
                      {campaignAttachmentName && (
                        <span className="text-[9.5px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold border border-indigo-100 dark:border-indigo-900/40">
                          📎 Attached
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Select Attachment Mode */}
                      <div className="md:col-span-1 space-y-1">
                        <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Attachment Preset</span>
                        <select
                          value={campaignAttachmentType}
                          onChange={(e) => setCampaignAttachmentType(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-mono"
                        >
                          <option value="none">No Attachment</option>
                          <option value="task_sheet">Internship Task Sheet (PDF)</option>
                          <option value="offer_letter">Offer Letter Template (PDF)</option>
                          <option value="custom">Custom File Upload</option>
                        </select>
                      </div>

                      {/* Display / Drag attachment zone */}
                      <div className="md:col-span-2">
                        {campaignAttachmentType === 'none' ? (
                          <div className="h-[52px] bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-201 dark:border-slate-850 flex items-center justify-center text-slate-400 text-[10.5px] italic">
                            No files attached to this campaign.
                          </div>
                        ) : campaignAttachmentType === 'custom' && !campaignAttachmentName ? (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleCustomFileDrop}
                            className={`h-[52px] rounded-xl border border-dashed text-center flex items-center justify-center gap-2 cursor-pointer transition-all text-[10px] ${
                              dragActive
                                ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600'
                                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 text-slate-500'
                            }`}
                            onClick={() => document.getElementById('custom-mail-attachment-uploader')?.click()}
                          >
                            <Upload className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="font-sans font-medium">Drag & Drop file here, or <strong className="text-indigo-600 dark:text-indigo-400 hover:underline">browse</strong></span>
                            <input
                              type="file"
                              id="custom-mail-attachment-uploader"
                              onChange={handleCustomFileSelect}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="h-[52px] bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-150 dark:border-indigo-900/50 p-2 px-3.5 flex items-center justify-between gap-3 animate-fade-in">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="block font-bold text-[11px] truncate text-slate-800 dark:text-slate-200 font-mono max-w-[120px] sm:max-w-[200px]">
                                  {campaignAttachmentName}
                                </span>
                                <span className="block text-[9px] text-slate-400 font-mono">
                                  Size: {campaignAttachmentSize} • Loaded
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignAttachmentType('none');
                                setCampaignAttachmentName('');
                                setCampaignAttachmentSize('');
                              }}
                              className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Remove attachment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Matched Candidate List & Broadcast Action Trigger */}
            <div className="space-y-5">
              
              {/* Recipient Roster */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Cohort Roster
                  </h4>
                  <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                    {getCampaignFilteredEnrollments().length} Found
                  </span>
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {getCampaignFilteredEnrollments().length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-neutral-500 font-sans italic space-y-2">
                      <p>No active/approved applicants match these specifications.</p>
                      <p className="text-[10px] font-mono not-italic text-indigo-600 dark:text-indigo-400">
                        Try clearing filter duration terms.
                      </p>
                    </div>
                  ) : (
                    getCampaignFilteredEnrollments().map((candidate, idx) => {
                      const candidateProg = internships.find(i => i.id === candidate.internshipId);
                      return (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/50 dark:border-neutral-850/60 font-mono text-[10px] space-y-2">
                          <div className="flex items-start gap-1 justify-between">
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-bold text-slate-805 dark:text-neutral-300 block text-[11px] font-sans truncate">
                                👤 {candidate.studentName}
                              </span>
                              <span className="text-slate-450 dark:text-neutral-410 block truncate font-sans text-[9px]">
                                ✉️ {candidate.studentEmail}
                              </span>
                              <span className="text-indigo-600 dark:text-indigo-400 uppercase font-black text-[8.5px] block">
                                📚 {candidateProg?.title || "Custom Internship"} ({candidate.durationMonths || 3}M)
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-red-500 font-bold block text-[9px]">
                                📅 {candidate.expiryDate || "Pending Approved"}
                              </span>
                              <span className="text-[8px] text-teal-600 bg-teal-500/10 px-1.2 py-0.5 rounded uppercase font-bold inline-block mt-1">
                                {candidate.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/40 dark:border-slate-800/40">
                            <span className="text-[8.5px] font-sans text-slate-400 italic">Individual Option:</span>
                            <button
                              type="button"
                              onClick={() => handleDirectSingleSend(candidate)}
                              className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-605 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[9px] px-2.5 py-1 rounded-lg font-bold font-sans transition-all cursor-pointer shadow-sm uppercase tracking-wide inline-flex items-center"
                              title="Prepare live drafting via mailto client"
                            >
                              <Mail className="w-2.5 h-2.5 text-indigo-500" />
                              <span>Direct Send</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={isSendingCampaign || getCampaignFilteredEnrollments().length === 0}
                    onClick={handleSendCampaign}
                    className="w-full text-center py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-neutral-800 text-white disabled:text-slate-500 rounded-2xl text-[11.5px] font-extrabold shadow-md shadow-indigo-605/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Broadcast Mailers ({getCampaignFilteredEnrollments().length})</span>
                  </button>
                </div>
              </div>

              {/* Sandbox Sender Simulator Progress Console */}
              {(isSendingCampaign || campaignSendLogs.length > 0) && (
                <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-md font-mono space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full bg-teal-400 ${isSendingCampaign ? "animate-ping" : ""} inline-block`} />
                      SMTP EMAIL ROUTER
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                      ACTIVE
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Campaign Dispatching:</span>
                      <span className="font-extrabold text-teal-300">{campaignSendingProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 font-extrabold transition-all duration-300"
                        style={{ width: `${campaignSendingProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Live Stream Terminal Logs */}
                  <div className="space-y-1 text-[9px] max-h-40 overflow-y-auto leading-relaxed bg-black/40 p-3 rounded-xl border border-neutral-900/60 text-slate-300">
                    {campaignSendLogs.map((log, idx) => (
                      <div key={idx} className="font-mono">
                        <span className="text-slate-500 mr-1 opacity-60">[{new Date().toLocaleTimeString()}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>

                  {campaignSentSuccess && (
                     <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl space-y-1 text-[11px] text-center font-sans">
                       <p className="font-extrabold uppercase font-mono text-teal-400">✨ SMTP Broadcast Complete</p>
                       <p className="text-teal-350 text-[10px]">
                         Personalized Thymeleaf properties evaluated. Candidate templates dispatched successfully to server pools.
                       </p>
                     </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* ===================== TAB H: DIGITAL INFORMATION CENTER ===================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              <span>Digital Broadcast Board & Information Center</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Broadcast general daily updates, guidelines, or event webinars to groups of student metrics instantly. Avoid relying on SMTP emails for routine messages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Compose and Broadcast Form */}
            <form onSubmit={handlePublishAnnouncement} className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-widest block font-mono">
                  ✍️ Compose Live Notice
                </span>
                <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded uppercase">
                  Instant Synced
                </span>
              </div>

              {annSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl leading-relaxed animate-pulse">
                  {annSuccessMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Internship Program Group</label>
                <select
                  value={annTargetInternshipId}
                  onChange={(e) => setAnnTargetInternshipId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-sans"
                >
                  <option value="all">All Registered Cohorts (Broadcast to everyone)</option>
                  {internships.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Cohort Duration Term</label>
                  <select
                    value={annTargetDuration}
                    onChange={(e) => setAnnTargetDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-sans"
                  >
                    <option value="all">All durations</option>
                    <option value="1">1 Month Term</option>
                    <option value="2">2 Months Term</option>
                    <option value="3">3 Months Term</option>
                    <option value="6">6 Months Term</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Badge Category</label>
                  <select
                    value={annBadge}
                    onChange={(e) => setAnnBadge(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-sans"
                  >
                    <option value="general">📝 General Update</option>
                    <option value="update">📋 Release / Change</option>
                    <option value="urgent">⚠️ Urgent Alert</option>
                    <option value="meetup">👥 Q&A / Tech Webinar</option>
                    <option value="task">🚀 Task Sheet Guidelines</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Broadcast Subject Heading</label>
                <input
                  type="text"
                  placeholder="e.g. ⚠️ Zoom webinar link update for React developers"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Notice Body Message</label>
                  <span className="text-[9px] text-slate-400 font-mono">Supports multi-line text</span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Paste your day-to-day cohort information notice guidelines or Zoom details here..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 dark:text-white font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Publish Notice Live</span>
              </button>
            </form>

            {/* Right Box: Directory of Published Notices */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-widest block font-mono">
                    📋 Active Notices Directory
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">Total {announcements.length} notices broadcasted</p>
                </div>

                {/* Quick Search inside notices */}
                <div className="relative max-w-xs">
                  <Search className="w-3 h-3 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={annSearchFilter}
                    onChange={(e) => setAnnSearchFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-[11px] outline-none text-slate-900 dark:text-white w-full sm:w-44 focus:w-56 transition-all"
                  />
                </div>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-mono text-xs space-y-2">
                  <p>All clear! Zero active notice board publications found.</p>
                  <p className="text-[10px] text-slate-400">Use the left editor to compose a notice for student cohorts.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {announcements
                    .filter((ann) => {
                      if (!annSearchFilter) return true;
                      const term = annSearchFilter.toLowerCase();
                      return ann.title.toLowerCase().includes(term) || ann.message.toLowerCase().includes(term);
                    })
                    .map((ann) => {
                      let badgeColorClass = 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300';
                      let badgeLabel = 'General';
                      if (ann.badge === 'urgent') {
                        badgeColorClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-450';
                        badgeLabel = 'Urgent Notice';
                      } else if (ann.badge === 'meetup') {
                        badgeColorClass = 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
                        badgeLabel = 'Live Meetup';
                      } else if (ann.badge === 'task') {
                        badgeColorClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-450';
                        badgeLabel = 'Task Sheet Release';
                      } else if (ann.badge === 'update') {
                        badgeColorClass = 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
                        badgeLabel = 'Release Update';
                      }

                      const programName = ann.targetInternshipId === 'all' 
                        ? '🌍 All Programs' 
                        : (internships.find(i => i.id === ann.targetInternshipId)?.title || 'Selected Cohort');

                      return (
                        <div
                          key={ann.id}
                          className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850/60 flex flex-col justify-between hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-all text-xs"
                        >
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-850/60">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${badgeColorClass}`}>
                                  {badgeLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">📅 {ann.createdAt}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all hover:cursor-pointer"
                                title="Delete/Retract Notice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1 font-sans">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-neutral-100 leading-tight">
                                {ann.title}
                              </h4>
                              <p className="text-[11px] sm:text-xs text-slate-650 dark:text-neutral-350 leading-relaxed whitespace-pre-wrap mt-2">
                                {ann.message}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/45 dark:border-slate-800/40 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
                            <div className="truncate max-w-full sm:max-w-xs">
                              🎯 Recipient Cohorts: <strong className="font-bold text-indigo-600 dark:text-indigo-400">{programName}</strong>
                            </div>
                            <div className="mt-1 sm:mt-0 font-sans">
                              🕒 Duration: <strong className="font-bold text-slate-700 dark:text-slate-300">{ann.targetDuration === 'all' ? 'All Terms' : `${ann.targetDuration} Months`}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ===================== TAB F: PLATFORM SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div id="system-configurations" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:p-6 shadow-sm animate-fade-in space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-605" />
              <span>Platform Settings & Rules Configurations</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adjust referral metrics thresholds, SMTP template simulation logs, and active business parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
            
            {/* Limit Invites Configurator */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs space-y-3 font-mono">
              <span className="font-bold text-slate-800 dark:text-neutral-300 block text-sm">Invites Threshold Configurator</span>
              <p className="text-slate-510 dark:text-neutral-500 leading-relaxed text-[11px] font-sans">
                Determine how many fully approved user invitations are required before the original structural referrer qualifies for 100% tuition refund.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={refundThreshold}
                  onChange={(e) => setRefundThreshold(Math.max(1, parseInt(e.target.value) || 3))}
                  className="w-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-bold text-slate-900 dark:text-white text-center text-sm outline-none"
                />
                <span className="text-slate-600 dark:text-slate-400 font-bold">Referrals Enrolled</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-500 block leading-tight font-sans">
                ⚠️ Modifying this instantly updates student bento metrics tickers on save.
              </span>
            </div>

            {/* Simulated Smtp email triggers */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs space-y-2.5 font-mono">
              <span className="font-bold text-slate-850 dark:text-neutral-300 block text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Simulated System Mail Log (SMTP Trigger)</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-neutral-500 font-sans leading-relaxed">
                Platform issues automatic transactional messages using pre-integrated Thymeleaf SMTP templates. Note live events:
              </p>
              <div className="bg-white dark:bg-neutral-900 p-2.5 border border-slate-205 dark:border-slate-850 rounded text-[10px] text-slate-500 dark:text-neutral-400 max-h-24 overflow-y-auto space-y-1 font-mono">
                <div>[SMTP - 13:20] Sent 'Materials Sheet' to student@deltaclause.com</div>
                <div>[SMTP - 12:44] Sent 'Certificate Issued' to karan.j@gmail.com</div>
                <div>[SMTP - 11:15] Sent 'PayPal Receipt Verified' to customer@gmail.com</div>
                <div>[SMTP - 09:30] Sent 'Welcome Verification Key' to ananya@gmail.com</div>
              </div>
            </div>

          </div>

          {/* Admin customizable promotional banner management hub */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <AdminBannerManagementHub />
          </div>
        </div>
      )}

    </div>
  );
}
