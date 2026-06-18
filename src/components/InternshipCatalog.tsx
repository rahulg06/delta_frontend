/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Internship, Enrollment, User } from '../types';
import { BookOpen, Calendar, IndianRupee, Cpu, ArrowUpRight, CheckCircle2, RefreshCw, Sparkles, Plus, Edit2, Trash2, Youtube, Instagram, MessageSquare, Users } from 'lucide-react';

interface Props {
  internships: Internship[];
  enrollments: Enrollment[];
  currentUser: User | null;
  onEnrollClick: (internship: Internship) => void;
  // Admin triggers if current user is Admin
  isAdminMode: boolean;
  onAddInternship?: () => void;
  onEditInternship?: (internship: Internship) => void;
  onDeleteInternship?: (id: string) => void;
}

export default function InternshipCatalog({
  internships,
  enrollments,
  currentUser,
  onEnrollClick,
  isAdminMode,
  onAddInternship,
  onEditInternship,
  onDeleteInternship,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // Interactive community engagement upvote state
  const [socialEngagement, setSocialEngagement] = useState({
    whatsapp: 1480,
    youtube: 3120,
    instagram: 2150
  });

  const handleSocialUpvote = (e: React.MouseEvent, platform: 'whatsapp' | 'youtube' | 'instagram') => {
    e.preventDefault();
    e.stopPropagation();
    setSocialEngagement(prev => ({
      ...prev,
      [platform]: prev[platform] + 1
    }));
  };

  const durationFilteredInternships = internships.filter(
    (i) => selectedDuration === null || i.durationMonths === selectedDuration
  );

  const categories = ['All', ...Array.from(new Set(durationFilteredInternships.map((i) => i.category)))];

  const filteredInternships = durationFilteredInternships.filter(
    (i) => selectedCategory === 'All' || i.category === selectedCategory
  );

  // Determine current enrollment status of this internship for active student
  const getEnrollmentStatusForUser = (internshipId: string) => {
    if (!currentUser) return null;
    const userEnrollments = enrollments.filter(
      (e) => e.internshipId === internshipId && e.studentEmail === currentUser.email
    );

    if (userEnrollments.length === 0) return null;

    // Check if there is an unresolved attempt (active, submitted, payment_pending, redo)
    const activeAttempt = userEnrollments.find((e) =>
      ['active', 'submitted', 'payment_pending', 'redo'].includes(e.status)
    );

    if (activeAttempt) {
      return {
        status: activeAttempt.status,
        text: 
          activeAttempt.status === 'payment_pending' ? 'Approval Pending' :
          activeAttempt.status === 'active' ? 'Active Internship' :
          activeAttempt.status === 'submitted' ? 'Grading Pending' : 'Action Required (Redo)',
        style: 
          activeAttempt.status === 'payment_pending' ? 'bg-amber-100/60 dark:bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20' :
          activeAttempt.status === 'active' ? 'bg-indigo-100/50 dark:bg-indigo-500/11 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/15' :
          activeAttempt.status === 'submitted' ? 'bg-violet-105 dark:bg-violet-500/15 text-violet-650 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20' :
          'bg-orange-105 dark:bg-orange-500/15 text-orange-655 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20',
        canReEnroll: false,
      };
    }

    // Otherwise, previous attempt was completed/failed/payment_rejected/expired, so they CAN re-enroll!
    const resolvedAttempt = userEnrollments[userEnrollments.length - 1];
    return {
      status: resolvedAttempt.status,
      text: 
        resolvedAttempt.status === 'completed' ? 'Graduated (Completed)' :
        resolvedAttempt.status === 'expired' ? 'Attempt Expired' : 'Attempt Rejected/Failed',
      style: 
        resolvedAttempt.status === 'completed' ? 'bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
        'bg-red-100/60 dark:bg-red-500/10 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-500/20',
      canReEnroll: true, // Standard multi attempt allowed because previous attempt ended!
    };
  };

  return (
    <div id="internship-catalog-workspace" className="space-y-8 font-sans">
      
      {/* Onboarding block if no duration is selected yet (for non-admin students) */}
      {selectedDuration === null && !isAdminMode ? (
        <div id="duration-onboarding-panel" className="bg-slate-50/65 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-10 rounded-2xl sm:rounded-3xl text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto shadow-sm animate-fade-in">
          <div className="space-y-2.5">
            <span className="text-[9.5px] sm:text-[11px] font-mono tracking-widest text-indigo-700 dark:text-indigo-400 font-extrabold uppercase block select-none">
              STEP 1: SELECT YOUR ACADEMIC INTERNSHIP TERM
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight px-1">
              Select Your Preferred Internship Tenure Duration
            </h3>
            <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-1">
              Deltaclause structured practical internship programs correspond to specific term periods. Select your duration to unlock matching, industry-aligned project sheets and deliverables:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            {/* 1 Month Option */}
            <button
              type="button"
              onClick={() => setSelectedDuration(1)}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all text-left flex flex-col justify-between hover:-translate-y-1 group cursor-pointer animate-fade-in"
            >
              <div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-lg">
                  🌱
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mt-3 sm:mt-4 group-hover:text-indigo-650 dark:group-hover:text-indigo-450 transition-colors">
                  1 Month Internship
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2.5 leading-relaxed">
                  Ideal for students seeking rapid domain exposure, key UI builds, and fast-track 1-month core certifications.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-4 sm:mt-6 block font-mono">
                Explore 1-Month paths &rarr;
              </span>
            </button>

            {/* 2 Months Option */}
            <button
              type="button"
              onClick={() => setSelectedDuration(2)}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all text-left flex flex-col justify-between hover:-translate-y-1 group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-lg">
                  ⏱️
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mt-3 sm:mt-4 group-hover:text-indigo-650 dark:group-hover:text-indigo-455 transition-colors">
                  2 Months Internship
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2.5 leading-relaxed">
                  Ideal for students seeking essential web engineering exposure, custom UI bento modules, and rapid 2-month certifications.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-4 sm:mt-6 block font-mono">
                Explore 2-Month paths &rarr;
              </span>
            </button>

            {/* 3 Months Option */}
            <button
              type="button"
              onClick={() => setSelectedDuration(3)}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all text-left flex flex-col justify-between hover:-translate-y-1 group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-lg">
                  ⚙️
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mt-3 sm:mt-4 group-hover:text-indigo-650 dark:group-hover:text-indigo-450 transition-colors">
                  3 Months Internship
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2.5 leading-relaxed">
                  Focuses on advanced backend, JWT/OAuth authentication systems, microservices architectures, and 3-month specialised modules.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-4 sm:mt-6 block font-mono">
                Explore 3-Month paths &rarr;
              </span>
            </button>

            {/* 6 Months Option */}
            <button
              type="button"
              onClick={() => setSelectedDuration(6)}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all text-left flex flex-col justify-between hover:-translate-y-1 group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-lg">
                  🚀
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mt-3 sm:mt-4 group-hover:text-indigo-650 dark:group-hover:text-indigo-455 transition-colors">
                  6 Months Internship
                </h4>
                <p className="text-[11px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2.5 leading-relaxed">
                  Full specialist track. Highly comprehensive 6-month portfolio program featuring scalable data pipelines, data science models, and mentorship.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-4 sm:mt-6 block font-mono">
                Explore 6-Month paths &rarr;
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Active selection info bar */}
          {selectedDuration !== null && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 bg-indigo-500/5 dark:bg-indigo-950/15 border border-indigo-500/15 rounded-2xl gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-550 dark:bg-indigo-450 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  CURRENT FILTER: Showing available <span className="text-indigo-600 dark:text-indigo-400 underline font-black">{selectedDuration} Months</span> internship programs.
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedDuration(null); setSelectedCategory('All'); }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-450 hover:text-indigo-550 dark:hover:text-indigo-305 transition-colors text-left"
              >
                &larr; Show All Tenure Options
              </button>
            </div>
          )}

          {/* Quick filter tabs inside the catalog program */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100/50 dark:border-slate-850/60 pt-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 uppercase block font-bold">Filter by Tech Domain</span>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold font-mono transition-all border cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-550 shadow-md'
                        : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
                     {/* Quick adjust duration term trigger */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 uppercase block font-bold">Quick Term Switcher</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setSelectedDuration(null); setSelectedCategory('All'); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    selectedDuration === null ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All Terms
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedDuration(1); setSelectedCategory('All'); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    selectedDuration === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-955 text-slate-500 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  1M Term
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedDuration(2); setSelectedCategory('All'); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    selectedDuration === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-955 text-slate-500 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  2M Term
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedDuration(3); setSelectedCategory('All'); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    selectedDuration === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-955 text-slate-500 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  3M Term
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedDuration(6); setSelectedCategory('All'); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    selectedDuration === 6 ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-955 text-slate-550 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  6M Term
                </button>
              </div>
            </div>     </div>

            {/* Create new internship listing in Catalog */}
            {isAdminMode && onAddInternship && (
              <button
                onClick={onAddInternship}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-550 text-white font-semibold py-2.5 px-4.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-indigo-500 cursor-pointer shadow-sm transition-colors self-end"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Internship</span>
              </button>
            )}
          </div>

          {/* Internships List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInternships.map((internship, idx) => {
          const enrollState = getEnrollmentStatusForUser(internship.id);
          const needsLock = enrollState && !enrollState.canReEnroll;

          return (
            <div
              key={internship.id}
              id={`internship-card-${idx}`}
              className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 hover:shadow-md transition-all duration-300 relative overflow-hidden group shadow-sm text-slate-900 dark:text-slate-100"
            >
              {/* Background gradient embellishment */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

              <div>
                {/* Category & Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/15 border border-indigo-200/50 dark:border-indigo-400/20 px-2.5 rounded-md py-0.5 uppercase tracking-wider font-bold">
                    {internship.category}
                  </span>

                  {/* Enrollment Status Indicator for Students */}
                  {currentUser && enrollState && (
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md ${enrollState.style}`}>
                      {enrollState.text}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {internship.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {internship.description}
                </p>

                {/* Information Pills */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-slate-950 p-1.5 px-3 rounded-lg border border-slate-200 dark:border-neutral-800">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-mono font-medium">{internship.durationMonths} {internship.durationMonths === 1 ? 'Month' : 'Months'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-slate-950 p-1.5 px-3 rounded-lg border border-slate-200 dark:border-neutral-800">
                    <IndianRupee className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-mono font-bold text-slate-900 dark:text-neutral-100 font-bold">₹{internship.price}</span>
                  </div>
                </div>
              </div>

              {/* Pricing, Edit tools and Application CTA button */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-4 font-sans">
                
                {/* Admin Management Tools */}
                {isAdminMode ? (
                  <div className="flex items-center gap-2">
                    {onEditInternship && (
                      <button
                        onClick={() => onEditInternship(internship)}
                        className="p-1 px-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700/65 rounded-xl transition-all font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDeleteInternship && (
                      <button
                        onClick={() => onDeleteInternship(internship.id)}
                        className="p-1 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-650 hover:text-white text-red-600 dark:text-red-400 border border-red-200 dark:border-red-950/40 rounded-xl transition-all font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
                    Enrolled: <span className="text-slate-600 dark:text-neutral-300 font-bold">{internship.enrolledCount} Students</span>
                  </div>
                )}

                {/* Enroll / Action Trigger (Only for Student Mode) */}
                {!isAdminMode && (
                  <div>
                    {needsLock ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono italic">Attempt Active</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onEnrollClick(internship)}
                        className={`bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 ${
                          enrollState?.canReEnroll ? 'bg-cyan-600 hover:bg-cyan-500' : ''
                        }`}
                      >
                        {enrollState?.canReEnroll ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>Re-Enroll Attempt</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Enroll Now &rarr;</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      </div>
      )}

      {/* Interactive Social Media Community Bento Section */}
      <section className="mt-16 pt-10 border-t border-slate-200/80 dark:border-slate-800/80 space-y-8 select-none">
        <div className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/30 dark:border-indigo-900/40 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-400 uppercase">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            <span>Official Candidate Support Ecosystem</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Connect, Learn & Grow with Cohorts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Ready to scale your software engineering career? Click to join our dynamic interactive channels for instant project doubts, tech reels, solution guides, and free cohort resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp Group */}
          <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between animate-fade-in">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-650 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-bold px-2 rounded-md py-0.5 border border-emerald-500/20">
                  <Users className="w-2.5 h-2.5 inline-block" />
                  <span>18.4K members</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  WhatsApp Support Circle
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
                  Our core hub for immediate student peer-to-peer discussions, team sprint coordination, task-sheet query resolution, and live announcement updates.
                </p>
              </div>

              {/* Dynamic Interactive Counter Area */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-105 dark:border-slate-850 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Trainee Hearts:</span>
                <button
                  onClick={(e) => handleSocialUpvote(e, 'whatsapp')}
                  className="flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg text-emerald-650 dark:text-emerald-400 transition-all text-[10px] font-bold cursor-pointer"
                  title="Show love for this group!"
                >
                  ❤️ {socialEngagement.whatsapp}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-850/60 mt-6 select-text">
              <a 
                href="https://chat.whatsapp.com/GzCisT7B3Ww92uX5deltacl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-md shadow-emerald-500/10 cursor-pointer text-center no-underline whitespace-nowrap"
              >
                <span>Join Official WhatsApp Group</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: YouTube Channel */}
          <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 dark:hover:border-red-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 dark:bg-red-500/2 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-400 group-hover:scale-105 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 bg-red-500/10 text-red-700 dark:text-red-400 font-mono text-[9px] font-bold px-2 rounded-md py-0.5 border border-red-500/20">
                  <span>🎥 34.2K subscribers</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Deltaclause Learning Desk
                  <span className="text-[10px] font-bold font-mono text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 rounded uppercase">Official</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
                  Subscribe to our premium catalog. Broaden your stack with full solution tutorials, architectural guidance, sandbox set up walkthroughs, and resume reviews.
                </p>
              </div>

              {/* Dynamic Interactive Counter Area */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-105 dark:border-slate-850 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Subscribed Hearts:</span>
                <button
                  onClick={(e) => handleSocialUpvote(e, 'youtube')}
                  className="flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg text-red-650 dark:text-red-400 transition-all text-[10px] font-bold cursor-pointer"
                  title="Subscribe upvotes!"
                >
                  ❤️ {socialEngagement.youtube}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-850/60 mt-6 select-text">
              <a 
                href="https://youtube.com/@deltaclause_hq" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-md shadow-red-500/10 cursor-pointer text-center no-underline whitespace-nowrap"
              >
                <span>Subscribe on YouTube</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Instagram Feed */}
          <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 dark:hover:border-pink-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 dark:bg-pink-500/2 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-2xl border border-pink-100 dark:border-pink-905 text-pink-650 dark:text-pink-400 group-hover:scale-105 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-700 dark:text-pink-400 font-mono text-[9px] font-bold px-2 rounded-md py-0.5 border border-pink-500/20">
                  <span>📸 12.9K followers</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Deltaclause Tech Insights
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Feed</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
                  Follow us for instant tech byte reels, team work culture highlights, candidate success spotlights, cohort group photos, and ceremony video reels.
                </p>
              </div>

              {/* Dynamic Interactive Counter Area */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-105 dark:border-slate-850 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Follower Hearts:</span>
                <button
                  onClick={(e) => handleSocialUpvote(e, 'instagram')}
                  className="flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg text-pink-650 dark:text-pink-400 transition-all text-[10px] font-bold cursor-pointer"
                  title="Follow upvotes!"
                >
                  ❤️ {socialEngagement.instagram}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-850/60 mt-6 select-text">
              <a 
                href="https://instagram.com/deltaclause_educational" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-md shadow-pink-500/10 cursor-pointer text-center no-underline whitespace-nowrap"
              >
                <span>Follow Instagram Handle</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
