import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ChevronDown, CreditCard, BookOpen, Award, Zap, 
  HelpCircle, Sparkles, MessageSquare, LifeBuoy, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
}

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: 'CreditCard' | 'BookOpen' | 'Award' | 'Zap' | 'HelpCircle';
  items: FAQItem[];
}

// Structured constant containing the complete FAQ repository
const FAQ_DATABASE: FAQCategory[] = [
  {
    id: 'enrollment',
    title: 'Admissions & Payments',
    description: 'Tutition, UPI transactions, visual screenshots, and refund guidelines.',
    icon: 'CreditCard',
    items: [
      {
        id: 'pay-1',
        question: 'How is the enrollment tuition processed on DeltaClause?',
        answer: 'Training courses have a standardized tuition of ₹1499. You can process your payment via any dynamic UPI app. Once completed, take a clear screenshot of the payment receipt, note the UPI Transaction ID (or UTR), and upload it through our Enrollment slider. The Admissions Desk reviews and approves enrollments securely.',
        tags: ['Tuition', 'UPI', 'UTR ID', 'Admission']
      },
      {
        id: 'pay-2',
        question: 'How long does payment and application verification take?',
        answer: 'The admissions desk generally verifies all screenshot submissions and UPI transaction numbers within 2 to 4 hours. Once verified, your status immediately transitions from "Pending Screenshot Review" to "Enrolled", unlocking instant access to course material.',
        tags: ['Processing Time', 'Verification', 'Pending State']
      },
      {
        id: 'pay-3',
        question: 'What is the Tuition Refund Policy and refund threshold?',
        answer: 'Students can self-trigger a complete refund if it is within the specified Refund Threshold days (set by administrators, e.g. 7 days) from the payment approval date. Clicking "Request Tuition Refund" instantly registers your application; ₹1499 is reimbursed back to your original UPI payment handle, and enrollment access is safely revoked.',
        tags: ['Refund', 'UPI Return', 'Threshold Reset']
      }
    ]
  },
  {
    id: 'coursework',
    title: 'Milestones & Task Sheets',
    description: 'PDF uploading limits, instructor marking metrics, and submission feedback.',
    icon: 'BookOpen',
    items: [
      {
        id: 'task-1',
        question: 'How do I submit my coursework and project files?',
        answer: 'Course milestones require submitting compiled task sheets in PDF format. Navigate to your specific training page, click "Submit Task Sheet", and upload a file. The system enforces a file limit of 6MB to prevent corrupted streams and save database resources.',
        tags: ['PDF Upload', '6MB Limit', 'Submissions']
      },
      {
        id: 'task-2',
        question: 'What do different status tags on my submissions represent?',
        answer: 'Submissions hold three major states: "Under Review" means your instructor has it queued; "Changes Requested" points to specific adjustments needed (e.g., missing code logs or faulty screenshots); and "Approved" signals graduation clearance, awarding 🪙 500 bonus points.',
        tags: ['Milestone States', 'Approved', 'Feedback']
      },
      {
        id: 'task-3',
        question: 'What should I do if my task sheet status details a "Changes Requested" reject?',
        answer: 'Do not panic. Analyze the feedback log comments listed under your training dashboard. Adjust your work, compile a brand new PDF, and click "Re-submit" to upload the revised file. Re-submitted items are marked high-priority in the instructor grading queue.',
        tags: ['Reject Loop', 'Corrections', 'Resubmissions']
      }
    ]
  },
  {
    id: 'credentials',
    title: 'Certificates & Verify Desk',
    description: 'Tamper-proof credential verify lookup codes and printing settings.',
    icon: 'Award',
    items: [
      {
        id: 'cert-1',
        question: 'Where can I find and download my official graduation verification?',
        answer: 'Once your final milestone is marked "Approved" by instructors, an official certificate is automatically compiled. You can access it securely from your "My Progress" tab under "Secured Credentials". You can view, print, or download a high-contrast copy.',
        tags: ['Graduation', 'Credentials', 'PDF Print']
      },
      {
        id: 'cert-2',
        question: 'How does anyone verify the authenticity of a DeltaClause Certificate?',
        answer: 'Every graduation certificate possesses a unique, tamper-proof ID (e.g. DC-12948-X). Users and employers can input this ID into our global "Verify Certificate" tab. The system pulls absolute cryptographic evidence from our system registers to certify training authenticity.',
        tags: ['Security Code', 'Auth Verification', 'Employer Lookup']
      },
      {
        id: 'cert-3',
        question: 'Can I change my name printed on the graduation credential?',
        answer: 'Certificates are stamped permanently using the precise profile name in your DeltaClause database. Ensure your full legal name is spelled accurately in your settings before applying or submitting the final milestone to avoid credential re-issuance delays.',
        tags: ['Correct Name', 'Legal Name', 'Settings']
      }
    ]
  },
  {
    id: 'points',
    title: 'Leaderboard & Multipliers',
    description: 'How to acquire Delta points, boost ranks, and secure active referrals.',
    icon: 'Zap',
    items: [
      {
        id: 'point-1',
        question: 'How are Delta Points (Pts) calculated and tracked?',
        answer: 'Point accumulation is fully gamified! You earn 🪙 +500 Pts for every approved milestone completion, +300 Pts for completing simulated production downtime outages under the incident playground, and +150 Pts for successful peer referrals who register on the system.',
        tags: ['Gamification', 'Pts Multiplier', 'Milestones Score']
      },
      {
        id: 'point-2',
        question: 'What is the referral program and how do I benefit?',
        answer: 'Inside your student dashboard, access your unique delta referral link. When friends or peers enroll using your link, they receive an immediate entry credit, and you are awarded +150 points once their UPI screenshot is verified and approved by admins.',
        tags: ['Sharing Link', 'Reward points', 'Referrals']
      },
      {
        id: 'point-3',
        question: 'Does the application support real-time score updates?',
        answer: 'Yes! All local point transformations are immediately updated inside the global Leaderboard tab. Your rank, avatar, completed count, and total accumulated score dynamically refresh to display your standing.',
        tags: ['Standings', 'Global Board', 'Sync']
      }
    ]
  },
  {
    id: 'incidents',
    title: 'Emergency Playroom Outages',
    description: 'Diagnostics sandbox simulations and how they affect student standing.',
    icon: 'HelpCircle',
    items: [
      {
        id: 'incident-1',
        question: 'What is the role of the Production Incident Sandbox?',
        answer: 'This is an interactive simulation chamber that mock-recreates real server incidents, network failures, or security breaches. It allows students to experience DevOps-style system emergency responses, testing real decision-making skills under stress.',
        tags: ['Downtime Playground', 'Diagnostics', 'Sandbox Game']
      },
      {
        id: 'incident-2',
        question: 'How do sandbox challenges influence my scores?',
        answer: 'Successful resolution of sandbox incidents, keeping infrastructure sanity and user influence values elevated, triggers immediate system achievements. Solving outages grants up to +300 points, boosting your rank ahead of peers on the global board.',
        tags: ['DevOps stood', 'Practical points', 'Incidents score']
      }
    ]
  }
];

