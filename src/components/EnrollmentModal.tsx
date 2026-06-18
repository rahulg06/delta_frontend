/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Internship, User } from '../types';
import { 
  X, QrCode, Upload, CheckCircle2, ShieldCheck, CreditCard, 
  DollarSign, Globe, Phone, Award, School, Layers, BookOpen, ExternalLink, HelpCircle
} from 'lucide-react';

interface Props {
  internship: Internship | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitEnrollment: (
    internshipId: string,
    transactionId: string,
    screenshotDataUrl: string,
    referralCodeMatched: string,
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
  ) => void;
  currency?: 'INR' | 'USD';
}

export default function EnrollmentModal({
  internship,
  currentUser,
  isOpen,
  onClose,
  onSubmitEnrollment,
  currency = 'INR',
}: Props) {
  if (!isOpen || !internship) return null;

  // State definitions matching user's spec
  const [termDuration, setTermDuration] = useState<number>(1); // default to 1 Month (4 Weeks) for the ₹209 promo
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'PAYPAL'>(currency === 'USD' ? 'PAYPAL' : 'UPI');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [referralCode, setReferralCode] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [err, setErr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom user collection states
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [education, setEducation] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(internship.title);
  const [agreedToPhases, setAgreedToPhases] = useState(false);
  const [agreedToPayment, setAgreedToPayment] = useState(false);
  const [whatsappJoined, setWhatsappJoined] = useState(false);

  // Apply discount logic: if referralCode entered is valid, give a mock discount
  const [appliedDiscount, setAppliedDiscount] = useState(false);
  
  const isUSD = paymentMode === 'PAYPAL';
  const discountAmount = isUSD ? 5 : 50; // Special discount values for affordable ₹209 base

  // Determine final price based on selected term duration & promo rules
  // If termDuration is 1 Month (4 Weeks) we override base price with the ₹209 promo code from Internpe!
  const getBasePriceDetails = () => {
    if (internship.prices && internship.prices[termDuration] !== undefined) {
      const customPrice = internship.prices[termDuration];
      return { base: customPrice, label: `${termDuration === 1 ? '1 Month (4 Weeks)' : `${termDuration} Months`} Custom Term (₹${customPrice} INR)` };
    }

    if (isUSD) {
      if (termDuration === 1) return { base: 9, label: 'Standard Promo ($9 USD)' };
      if (termDuration === 2) return { base: 29, label: '2 Months Term ($29 USD)' };
      if (termDuration === 3) return { base: 39, label: '3 Months Term ($39 USD)' };
      return { base: 49, label: '6 Months Term ($49 USD)' };
    } else {
      if (termDuration === 1) return { base: 209, label: 'Promo Registration (₹209 INR)' };
      if (termDuration === 2) return { base: 1199, label: '2 Months Term (₹1199 INR)' };
      if (termDuration === 3) return { base: 1499, label: '3 Months Term (₹1499 INR)' };
      return { base: 1999, label: '6 Months Term (₹1999 INR)' };
    }
  };

  const { base: basePrice, label: priceLabel } = getBasePriceDetails();
  const finalPrice = appliedDiscount ? Math.max(isUSD ? 5 : 100, basePrice - discountAmount) : basePrice;

  // Auto-sync domain and duration when internship changes
  useEffect(() => {
    if (internship) {
      setSelectedDomain(internship.title);
      if (internship.durationMonths) {
        setTermDuration(internship.durationMonths);
      } else {
        setTermDuration(1);
      }
    }
  }, [internship]);

  const handleApplyReferral = () => {
    if (referralCode.trim().length > 4) {
      setAppliedDiscount(true);
      setErr('');
    } else {
      setErr('Please enter a valid referral code / registered email.');
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErr('Error: Only image PNG/JPG screenshots allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshot(reader.result);
        setErr('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleJoinWhatsapp = () => {
    setWhatsappJoined(true);
    window.open('https://chat.whatsapp.com/demo-internpe-cohort', '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core requirements check
    if (!fullName.trim()) {
      setErr('Full name is required.');
      return;
    }
    if (!studentEmail.trim()) {
      setErr('Email address is required.');
      return;
    }
    if (!mobileNumber.trim()) {
      setErr('WhatsApp Mobile number is required.');
      return;
    }
    if (!education.trim()) {
      setErr('Please enter your present educational qualification.');
      return;
    }
    if (!collegeName.trim()) {
      setErr('College/University name is required.');
      return;
    }
    if (!selectedDomain.trim()) {
      setErr('Target domain is required.');
      return;
    }
    if (!agreedToPhases) {
      setErr('You must agree to the 3-Phase learning and task schedule.');
      return;
    }
    if (!agreedToPayment) {
      setErr('You must read and agree to the registration fee declaration (So, are you interested? check yes).');
      return;
    }
    if (!transactionId.trim()) {
      setErr('Transaction reference ID is required for transfer validation.');
      return;
    }
    if (!screenshot) {
      setErr('Please click or drag screenshot proof of your payment.');
      return;
    }

    // Submit payload
    onSubmitEnrollment(
      internship.id,
      transactionId.trim(),
      screenshot,
      appliedDiscount ? referralCode.trim() : '',
      termDuration,
      {
        studentName: fullName.trim(),
        studentEmail: studentEmail.trim(),
        studentPhone: mobileNumber.trim(),
        qualification: education.trim(),
        collegeName: collegeName.trim(),
        domainApplied: selectedDomain.trim(),
        agreedToPhases: true,
        agreedToPayment: true
      }
    );
    
    // reset local states
    setTransactionId('');
    setScreenshot('');
    setReferralCode('');
    setAppliedDiscount(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative text-slate-800 dark:text-slate-100 flex flex-col my-4 max-h-[92vh]">
        
        {/* Banner header wrapper */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-indigo-200 font-bold uppercase block">
              OFFICIAL STUDENT REGISTRATION PORTAL
            </span>
            <h3 className="font-extrabold text-lg mt-0.5 tracking-tight flex items-center gap-2">
              <span>INTERNPE INTERNSHIP ENROLLMENT</span>
              <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2.5 py-0.5 rounded-full font-bold">
                {termDuration === 1 ? '4 Weeks Term' : `${termDuration} Months`}
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-xl transition-all cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Split into Information and Form Input Columns with optimized responsive reordering */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 leading-relaxed">
          
          {/* ================= LEFT SIDE: BROADCAST AND PROGRAM INFORMATION ================= */}
          {/* On mobile screens, this moves below the registration form (order-2) to allow primary checkout details focus at the top */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-4 font-sans text-xs">
            
            {/* Header Identity Display */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900/40 dark:to-indigo-950/20 p-4 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-mono text-[9.5px] font-bold px-2 py-0.5 rounded shadow-sm">
                  CERTIFIED
                </span>
                <span className="font-extrabold text-[12.5px] tracking-tight text-slate-800 dark:text-white">
                  INTERNSHIP STATUS
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-auto font-mono text-[10.5px]">({termDuration === 1 ? '4 WEEKS' : `${termDuration * 4} WEEKS`})</span>
              </div>
              
              <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <p className="font-extrabold text-indigo-700 dark:text-indigo-400 text-[13px]">Welcome Interns!</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  We’re excited to welcome you at <strong>INTERNPE</strong>, a trusted, verified partner organization recognized nationwide!
                </p>
              </div>

              {/* Badges checklist */}
              <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-bold">
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 py-1.5 px-2 rounded-lg text-center border border-emerald-500/20 flex items-center justify-center gap-1">
                  ⭐️ MSME Registered
                </div>
                <div className="bg-teal-500/10 text-teal-750 dark:text-teal-400 py-1.5 px-2 rounded-lg text-center border border-teal-500/20 flex items-center justify-center gap-1">
                  ✓ AICTE Approved
                </div>
                <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-1.5 px-2 rounded-lg text-center border border-indigo-500/20 flex items-center justify-center gap-1 col-span-2">
                  🛡️ ISO 9001:2015 Certified Organization
                </div>
              </div>
            </div>

            {/* Quick Stats Blocks */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-550 dark:text-slate-400 block text-[8px] uppercase font-mono font-bold">Class Mode</span>
                <span className="font-bold text-[10.5px] block mt-0.5 text-slate-850 dark:text-slate-200">Work From Home</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-550 dark:text-slate-400 block text-[8px] uppercase font-mono font-bold">Timings</span>
                <span className="font-bold text-[10.5px] block mt-0.5 text-slate-850 dark:text-slate-200">100% Flexible</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-550 dark:text-slate-400 block text-[8px] uppercase font-mono font-bold">Duration</span>
                <span className="font-bold text-[10.5px] block mt-0.5 text-slate-850 dark:text-slate-200">
                  {termDuration === 1 ? '4 Weeks' : `${termDuration} Months`}
                </span>
              </div>
            </div>

            {/* Benefits & Deliverables list */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>🎁 Guaranteed Internship Benefits</span>
              </span>
              <ul className="space-y-2 text-[11px] font-sans text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold">📄</span>
                  <span><strong>Verified Offer Letter</strong> — Instantly prepared upon registration verification.</span>
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold">📜</span>
                  <span><strong>Verified Completion Certificate</strong> — Government-approved ISO valid anywhere.</span>
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold">🤝</span>
                  <span><strong>Weekly Meetups & Mentorship</strong> — Group Q&A sessions and doubt support.</span>
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold">🚀</span>
                  <span><strong>Skill Development</strong> — Build practical resume files & portfolios.</span>
                </li>
              </ul>
            </div>

            {/* WhatsApp Group Box */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 space-y-2 text-center">
              <div className="font-extrabold text-[12px] text-emerald-700 dark:text-emerald-400 uppercase tracking-tight flex items-center justify-center gap-1 font-mono">
                <Phone className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>JOIN WHATSAPP GROUP</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                Join our official announcements forum for quick orientation and onboarding links.
              </p>
              <button
                type="button"
                onClick={handleJoinWhatsapp}
                className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl text-[11px] font-black shadow-md shadow-emerald-650/10 transition-all flex items-center justify-center gap-1.5 hover:cursor-pointer uppercase tracking-wider"
              >
                <span>Click Here to Join Group</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              {whatsappJoined && (
                <span className="text-[9px] text-emerald-600 font-semibold block mt-1">
                  ✓ Redirected to group invitation invite in new tab
                </span>
              )}
            </div>

            {/* Phases info display in style specified */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>⚙️ 3-Phase Structured Training</span>
              </span>
              <div className="space-y-2 text-[10.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
                <p>1️⃣ <strong className="text-slate-900 dark:text-white font-bold">Phase 1: Learning Content</strong> — We provide you customized learning guidelines, templates, and easy-to-understand notes.</p>
                <p>2️⃣ <strong className="text-slate-900 dark:text-white font-bold">Phase 2: Assignments</strong> — Periodic knowledge testing quizzes (with 1-2 days buffer submission cycles).</p>
                <p>3️⃣ <strong className="text-slate-900 dark:text-white font-bold">Phase 3: Real Projects</strong> — Hands-on execution with 4 mini tasks + 1 final capstone submission.</p>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE: FORM FIELDS AND CHECKOUT STEPS ================= */}
          {/* On mobile screens, this displays at the very top (order-1) so prospective students can immediately fill details! */}
          <div className="order-1 lg:order-2 lg:col-span-7 space-y-4">
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Provide Student Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    Full Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikas@gmail.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Mobile Number / WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    Mobile Number (WhatsApp Number) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Education Qualification */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    Present Education Qualification <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Like B.Tech , BCA , BBA..."
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-705 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* College University name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    College / University Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi Technological University"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Targeting Domain Option */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300">
                    Desired Internship Domain <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Development Internship"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    title="You can customize your exact target sub-domain for the certificate"
                  />
                </div>
              </div>
            </div>

            {/* Program duration & pricing block */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <h4 className="text-xs font-semibold uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>2. Select Program Period & Verification Fee</span>
              </h4>

              {/* Helpful custom note clarifying duration options */}
              <div className="text-[10.5px] text-slate-650 dark:text-slate-300 font-sans leading-normal bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/40">
                ⭐ Preset template: <strong className="text-indigo-650 dark:text-indigo-400 font-bold">{internship.durationMonths === 1 ? '1 Month (4 Weeks)' : `${internship.durationMonths} Months`}</strong>. 
                You may choose a different period (upgrade/downgrade)—your verified certification validity and cohort project scope will automatically adapt to the selected term below.
              </div>

              {/* Duration Buttons selector and discount offer */}
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTermDuration(num)}
                    className={`py-2 px-1 font-mono text-[10.5px] font-bold rounded-lg transition-all cursor-pointer border text-center ${
                      termDuration === num
                        ? 'bg-indigo-600 text-white border-indigo-500 dark:bg-indigo-550 dark:text-white dark:border-indigo-400 font-black shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num === 1 ? '4 Weeks' : `${num} Months`}
                  </button>
                ))}
              </div>

              {/* Referral Code Field */}
              <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-sans">
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                  Referral Code / Referrer Email (Optional)
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="e.g. friend@gmail.com"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReferral}
                    className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-3.5 rounded-lg text-xs transition-all active:scale-[0.98]"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold block mt-1 animate-pulse">
                    ✓ Code Applied! Saved {isUSD ? '$5' : '₹50'} on registration fee.
                  </span>
                )}
              </div>

              {/* Total Due and payment receipt coordinates */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Custom Fee</span>
                  <span className="font-extrabold text-[15px] text-slate-900 dark:text-white">
                    {isUSD ? `$${finalPrice}` : `₹${finalPrice}`}
                  </span>
                  {termDuration === 1 && !isUSD && (
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 block font-sans font-extrabold">
                      🔥 Special Promo Rate (₹209)
                    </span>
                  )}
                </div>

                <div className="text-right text-[10px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Gateway Pool</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                    {isUSD ? 'payments@deltaclause.com' : 'deltaclause@upi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification & payment components */}
            <div className="bg-slate-550/5 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-905 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setPaymentMode('UPI'); setErr(''); }}
                  className={`py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    paymentMode === 'UPI'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>🇮🇳 UPI (₹209 Promo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMode('PAYPAL'); setErr(''); }}
                  className={`py-1.5 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    paymentMode === 'PAYPAL'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>🌎 PayPal ($9)</span>
                </button>
              </div>

              {/* UPI QR static display OR steps */}
              {paymentMode === 'UPI' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-2 text-[10px] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="sm:col-span-1 bg-slate-105 p-1.5 rounded flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                    <QrCode className="w-20 h-20 text-neutral-900" />
                    <span className="text-[7.5px] font-bold text-neutral-500 font-mono tracking-tight mt-1 leading-none uppercase">pay scan barcode</span>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 flex flex-col justify-center font-mono text-slate-800 dark:text-slate-200">
                    <p className="font-extrabold text-[10px] text-slate-900 dark:text-white font-sans uppercase">UPI Transfer Directions:</p>
                    <p>1. Transmit exactly <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-[11px]">₹{finalPrice}</span> to UPI ID: <code className="text-indigo-600 dark:text-indigo-400 font-bold bg-slate-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded select-all font-mono border border-slate-200 dark:border-slate-800">deltaclause@upi</code></p>
                    <p>2. Take screenshot of successful confirmation window.</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-slate-900 text-[10px] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-slate-850 dark:text-slate-200">
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white font-sans uppercase">PayPal Instructions:</p>
                  <p>1. Process <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-[11px]">${finalPrice} USD</span> transfer to primary recipient profile: <code className="text-emerald-600 dark:text-emerald-400 font-bold bg-slate-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded select-all font-mono border border-slate-200 dark:border-slate-800">payments@deltaclause.com</code>.</p>
                  <p>2. Keep screenshot of status proof & list Transaction Reference below.</p>
                </div>
              )}

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="block text-[10.5px] font-mono text-slate-600 dark:text-slate-300 uppercase font-bold">
                  {isUSD ? 'PayPal Transaction Reference ID' : 'UPI Reference ID / UTR / Transaction ID'} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isUSD ? "e.g. F-8472938481A" : "e.g. 12-Digit Ref ID (TXN83748293)"}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-3 py-2 text-xs font-mono placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Drop files screenshot */}
              <div className="space-y-1">
                <label className="block text-[10.5px] font-mono text-slate-600 dark:text-slate-300 uppercase font-bold">
                  Screenshot Receipt Evidence <span className="text-red-500 font-bold">*</span>
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center ${
                    dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-300 dark:border-slate-705 bg-white dark:bg-slate-900/40 hover:border-indigo-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {screenshot ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-200">
                        <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1">
                        ✓ Screenshot Loaded successfully
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">
                      Drag & drop visual proof, or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">click to select image asset</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox 1: 3-Phase agreement */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPhases}
                  onChange={(e) => setAgreedToPhases(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-[11px] block">
                    Agreed to 3-Phase Internship Deliverables *
                  </span>
                  <span className="text-[10.5px] text-slate-650 dark:text-slate-350 block leading-tight">
                    I agree to the structured learning, periodic knowledge test assignments, and miniature task project milestones (1-2 days submission block cycles).
                  </span>
                  <span className="inline-block text-[9px] bg-indigo-100 dark:bg-indigo-950 font-bold px-1.5 py-0.2 rounded text-indigo-700 dark:text-indigo-400 mt-1 uppercase">
                    ✓ YES
                  </span>
                </div>
              </label>
            </div>

            {/* Checkbox 2: Payment fee, Refund & MSME Certificates certification confirmation */}
            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl space-y-1.5 text-[10.5px] text-slate-800 dark:text-slate-200">
                <p className="leading-relaxed">
                  We charge only <strong className="text-indigo-600 dark:text-indigo-400">₹209</strong> as a registration fee for a 1-month internship (1 domain). There are no additional charges throughout the training and internship.
                </p>
                <p className="leading-relaxed">
                  You will receive government-verified certificates (MSME certified) that are valid all over India. There are No other charges for the internship or certificates beyond the one-time registration fee.
                </p>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  After successful registration, the entire internship is free of cost. Please note that the registration fee is non-refundable.
                </p>
                <div className="text-[11.5px] font-black text-rose-600 dark:text-rose-400 mt-1">
                  So, are you interested? ✅
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPayment}
                  onChange={(e) => setAgreedToPayment(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-705 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-[11px] block">
                    Confirm Interest and Registration Terms *
                  </span>
                  <span className="text-[10px] text-slate-650 dark:text-slate-300 block font-bold uppercase tracking-wide">
                    👉 yes i am interested
                  </span>
                </div>
              </label>
            </div>

            {/* Error notifications */}
            {err && (
              <p className="text-xs text-red-500 font-mono bg-red-100/30 dark:bg-red-950/20 p-2.5 rounded-xl text-center border border-red-200 dark:border-red-950 font-bold leading-normal">
                ⚠️ {err}
              </p>
            )}

            {/* Action buttons footer */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-550 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 hover:cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Enrollment & Pay Registration Fee</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 py-3 px-5 rounded-2xl text-xs font-semibold transition-all hover:cursor-pointer border border-slate-200 dark:border-neutral-700 active:scale-[0.99]"
              >
                Cancel
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
