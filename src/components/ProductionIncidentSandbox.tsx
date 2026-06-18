import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Check, Copy, RotateCcw, Send, Linkedin, Cpu, 
  ShieldCheck, Terminal, Coffee, Zap, Heart, RefreshCw, ArrowRight, TrendingUp, AlertTriangle
} from 'lucide-react';
import { User as AppUser } from '../types';

interface Props {
  currentUser: AppUser | null;
}

interface Scenario {
  id: number;
  title: string;
  character: string;
  avatar: string;
  text: string;
  options: Array<{
    label: string;
    description: string;
    impact: { sanity: number; influence: number; favor: number; caffeine: number };
    consequence: string;
  }>;
}

const SURVIVAL_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Monday 9:02 AM - The Sudden Calendar Hijack 📅",
    character: "The Alignment Coordinator",
    avatar: "👔",
    text: "Your inbox flashes with a priority meeting invite: 'Sync with core cross-functional alignment stakeholders.' It has no description, is scheduled for 90 minutes, conflicts with your actual productive focus time, and includes 24 attendees.",
    options: [
      {
        label: "Accept with camera 'on' and nod dynamically",
        description: "Join the call, paste a standard background, and nod productively at 5-second intervals while secretly browsing memes or writing real code on your second screen.",
        impact: { sanity: -15, influence: +10, favor: +20, caffeine: -20 },
        consequence: "Your manager labels you an 'active synergistic collaborator.' Your neck muscles slightly burn from the physical efforts of simulated nodding."
      },
      {
        label: "Decline directly and set a 'Monk Focus Mode' emoji 🧘",
        description: "Decline with a system note stating: 'Protecting calendars for high-impact task resolution.' Change your Slack status to offline with a focused timer.",
        impact: { sanity: +25, influence: -10, favor: -20, caffeine: +10 },
        consequence: "Absolute tranquility is secured. However, a small red indicator registers in HR's informal database regarding your willingness to sync."
      },
      {
        label: "Request an asynchronous brief and action plan first",
        description: "Write back in a public thread: 'Suggesting we first outline asynchronous agendas to respect everyone's focus bandwidth and drive team velocity.'",
        impact: { sanity: +10, influence: +20, favor: +10, caffeine: +5 },
        consequence: "You sound incredibly intellectual. Intimidated by your strategic framework, your manager converts the meeting to a quick voluntary chat."
      }
    ]
  },
  {
    id: 2,
    title: "Wednesday 2:15 PM - The Slack Breakroom Stampede 🍩",
    character: "The Office Treat Alert",
    avatar: "📢",
    text: "An automated Slack notification chimes in the #general-chatter channel: 'ALERT! Direct deliveries are here. Fresh hot chocolate-glazed donuts and spicy loaded corporate pizza slices in the breakroom!'",
    options: [
      {
        label: "Drop your task instantly and sprint down the hall",
        description: "Perform physical maneuvers down the carpeted path, overtake the marketing coordinator, and secure the final premium cream-filled donut.",
        impact: { sanity: +20, influence: -5, favor: +10, caffeine: +15 },
        consequence: "Total culinary gratification! Your glucose levels are peaked, although you made direct, chewing eye contact with the VP of Operations while doing so."
      },
      {
        label: "Politely ignore the alert and drink room-temperature filter water",
        description: "Maintain peak productivity posture. Sip pure hydrogen-oxygen compounds from your reusable corporate flask with philosophical composure.",
        impact: { sanity: -15, influence: +15, favor: 0, caffeine: -10 },
        consequence: "You feel spiritually superior, but now you hear the loud joyous laughter from the hallway and your stomach is growling intensely."
      },
      {
        label: "Request a teammate via DM to salvage you an asset",
        description: "Ping your teammate: 'Hey, trapped in dynamic workspace loops - could you lock down a pizza slice on my behalf for collaboration credits?'",
        impact: { sanity: +10, influence: +10, favor: +20, caffeine: +5 },
        consequence: "Perfect diplomacy. Your coworker delivers a slightly squashed slice of pepperoni straight to your desk. Multi-tier trust is established!"
      }
    ]
  },
  {
    id: 3,
    title: "Thursday 4:51 PM - The 'Quick release' Glitch Panic 🚨",
    character: "The Hyperventilating Teammate",
    avatar: "💻",
    text: "A cosmetic glitch is discovered on a test environment demo. Although customers have not reported any issues, your energetic coworker starts pinging: 'Urgent release war-room call initiated! Everyone hop in to inspect log files!'",
    options: [
      {
        label: "Dive directly into the fire and pass the espresso",
        description: "Cancel your gym or social plans, order a heavy double-shot beverage, join the war room, and spend 4 hours debugging lines of code.",
        impact: { sanity: -35, influence: +30, favor: +25, caffeine: +30 },
        consequence: "You successfully commented out the broken tag! You receive a virtual star on Slack, but you missed dinner and your left eye has a twitch."
      },
      {
        label: "Set your presence to 'Commuting (Offline)' and log off",
        description: "Quickly slide your laptop lid shut. It is close to 5:00 PM; if asked tomorrow, you were already in an area with poor tunnel network signals.",
        impact: { sanity: +35, influence: -15, favor: -10, caffeine: -15 },
        consequence: "Pristine mental health preserved. The issue is resolved by someone else in 20 minutes anyway. You enjoy a gorgeous evening offline."
      },
      {
        label: "Intervene with statistics and suggest a tomorrow fix",
        description: "Write in the channel: 'Great find! Since this does not impact core production databases, let's log a ticket and triage it tomorrow morning.'",
        impact: { sanity: +15, influence: +20, favor: +15, caffeine: 0 },
        consequence: "A stroke of absolute leadership! You singlehandedly stopped the panic, saved everyone's evening, and looked incredibly mature."
      }
    ]
  },
  {
    id: 4,
    title: "Friday 11:30 AM - The Hyperbolic Influencer Post ✍️",
    character: "The Corporate LinkedIn Star",
    avatar: "🤳",
    text: "Your colleague uploads an incredibly dramatic post: 'Today, after compiling code for 22 consecutive hours, I've realized software development is not a job - it is a spiritual romance with server nodes. I'm thankful! 🙏 #Hustle #GrowthMindset'",
    options: [
      {
        label: "Like, share, and append a highly supportive quote",
        description: "Repost with the statement: 'Spoken like a champion! Pleased to brainstorm key-results alongside this technical philosopher!'",
        impact: { sanity: -20, influence: +25, favor: +25, caffeine: -5 },
        consequence: "Your profile traffic spikes by 35%. Recruiters notice your synergistic traits. Your personal self-critic has some minor regrets."
      },
      {
        label: "Roast the post privately in a secret group chat",
        description: "Copy paste the URL link to a private chat with trusted friends to share some sarcastic jokes, while choosing 'mute author' on the feed.",
        impact: { sanity: +25, influence: 0, favor: -5, caffeine: 0 },
        consequence: "Genuine laughter with real coworkers keeps your soul completely functional, avoiding public algorithm clutter entirely."
      },
      {
        label: "Leave a witty, slightly satirical counter-comment",
        description: "Comment publicly: 'Superb dedication! Did you check if your sleep cycle had memory leak closures?' adding a cheeky coffee emoji.",
        impact: { sanity: +10, influence: +15, favor: -10, caffeine: +5 },
        consequence: "Your comment gains 18 likes from fellow developers. The original poster chooses to ignore it, but your peer respect index grows."
      }
    ]
  },
  {
    id: 5,
    title: "Friday 4:54 PM - The Friendly 'Quick Huddle' ping 📞",
    character: "The Last-Minute Stakeholder",
    avatar: "🎯",
    text: "You are packing your bag when a message from a director lights up your monitor screen: 'Hey! Got a quick minute for a quick huddle to review resource parameters for next quarter?' Your weekend train departs in 15 minutes.",
    options: [
      {
        label: "Agree, join the call, and miss your actual transit",
        description: "Join the call, get trapped in a 40-minute debate regarding cell color gradients, and reschedule your travel reservation.",
        impact: { sanity: -30, influence: +15, favor: +20, caffeine: -10 },
        consequence: "You are labeled an 'indispensable advisor' by high-tier leadership, at the physical cost of sitting on a cold secondary train seat."
      },
      {
        label: "Deliver a highly enthusiastic, asynchronous counter-proposal",
        description: "Reply instantly: 'Super excited to align! On my way out to catch a train. Drop the draft here and I'll audit it first thing Monday!'",
        impact: { sanity: +30, influence: +20, favor: +15, caffeine: +5 },
        consequence: "Flawless boundary enforcement. You appear incredibly enthusiastic, professional, yet completely unavailable for Friday chaos."
      },
      {
        label: "Close the laptop lid and activate your out-of-office autoreply",
        description: "Quietly shut your device. Any questions can be filed under 'browser push-notification delay limits' during the next morning standup.",
        impact: { sanity: +25, influence: -5, favor: -15, caffeine: 0 },
        consequence: "You start your weekend with absolute energy, although you spend 10 minutes on Sunday evening wondering if the manager is annoyed."
      }
    ]
  }
];

