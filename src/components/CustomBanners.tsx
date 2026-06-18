import React, { useState, useEffect } from 'react';
import { Megaphone, X, Settings, Check, ArrowRight, Plus, Trash2, Edit2, Sparkles, AlertCircle } from 'lucide-react';
import { User } from '../types';

export interface CustomizableBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  linkUrl: string;
  theme: 'indigo' | 'emerald' | 'amber' | 'crimson' | 'sky' | 'violet';
  placement: 'catalog_top' | 'catalog_bottom' | 'student_dashboard_top' | 'student_dashboard_bottom' | 'verifier_top';
  isActive: boolean;
}

const DEFAULT_BANNER_PRESETS: CustomizableBanner[] = [
  {
    id: 'banner-pres-1',
    tag: '🚀 PLACEMENT ALERT',
    title: 'Razorpay & Zeta Direct Interview Pipelines Open!',
    subtitle: 'Our partner startups are scouting for high-performing trainee builders. Submit your Task Sheet 4 by June 30th to enter the fast-track clinical QA and SDE interview rounds.',
    ctaText: 'Access Leaderboard Standings',
    linkUrl: '#leaderboard-portfolio',
    theme: 'emerald',
    placement: 'catalog_top',
    isActive: true,
  },
  {
    id: 'banner-pres-2',
    tag: '🎓 REFUND SLOTS',
    title: 'Referral Refund Frenzy: Get 100% of Your Fees Back!',
    subtitle: 'Invite 3 of your college peers to any practical software engineering cohort. If they register, your full tuition fee is refunded directly via UPI/PayPal instantly.',
    ctaText: 'Get My Invite Code',
    linkUrl: '#referral-card',
    theme: 'indigo',
    placement: 'student_dashboard_top',
    isActive: true,
  },
  {
    id: 'banner-pres-3',
    tag: '🎉 SYSTEM DESIGN MASTERCLASS',
    title: 'Saturday Live Build: From Day 1 to 10M Concurrent Connections',
    subtitle: 'Learn live telemetry monitoring, Redis caching, and horizontal server scalability from an ex-Meta Principal Engineer this Saturday at 6 PM. Trainees enter free.',
    ctaText: 'Verify Your Admission',
    linkUrl: '#',
    theme: 'amber',
    placement: 'catalog_bottom',
    isActive: true,
  }
];

// Helper to load/save banners
export function getStoredBanners(): CustomizableBanner[] {
  const stored = localStorage.getItem('dc_customizable_banners');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  // Store presets initially
  localStorage.setItem('dc_customizable_banners', JSON.stringify(DEFAULT_BANNER_PRESETS));
  return DEFAULT_BANNER_PRESETS;
}

export function saveStoredBanners(banners: CustomizableBanner[]) {
  localStorage.setItem('dc_customizable_banners', JSON.stringify(banners));
  // Dispatch simple event to sync multiple banner placements in real-time
  window.dispatchEvent(new Event('dc_banners_updated'));
}

// 1. COMPONENT TO RENDER BANNERS AT A SPECIFIC SPOT
interface RenderBannersProps {
  placement: CustomizableBanner['placement'];
  currentUser: User | null;
}