interface InformationCenterProps {
  onSuggestHelp?: () => void;
  currentUser?: { name: string; email: string; role: string; points: number } | null;
  onOpenSupportTicket?: () => void;
}

export default function InformationCenter({ onSuggestHelp, currentUser, onOpenSupportTicket }: InformationCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Filter FAQs based on category and search query
  const filteredFAQs = useMemo(() => {
    return FAQ_DATABASE.map(cat => {
      // Filter items within category
      const matchedItems = cat.items.filter(item => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        return (
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query) ||
          item.tags?.some(t => t.toLowerCase().includes(query))
        );
      });

      return {
        ...cat,
        items: matchedItems
      };
    }).filter(cat => {
      // Keep category if it matches selected filter AND has matched items
      if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
        return false;
      }
      return cat.items.length > 0;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (faqId: string) => {
    setExpandedFaqId(prev => (prev === faqId ? null : faqId));
  };

  const quickSearches = ['₹1499', 'Verify', 'Refund', '6MB'];

  // Map icon component strings to Lucide icon elements
  const renderCategoryIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'HelpCircle':
      default:
        return <HelpCircle className={className} />;
    }
  };

  return (
    <div id="faq-information-center" className="space-y-8 max-w-4xl mx-auto">
      
      {/* HEADER SECTION WITH HERO */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 md:p-10 text-white relative overflow-hidden border border-indigo-500/20 shadow-xl shadow-indigo-950/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-200 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>DeltaClause Helpdesk & Knowledge</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans tracking-tight font-extrabold leading-tight">
            How can we support <br className="hidden sm:inline" />
            your learning today?
          </h1>
          <p className="text-sm text-indigo-150/80 max-w-xl font-sans leading-relaxed">
            Search 15+ answered administrative topics, technical milestone constraints, points systems, and sandbox troubleshooting guidelines instantly.
          </p>

          {/* SEARCH COMPONENT */}
          <div className="pt-2">
            <div className="relative max-w-2xl">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-300">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries, refund policies, file size parameters..."
                className="w-full bg-white/15 dark:bg-black/40 text-white placeholder-indigo-200/50 border border-indigo-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-200 hover:text-white text-xs font-mono font-bold"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Quick tags suggestions */}
            <div className="flex items-center gap-2 mt-3 p-1 text-xs text-indigo-200/70">
              <span className="font-mono">Common:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="bg-indigo-400/10 hover:bg-indigo-400/20 border border-indigo-400/20 text-indigo-200 font-mono px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & CATEGORY TABS */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          All Topics
        </button>
        {FAQ_DATABASE.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-xs font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Accordion List Container */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/60 text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/10 rounded-full text-rose-500">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-sans font-extrabold text-slate-800 dark:text-slate-100">
                No matching answers found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any answers fitting &quot;<span className="font-mono text-indigo-500 font-bold">{searchQuery}</span>&quot;. Try refining your query, checking spelling, or resetting filters.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset parameters & show all FAQs
                </button>
              </div>
            </motion.div>
          ) : (
            filteredFAQs.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm"
              >
                {/* Category Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40 flex items-start gap-4">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h2 className="text-sm font-sans tracking-tight font-extrabold text-slate-800 dark:text-slate-100">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* FAQ List Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {cat.items.map((item) => {
                    const isExpanded = expandedFaqId === item.id;
                    return (
                      <div key={item.id} className="transition-all hover:bg-slate-50/[0.2] dark:hover:bg-slate-950/[0.15]">
                        <button
                          onClick={() => toggleAccordion(item.id)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer outline-none select-none group"
                        >
                          <span className="text-[13px] sm:text-sm font-sans font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.question}
                          </span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="text-slate-400 dark:text-slate-500"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/20"
                            >
                              <div className="px-5 pb-5 pt-1 space-y-3">
                                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                                  {item.answer}
                                </p>
                                
                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {item.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] font-semibold uppercase px-2 py-0.5 rounded"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* REDUCE SYSTEM TICKETS HELP BOX */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4 text-indigo-500" />
            <span>Still Need Support?</span>
          </div>
          <h3 className="text-base font-sans font-extrabold text-slate-800 dark:text-slate-100">
            Can&apos;t find an answer to your query?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
            By searching this offline information system before lodging, we can ensure instant support responses and keep ticketing queues lightweight for critical situations.
          </p>
        </div>

        <button
          onClick={onOpenSupportTicket}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider select-none cursor-pointer hover:shadow-lg hover:shadow-indigo-600/10 transition-all border border-transparent shadow-sm whitespace-nowrap"
        >
          <span>Open Support Ticket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK SYSTEM STATUS GRAPHICS */}
      <div className="text-center font-mono text-[10px] text-slate-400/80 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
        <span>DeltaClause Helpdesk Engine v1.0.1 • Database offline sync enabled</span>
      </div>

    </div>
  );
}