export default function ProductionIncidentSandbox({ currentUser }: Props) {
  const [phase, setPhase] = useState<'welcome' | 'playing' | 'grading' | 'certificate'>('welcome');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userChoices, setUserChoices] = useState<Record<number, number>>({});

  const diagnosticsTimerRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (diagnosticsTimerRef.current) {
        clearInterval(diagnosticsTimerRef.current);
      }
    };
  }, []);

  // Core Real-time Playroom Dials
  const [sanity, setSanity] = useState<number>(80);
  const [influence, setInfluence] = useState<number>(50);
  const [favor, setFavor] = useState<number>(50);
  const [caffeine, setCaffeine] = useState<number>(60);

  // Live humerous event ticker
  const [tickerLogs, setTickerLogs] = useState<string[]>([
    "📂 [SYSTEM]: Career survival model booted in preview sandbox.",
    "☕ [HEALTH]: Caffeine levels calculated at medium priority. Standby for Monday."
  ]);

  // Personalized branding factors
  const [playerName, setPlayerName] = useState<string>(currentUser?.name || '');
  const [professionalTag, setProfessionalTag] = useState<string>('Aspiring Software Engineer');
  const [careerPath, setCareerPath] = useState<string>('Full-Stack Development');
  const [customVibe, setCustomVibe] = useState<string>('Stealth Performer');

  // Interactive share feedback handles
  const [copyCodeStatus, setCopyCodeStatus] = useState<boolean>(false);
  const [challengeEmail, setChallengeEmail] = useState<string>('');
  const [challengeStatus, setChallengeStatus] = useState<string>('');
  const [loadingText, setLoadingText] = useState<string>('');

  const activeScenario = SURVIVAL_SCENARIOS[currentStep];

  // Load name if user state updates
  useEffect(() => {
    if (currentUser?.name) {
      setPlayerName(currentUser.name);
    }
  }, [currentUser]);

  // Handle option dispatch
  const selectOption = (optIndex: number) => {
    const matchingOption = activeScenario.options[optIndex];
    setUserChoices(prev => ({ ...prev, [currentStep]: optIndex }));

    // Apply incremental telemetry values safely bounded [0-100]
    setSanity(prev => Math.max(5, Math.min(100, prev + matchingOption.impact.sanity)));
    setInfluence(prev => Math.max(5, Math.min(100, prev + matchingOption.impact.influence)));
    setFavor(prev => Math.max(5, Math.min(100, prev + matchingOption.impact.favor)));
    setCaffeine(prev => Math.max(5, Math.min(100, prev + matchingOption.impact.caffeine)));

    // Emit comically accurate logging events
    const consoleLog = `📡 [DECISION - DAY 0${currentStep + 1}]: Selected choice of action. Pipeline verified.`;
    const telemetryLog = `↳ Consequence: ${matchingOption.consequence}`;
    const balanceLog = `↳ Delta Values -> Sanity: ${matchingOption.impact.sanity > 0 ? '+' : ''}${matchingOption.impact.sanity}% | Influence: ${matchingOption.impact.influence > 0 ? '+' : ''}${matchingOption.impact.influence}%`;

    setTickerLogs(prev => [consoleLog, telemetryLog, balanceLog, ...prev].slice(0, 10));

    // Stagger phase transition for smooth user feedback reading logs
    setTimeout(() => {
      if (currentStep < SURVIVAL_SCENARIOS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setPhase('grading');
        runDiagnosticsLoader();
      }
    }, 450);
  };

  const runDiagnosticsLoader = () => {
    const loadingStatements = [
      "🔄 Compiling personal boundary enforcement parameters...",
      "☕ Recalculating coffee-to-production output metrics...",
      "🤝 Measuring alignment synergy with key stakeholders...",
      "🛡️ Calculating vulnerability indices for weekend release panic...",
      "🏆 Generating your bespoke Verified Career Survival Portfolio Certificate..."
    ];

    let currentLIdx = 0;
    setLoadingText(loadingStatements[currentLIdx]);

    diagnosticsTimerRef.current = setInterval(() => {
      currentLIdx++;
      if (currentLIdx < loadingStatements.length) {
        setLoadingText(loadingStatements[currentLIdx]);
      } else {
        if (diagnosticsTimerRef.current) {
          clearInterval(diagnosticsTimerRef.current);
          diagnosticsTimerRef.current = null;
        }
        setPhase('certificate');
      }
    }, 700);
  };

  const restartSimulation = () => {
    setUserChoices({});
    setCurrentStep(0);
    setSanity(80);
    setInfluence(50);
    setFavor(50);
    setCaffeine(60);
    setTickerLogs([
      "📂 [SYSTEM]: Career survival model booted in preview sandbox.",
      "☕ [HEALTH]: Caffeine levels calculated at medium priority. Standby for Monday."
    ]);
    setPhase('welcome');
  };

  // Compile final results & persona categorization
  // Calculate final score bounds
  const getPersonaResult = () => {
    const totalSanity = sanity;
    const totalInfluence = influence;
    const totalFavor = favor;

    if (totalSanity >= 70 && totalInfluence >= 60) {
      return {
        badge: "The Stealth Mastermind",
        subtitle: "High Sanity, Elite Impact (Top 1% Career Vibe)",
        color: "from-amber-400 to-yellow-600 text-amber-400",
        bg: "border-amber-400/30 bg-amber-500/5",
        text: "You handle chaotic workplace dynamics like a natural. By protecting your calendar with elegant boundaries, utilizing asynchronous writing, and staying out of unnecessary gossip, you deliver elite work while keeping your stress flat. Recruiters prioritize builders who can manage workload without crashing."
      };
    } else if (totalSanity >= 70) {
      return {
        badge: "The Work-Life Balance Legend",
        subtitle: "Maximized Sanity, Low-Stress Professional",
        color: "from-emerald-400 to-teal-600 text-emerald-400",
        bg: "border-emerald-400/30 bg-emerald-500/5",
        text: "You are an absolute wizard of professional boundaries. Monday morning syncs, Slack food stampedes, and Friday afternoon huddles are gracefully side-stepped. You preserve your personal energy flawlessly, making you a master of productivity pacing."
      };
    } else if (totalInfluence >= 60) {
      return {
        badge: "The Critical Catalyst / MVP",
        subtitle: "High-Visibility, Coffee-Powered Heavy Lifter",
        color: "from-indigo-400 to-blue-600 text-indigo-400",
        bg: "border-indigo-400/30 bg-indigo-500/5",
        text: "You carry projects on your shoulders. Release war rooms, emergency patches, and strategic syncs see your name first. Your work is highly respected, though you might need to buy an extra package of coffee beans to sustain your current speed!"
      };
    } else {
      return {
        badge: "The Tactical Synergist",
        subtitle: "High Political Compass & Communication Specialist",
        color: "from-purple-400 to-violet-600 text-purple-400",
        bg: "border-purple-400/30 bg-purple-500/10",
        text: "A master of office collaboration! You communicate so seamlessly that issues resolve themselves through sheer professional diplomacy before they even hit the tracker files. Excellent management potential."
      };
    }
  };

  const persona = getPersonaResult();

  // LinkedIn Post Content Compilation
  const compileLinkedInTemplate = () => {
    const code = currentUser?.referralCode || "DELTA_LEADER_25";
    const actualName = playerName.trim() || "A Lifelong Learner";
    
    return `💼 SYSTEM READOUT: OFFICE SURVIVAL & DECISION DECKS 💼

I just completed the interactive 'Corporate Survival & Career IQ Simulator' on Deltaclause and secured my verified Professional Persona:

🏆 OFFICE VERDICT: "${persona.badge}" (${persona.subtitle})
🧘 Mental Sanity Score: ${sanity}% (Optimal sanity buffer)
📈 Growth & Visibility Index: ${influence}%
🤝 Office Diplomatic Favor: ${favor}%
☕ End-of-Week Caffeine Reserve: ${caffeine}%

Instead of basic academic questions, I had to manage real, modern workplace compromises:
1. Converting 90-minute agenda-less meetings into efficient asynchronous updates.
2. Handling Wednesday afternoon breakroom food surges like a tactician.
3. Decoupling minor code-glitch panics from weekend personal time via realistic estimation.
4. Sidestepping hyper-social LinkedIn brag loops while maintaining true developer focus.
5. Setting clear boundaries for 4:55 PM 'quick call' huddle ambushes on a Friday.

This is a fun way to test decision-making, soft skills, and professional emotional intelligence (EQ) under pressure. 

Think you can survive a simulated corporate week with higher sanity or political favor? Challenge yourself and test your standings! Let's connect and share certificates: ${window.location.origin}

#CorporateSurvival #CareerGrowth #SystemDesign #ProductivityHack #EngineeringCulture #DeltaclauseChallenge`;
  };

  const handleCopyPostText = () => {
    const fullText = compileLinkedInTemplate();
    navigator.clipboard.writeText(fullText);
    setCopyCodeStatus(true);
    setTimeout(() => setCopyCodeStatus(false), 2000);
  };

  // Challenge dynamic simulation
  const handleSendChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeEmail.trim()) return;

    setChallengeStatus(`✓ Invite dispatch complete! A challenge code has been routed to ${challengeEmail}. They have been appended to your referral standings list.`);
    setChallengeEmail('');
    setTimeout(() => setChallengeStatus(''), 5000);
  };

  return (
    <section className="bg-slate-950 border border-slate-900 rounded-[38px] p-6 sm:p-8 relative overflow-hidden select-none text-left transition-all">
      
      {/* Decorative linear grids for modern vibe */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute top-12 right-12 text-slate-900/60 text-9xl pointer-events-none uppercase font-black font-mono select-none">
        SURVIVAL
      </div>

      <div className="space-y-6 relative z-10">

        {/* Dynamic header panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-505/15 to-violet-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-[10px] uppercase font-mono font-black tracking-widest leading-none">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Career Playroom</span>
            </div>
            
            <h3 className="text-[22px] sm:text-[25px] font-black text-white tracking-tight leading-snug">
              The Corporate Survival Simulator: Zero to C-Suite 🚀
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
              Are you a quiet slacker, an over-caffeinated hero, or a stealth mastermind? Step into the shoes of an employee facing hilarious, realistic career choices. Balance sanity, visibility, and coffee to unlock a beautiful **LinkedIn Portfolio Credential** to boost your social profile visibility!
            </p>
          </div>
        </div>

        {/* ================= STAGE 1: INTRO FORM ================= */}
        {phase === 'welcome' && (
          <div className="py-8 max-w-2xl mx-auto text-center flex flex-col items-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-[22px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/5 relative">
              <Coffee className="w-8 h-8 text-indigo-400" />
              <Zap className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-extrabold text-base sm:text-lg uppercase font-mono tracking-tight text-center">
                🤖 Setup Your Strategic Employee File
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-lg mx-auto">
                No tech skills required! Everyone is invited to play. Enter your credentials to customize the certificate outputs and system logs.
              </p>
            </div>

            {/* Custom Inputs Panel */}
            <div className="w-full bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
              <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest block text-left">
                VERIFIED CREDENTIAL PRINT DATA
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[8px] text-slate-500 uppercase font-bold">Your Preferred Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Sharma"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[8px] text-slate-500 uppercase font-bold">Your Professional Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science Student"
                    value={professionalTag}
                    onChange={(e) => setProfessionalTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[8px] text-slate-500 uppercase font-bold">Target Focus Path</label>
                  <select
                    value={careerPath}
                    onChange={(e) => setCareerPath(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-855 border-slate-850 p-3 rounded-xl text-white outline-none cursor-pointer focus:border-indigo-500"
                  >
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="System Design & Architecture">System Design & Architecture</option>
                    <option value="Product & Program Management">Product & Management</option>
                    <option value="Creative Design & Marketing">Creative UI/UX & Design</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!playerName.trim()) {
                  alert('Please enter your name to customize your verified professional certificate!');
                  return;
                }
                setPhase('playing');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.01] transition-all cursor-pointer font-mono"
              type="button"
            >
              <span>Clock In & Get Started</span>
              <ArrowRight className="w-4 h-4 text-white stroke-[3px]" />
            </button>
          </div>
        )}

        {/* ================= STAGE 2: CARDS PLAYROOM ================= */}
        {phase === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
            
            {/* Left Frame: Scenario Console */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-slate-950 border border-slate-900 rounded-[28px] overflow-hidden shadow-2xl">
                
                {/* Simulated window chrome */}
                <div className="bg-slate-900/60 px-4 py-3 flex items-center justify-between border-b border-slate-900 select-none">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                    <span className="text-[10px] text-slate-500 ml-2 tracking-wider">
                      /usr/bin/corporate-week-day-0{activeScenario.id}.sh
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[8px] font-black tracking-wide border border-indigo-500/20 text-indigo-400 bg-indigo-500/5 uppercase">
                    Stage {activeScenario.id} of {SURVIVAL_SCENARIOS.length}
                  </span>
                </div>

                {/* Scenario details */}
                <div className="p-6 space-y-5 block text-left">
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 border border-slate-850 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-md uppercase font-bold flex items-center gap-1">
                        <span>{activeScenario.avatar}</span>
                        <span>{activeScenario.character}</span>
                      </span>
                    </div>

                    <h4 className="text-white font-black text-base sm:text-lg leading-snug tracking-tight">
                      {activeScenario.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl select-text">
                    {activeScenario.text}
                  </p>

                </div>

                {/* Options Panel */}
                <div className="bg-slate-900/30 p-5 border-t border-slate-900 space-y-4">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">
                    CHOOSE YOUR CAREER ACTION PATH
                  </span>

                  <div className="space-y-3 font-mono">
                    {activeScenario.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => selectOption(oIdx)}
                        className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 p-4 rounded-2xl transition-all cursor-pointer text-slate-350 flex items-start gap-3 group text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center font-black text-xs text-slate-400 shrink-0">
                          {oIdx + 1}
                        </span>

                        <div className="space-y-1">
                          <span className="font-sans font-extrabold text-xs text-white block group-hover:text-indigo-400 transition-colors">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans font-medium leading-relaxed block">
                            {opt.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Telemetry live feed logs */}
              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-4 min-h-[105px] max-h-[105px] overflow-y-auto text-[9.5px] font-mono text-slate-500 space-y-1 select-text">
                {tickerLogs.map((log, lIdx) => (
                  <div key={lIdx} className={
                    log.includes('Consequence:') ? 'text-slate-400' :
                    log.includes('Delta Values') ? 'text-indigo-400 font-bold' :
                    log.includes('DECISION') ? 'text-amber-500 font-extrabold' : 'text-slate-600'
                  }>
                    {log}
                  </div>
                ))}
              </div>

            </div>

            {/* Right Frame: Active Dials Gauges */}
            <div className="lg:col-span-5 space-y-4 font-mono select-none">
              
              <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider block">Real-time stats</span>
                  <span className="text-white font-extrabold text-xs uppercase">
                    ⏰ Simulated corporate calendar
                  </span>
                </div>
                <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
              </div>

              {/* Gauges UI */}
              <div className="bg-slate-900/60 border border-slate-900 p-5 rounded-[28px] space-y-5 block text-left">
                
                <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wide border-b border-slate-950 pb-2">
                  System Stress Telemetry
                </span>

                {/* Dial 1: Mental Sanity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-505 text-slate-500 text-[10px] uppercase block leading-none flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Mental Sanity Level</span>
                    </span>
                    <strong className="text-white text-xs font-mono">{sanity}%</strong>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${sanity}%` }}
                    />
                  </div>
                </div>

                {/* Dial 2: Coffee energy */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase block leading-none flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span>Caffeine reserve</span>
                    </span>
                    <strong className="text-white text-xs font-mono">{caffeine}%</strong>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${caffeine}%` }}
                    />
                  </div>
                </div>

                {/* Dial 3: Workplace Influence */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase block leading-none flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Work visibility & respect</span>
                    </span>
                    <strong className="text-white text-xs font-mono">{influence}%</strong>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${influence}%` }}
                    />
                  </div>
                </div>

                {/* Dial 4: Political Favor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase block leading-none flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Stakeholder coordination favor</span>
                    </span>
                    <strong className="text-white text-xs font-mono">{favor}%</strong>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${favor}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-[10px] text-slate-500 leading-normal flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Aim to keep all four gauges balanced. Dropping any stat below 15% triggers immediate emergency alignment alerts!</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= STAGE 3: INTERACTIVE LOADER ================= */}
        {phase === 'grading' && (
          <div className="py-16 text-center max-w-xl mx-auto space-y-6 flex flex-col items-center select-none animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
            
            <div className="space-y-2">
              <h5 className="text-white font-extrabold text-sm uppercase font-mono tracking-tight text-center">
                Computing Corporate Sanity Quotient...
              </h5>
              <p className="text-xs text-slate-500 font-mono italic">
                {loadingText}
              </p>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: HIGH-END DIGITAL PORTFOLIO CERTIFICATE ================= */}
        {phase === 'certificate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-2 animate-fade-in text-left">
            
            {/* Left Frame: Simulated Embossed Certificate Card */}
            <div className="lg:col-span-5 flex justify-center">
              
              <div className="w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/20 p-6 rounded-[34px] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[520px] select-text">
                
                {/* Holographic header bar */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-600 opacity-90" />

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-900">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-400 bg-indigo-500/5 font-bold animate-pulse">
                    🛡️ Verified Career IQ Credential
                  </span>
                  
                  <span className="font-bold text-slate-400">
                    ID: DELTA-SURV-{Math.floor(Math.random() * 89999 + 10000)}
                  </span>
                </div>

                {/* Central Embellished Seal Badge */}
                <div className="my-5 p-5 bg-slate-950/90 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center relative min-h-[190px]">
                  
                  <div className="absolute top-2 right-2 flex gap-1 text-[11px] text-indigo-400 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <Award className="w-12 h-12 text-indigo-400 mb-2 filter drop-shadow animate-bounce" />

                  <h5 className="font-mono text-[8px] uppercase tracking-widest text-slate-500 font-extrabold leading-none mt-1">
                    SURVIVAL ARCHITECTURE
                  </h5>

                  <h4 className="font-sans text-base font-black text-white uppercase tracking-tight mt-1.5 leading-tight">
                    {persona.badge}
                  </h4>

                  <span className="text-[10px] text-indigo-400 font-mono font-black uppercase mt-1">
                    {persona.subtitle}
                  </span>

                  {/* Candidate Name stamp */}
                  <div className="pt-3.5 text-slate-400 border-t border-slate-900 mt-4 text-[10.5px] font-sans w-full leading-none">
                    Name: <strong className="text-white underline">{playerName}</strong>
                  </div>

                  {professionalTag && (
                    <div className="text-[9px] text-slate-500 mt-1 uppercase font-bold leading-none italic">
                      ({professionalTag})
                    </div>
                  )}

                  <div className="text-[9px] text-slate-600 mt-1 uppercase font-mono font-bold">
                    Focus Stream: {careerPath}
                  </div>
                </div>

                {/* Aggregated score results */}
                <div className="space-y-3 font-sans">
                  
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans text-center px-2 select-text italic">
                    "{persona.text}"
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[8.5px] text-slate-400 text-center pt-2">
                    <div className="p-1.5 bg-slate-950/80 border border-slate-900 rounded-xl">
                      <span>SANITY</span>
                      <strong className="block text-rose-400 text-xs mt-0.5">{sanity}%</strong>
                    </div>

                    <div className="p-1.5 bg-slate-950/80 border border-slate-900 rounded-xl">
                      <span>VISIBILITY</span>
                      <strong className="block text-indigo-400 text-xs mt-0.5">{influence}%</strong>
                    </div>

                    <div className="p-1.5 bg-slate-950/80 border border-slate-900 rounded-xl">
                      <span>POLITICS</span>
                      <strong className="block text-emerald-400 text-xs mt-0.5">{favor}%</strong>
                    </div>

                    <div className="p-1.5 bg-slate-950/80 border border-slate-900 rounded-xl">
                      <span>CAFFEINE</span>
                      <strong className="block text-amber-500 text-xs mt-0.5">{caffeine}%</strong>
                    </div>
                  </div>

                </div>

                {/* Certificate Footer Stamp */}
                <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>SYSTEM METRIC STAMP:</span>
                  <span className="font-black text-indigo-405 text-indigo-450 text-indigo-400 uppercase">
                    SLA STABILIZED STATUS
                  </span>
                </div>

              </div>

            </div>

            {/* Right Frame: Recruiter-Magnet LinkedIn Sharing Tools */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* LinkedIn Post Copy Panel */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-[28px] p-6 sm:p-8 space-y-4">
                
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 px-3 py-1 rounded-full text-[10px] uppercase font-mono font-black tracking-normal leading-none">
                    <Linkedin className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                    <span>Viral LinkedIn Feed Blueprint</span>
                  </div>
                  
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black text-right">
                    POST PREVIEW
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h4 className="text-white font-extrabold text-sm sm:text-base leading-tight">
                    Attract Managers and Recruiters to Your Feed
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                    This post highlights critical soft skills, professional boundary management, communication frameworks, and situational intelligence—making your profile stand out as a mature, competent professional!
                  </p>
                </div>

                {/* Live Editable Textarea Preview */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl max-h-[160px] overflow-y-auto selection:bg-indigo-500/20 text-[10px] font-mono text-slate-300 whitespace-pre-line leading-relaxed select-text shadow-inner">
                  {compileLinkedInTemplate()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 pt-1">
                  
                  <button
                    onClick={handleCopyPostText}
                    className="bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                    type="button"
                  >
                    {copyCodeStatus ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                    <span>{copyCodeStatus ? "Template Copied to Clipboard!" : "Copy Post Ready to Paste"}</span>
                  </button>

                  <a
                    href="https://www.linkedin.com/feed/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-indigo-500/20 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center no-underline"
                  >
                    <Linkedin className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Open LinkedIn Feed</span>
                  </a>

                </div>

              </div>

              {/* Share & Cohort Challenge Standings */}
              <div className="bg-slate-905 bg-slate-950 border border-slate-900 rounded-[28px] p-6 space-y-4">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block leading-none">
                  CHALLENGE YOUR FRIENDS / CLASSMATES
                </span>

                <div className="space-y-1 text-left">
                  <h5 className="text-white font-extrabold text-xs">Verify Standings Against Classmates</h5>
                  <p className="text-[10px] text-slate-400">Score 50 Bonus Coins on your Deltaclause account for each colleague who clock-in using your invite link!</p>
                </div>

                <form onSubmit={handleSendChallenge} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter friend's email address..."
                    value={challengeEmail}
                    onChange={(e) => setChallengeEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none font-mono focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer"
                  >
                    Send Challenge
                  </button>
                </form>

                {challengeStatus && (
                  <p className="text-[10.5px] font-mono text-emerald-400 leading-normal animate-pulse">
                    {challengeStatus}
                  </p>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-900">
                  <button
                    onClick={restartSimulation}
                    className="border border-slate-850 hover:border-indigo-550/20 hover:bg-slate-900/40 text-slate-400 hover:text-white px-5 py-2 rounded-xl text-[10.5px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart Playroom</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