export function DynamicBannerPlacement({ placement, currentUser }: RenderBannersProps) {
  const [banners, setBanners] = useState<CustomizableBanner[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});

  const loadBanners = () => {
    const list = getStoredBanners();
    const activeForSpot = list.filter(b => b.placement === placement && b.isActive);
    setBanners(activeForSpot);
  };

  useEffect(() => {
    loadBanners();
    
    // Listen for changes from admin configurations
    const handleSync = () => loadBanners();
    window.addEventListener('dc_banners_updated', handleSync);
    return () => window.removeEventListener('dc_banners_updated', handleSync);
  }, [placement]);

  if (banners.length === 0) return null;

  // Filter out any dismissed banners
  const visibleBanners = banners.filter(b => !dismissedIds.includes(b.id));
  if (visibleBanners.length === 0) return null;

  // Track rotational carousel switch
  const currentIdx = activeIndices[placement] || 0;
  const activeAd = visibleBanners[currentIdx] || visibleBanners[0];

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    // Adjust index if out of limits on next render
    if (currentIdx >= visibleBanners.length - 1) {
      setActiveIndices(prev => ({ ...prev, [placement]: Math.max(0, currentIdx - 1) }));
    }
  };

  const getThemeStyles = (theme: CustomizableBanner['theme']) => {
    switch (theme) {
      case 'emerald':
        return {
          bg: 'from-emerald-950 to-slate-950 border-emerald-500/20 text-white',
          badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-350',
          btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/10'
        };
      case 'amber':
        return {
          bg: 'from-amber-950/80 to-slate-950 border-amber-500/20 text-white',
          badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/10'
        };
      case 'crimson':
        return {
          bg: 'from-rose-950/80 to-slate-950 border-rose-500/20 text-white',
          badge: 'bg-rose-500/15 border-rose-500/35 text-rose-350',
          btn: 'bg-rose-600 hover:bg-rose-550 text-white shadow-rose-900/10'
        };
      case 'sky':
        return {
          bg: 'from-sky-950/80 to-slate-950 border-sky-500/20 text-white',
          badge: 'bg-sky-500/15 border-sky-500/30 text-sky-350',
          btn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/10'
        };
      case 'violet':
        return {
          bg: 'from-violet-950/80 to-slate-950 border-violet-500/20 text-white',
          badge: 'bg-violet-500/15 border-violet-500/30 text-violet-350',
          btn: 'bg-violet-600 hover:bg-violet-550 text-white shadow-violet-910/10'
        };
      case 'indigo':
      default:
        return {
          bg: 'from-indigo-950 to-slate-950 border-indigo-500/20 text-white',
          badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-350',
          btn: 'bg-indigo-650 hover:bg-indigo-550 text-white shadow-indigo-900/10'
        };
    }
  };

  const currentTheme = getThemeStyles(activeAd.theme);

  return (
    <div className="relative group/custombanner w-full animate-fade-in select-none my-6">
      <div className={`relative bg-gradient-to-r ${currentTheme.bg} border rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden`}>
        {/* Glow vector effect */}
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/2 rounded-full blur-2xl pointer-events-none group-hover/custombanner:scale-110 transition-transform" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 text-left">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold border ${currentTheme.badge}`}>
                <Megaphone className="w-3 h-3" />
                <span>{activeAd.tag || 'PROMOTED'}</span>
              </span>

              {visibleBanners.length > 1 && (
                <div className="flex items-center gap-1">
                  {visibleBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndices(prev => ({ ...prev, [placement]: idx }))}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        currentIdx === idx ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/70'
                      }`}
                      title={`Slide ${idx + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {activeAd.title}
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-350 dark:text-slate-400 font-sans font-medium hover:text-slate-200 transition-colors">
              {activeAd.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={activeAd.linkUrl || '#'}
              className={`inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all hover:scale-[1.02] cursor-pointer no-underline ${currentTheme.btn}`}
            >
              <span>{activeAd.ctaText || 'Learn More'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Dismiss trigger */}
        <button
          onClick={() => handleDismiss(activeAd.id)}
          className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss banner ad"
          type="button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 2. ADMIN PORTAL COMPONENT TO CONFIGURE AND MANAGE ALL BANNERS
export function AdminBannerManagementHub() {
  const [banners, setBanners] = useState<CustomizableBanner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const [form, setForm] = useState<Omit<CustomizableBanner, 'id'>>({
    tag: 'ANNOUNCEMENT',
    title: '',
    subtitle: '',
    ctaText: 'View Details',
    linkUrl: '#',
    theme: 'indigo',
    placement: 'catalog_top',
    isActive: true,
  });

  useEffect(() => {
    setBanners(getStoredBanners());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subtitle.trim()) {
      setFeedback('Failed: Please input title and description.');
      return;
    }

    let updatedList: CustomizableBanner[];
    if (editingId) {
      updatedList = banners.map(b => b.id === editingId ? { ...b, ...form } : b);
      setEditingId(null);
      setFeedback('Banner updated successfully!');
    } else {
      const newBanner: CustomizableBanner = {
        ...form,
        id: `banner-custom-${Date.now()}`,
      };
      updatedList = [...banners, newBanner];
      setFeedback('New fully-customized banner deployed!');
    }

    setBanners(updatedList);
    saveStoredBanners(updatedList);

    // Reset default details
    setForm({
      tag: 'ANNOUNCEMENT',
      title: '',
      subtitle: '',
      ctaText: 'View Details',
      linkUrl: '#',
      theme: 'indigo',
      placement: 'catalog_top',
      isActive: true,
    });

    setTimeout(() => setFeedback(''), 3000);
  };

  const handleEdit = (b: CustomizableBanner) => {
    setEditingId(b.id);
    setForm({
      tag: b.tag,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      linkUrl: b.linkUrl,
      theme: b.theme,
      placement: b.placement,
      isActive: b.isActive,
    });
    window.scrollTo({ top: document.getElementById('banners-form-anchor')?.offsetTop, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this customizable promotional banner?')) {
      const filtered = banners.filter(b => b.id !== id);
      setBanners(filtered);
      saveStoredBanners(filtered);
      setFeedback('Banner permanently removed from placements.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBanners(updated);
    saveStoredBanners(updated);
  };

  return (
    <div className="space-y-6 block text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-205 dark:border-slate-800">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide font-mono">
            <Settings className="w-4 h-4 text-indigo-500 animate-spin-slow" />
            <span>Universal Adaptive Promotion Banner Engine</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            Admin exclusive: Create target-placed fully customizable banners to promote live courses, hackathons, or system alerts at specific positions on the website.
          </p>
        </div>
        
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                tag: 'ANNOUNCEMENT',
                title: '',
                subtitle: '',
                ctaText: 'View Details',
                linkUrl: '#',
                theme: 'indigo',
                placement: 'catalog_top',
                isActive: true,
              });
            }}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-xl transition"
            type="button"
          >
            Cancel Edit Mode
          </button>
        )}
      </div>

      {feedback && (
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-3 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Editor Form */}
      <form id="banners-form-anchor" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-neutral-950 border border-slate-205 dark:border-slate-900 p-5 rounded-3xl text-xs font-mono">
        <div className="space-y-1.5 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Tag / Badge Header</label>
          <input
            type="text"
            required
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            placeholder="e.g. 🚀 PLACEMENT ALERT"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Button Link URL</label>
          <input
            type="text"
            required
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            placeholder="e.g. #leaderboard-portfolio or external links"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Banner Main Headline <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Introduce the core campaign or news clearly"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Subheading / Description Details <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={2}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Add critical informational specifics, deadlines, and direct benefits here."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs font-sans"
          />
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Button CTA Text</label>
          <input
            type="text"
            required
            value={form.ctaText}
            onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
            placeholder="e.g. Claim Offer, Reserve Seat"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5 md:col-span-1 animate-fade-in">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Deploy Location Target</label>
          <select
            value={form.placement}
            onChange={(e) => setForm({ ...form, placement: e.target.value as any })}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl cursor-pointer text-xs"
          >
            <option value="catalog_top">📍 Internship Catalog - Top Page</option>
            <option value="catalog_bottom">📍 Internship Catalog - Bottom Page</option>
            <option value="student_dashboard_top">📍 Student Dashboard - Top Page</option>
            <option value="student_dashboard_bottom">📍 Student Dashboard - Bottom Page</option>
            <option value="verifier_top">📍 Certificate Verifier - Top</option>
          </select>
        </div>

        {/* Colors Palette selector */}
        <div className="space-y-1.5 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-550 uppercase">Styling Color Theme</label>
          <div className="grid grid-cols-6 gap-1.5 pt-1">
            {([
              { key: 'indigo', color: 'bg-indigo-650' },
              { key: 'emerald', color: 'bg-emerald-600' },
              { key: 'amber', color: 'bg-amber-600' },
              { key: 'crimson', color: 'bg-red-600' },
              { key: 'sky', color: 'bg-sky-500' },
              { key: 'violet', color: 'bg-violet-605' },
            ] as const).map(({ key, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm({ ...form, theme: key })}
                className={`py-2 px-1 rounded-xl cursor-pointer flex flex-col items-center gap-1.5 border transition ${
                  form.theme === key ? 'border-semibold border-slate-900 dark:border-white ring-2 ring-indigo-500/20' : 'border-transparent hover:border-slate-300'
                }`}
                title={key}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${color}`} />
                <span className="text-[8px] uppercase tracking-widest">{key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Toggle Initial Status</label>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                form.isActive 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {form.isActive ? '✓ Status: Active & Live on Site' : '⚡ Status: Idle / Draft'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 pt-3 border-t border-slate-205 dark:border-slate-850 flex justify-end gap-2">
          <button
            type="submit"
            className="p-2.5 px-6 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>{editingId ? 'Modify Theme Banner' : 'Create & Deploy Banner'}</span>
          </button>
        </div>
      </form>

      {/* List layout of banners */}
      <div className="space-y-3 font-sans">
        <h5 className="font-extrabold text-xs text-slate-905 dark:text-slate-300 tracking-wide font-mono uppercase">
          Deployed Custom Promo Campaign Register ({banners.length})
        </h5>

        <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-850">
          {banners.map((b) => (
            <div key={b.id} className="p-4 bg-white dark:bg-slate-905 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div className="space-y-1.5 text-xs text-left max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-950 font-mono text-[9px] font-bold border rounded px-1.5 py-0.5 text-slate-655 uppercase">
                    {b.placement.replace('_', ' ')}
                  </span>
                  
                  <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                    b.isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/35 text-emerald-650 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-455'
                  }`}>
                    {b.isActive ? 'Active' : 'Disabled'}
                  </span>
                  
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Theme: <strong className="text-slate-600 dark:text-slate-300">{b.theme}</strong>
                  </span>
                </div>

                <div className="font-bold text-slate-900 dark:text-white leading-tight font-sans text-xs sm:text-sm">
                  {b.title}
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium max-w-xl">
                  {b.subtitle}
                </p>
                
                <div className="text-[10px] font-mono text-indigo-650 dark:text-indigo-400">
                  CTA Button: <strong className="underline">{b.ctaText}</strong> &rarr; Link: <strong className="italic">{b.linkUrl}</strong>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col md:flex-row items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => handleToggleActive(b.id)}
                  title="Toggle target visibility"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 transition-all cursor-pointer"
                  type="button"
                >
                  <Check className={`w-4 h-4 ${b.isActive ? 'text-emerald-550' : 'text-slate-400'}`} />
                </button>
                <button
                  onClick={() => handleEdit(b)}
                  title="Modify content values"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:border-slate-805 transition-all cursor-pointer"
                  type="button"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  title="Delete promotional slot"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 dark:border-slate-805 transition-all cursor-pointer"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
