/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Code, Globe, Star, Github, ExternalLink, Flame } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { INITIAL_PORTFOLIOS } from '../data';

interface Props {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardPortfolio({ leaderboard }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const portfolios = INITIAL_PORTFOLIOS;

  const allTags = Array.from(
    new Set(portfolios.flatMap((p) => p.techStack))
  );

  const filteredPortfolios = portfolios.filter((portfolio) => {
    const matchesSearch =
      portfolio.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? portfolio.techStack.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div id="leaderboard-portfolio-section" className="space-y-12 font-sans">
      {/* Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leaderboard Podiums / Top 3 Showcase */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-amber-70s0 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                Leaderboard
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                Deltaclause Hotspots & Top Talent
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Based on project evaluations, task speed, and community points.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800">
              <Flame className="w-4 h-4 text-orange-553 dark:text-orange-500 animate-pulse" />
              <span>Real-Time Updates</span>
            </div>
          </div>

          <div className="space-y-4">
            {leaderboard.map((user, idx) => {
              const ringColor = 
                idx === 0 ? 'border-amber-400 dark:border-amber-400' :
                idx === 1 ? 'border-slate-350 dark:border-neutral-300' :
                idx === 2 ? 'border-amber-700 dark:border-amber-700' : 'border-slate-200 dark:border-neutral-800';

              const rankBg = 
                idx === 0 ? 'bg-amber-400 text-black font-extrabold' :
                idx === 1 ? 'bg-slate-205 dark:bg-neutral-300 text-slate-900 dark:text-black font-bold' :
                idx === 2 ? 'bg-amber-700 text-white font-bold' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400';

              return (
                <div
                  key={user.email}
                  id={`leaderboard-row-${idx}`}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-neutral-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300 hover:translate-x-1 group text-slate-800 dark:text-slate-100"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${rankBg}`}>
                      {idx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className={`w-10 h-10 rounded-xl bg-slate-200 dark:bg-neutral-900 border-2 ${ringColor} p-0.5`}
                      />
                      {idx === 0 && (
                        <span className="absolute -top-2.5 -right-1 text-xs">👑</span>
                      )}
                    </div>

                    {/* User Credentials */}
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-neutral-105 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
                        {user.email.replace(/(?<=.{3}).(?=.*@)/g, '*')}
                      </div>
                    </div>
                  </div>

                  {/* Points Ledger */}
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-mono text-slate-400 dark:text-neutral-500">Internships Finished</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-neutral-200">{user.completedCount} Projects</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-center min-w-20 shadow-sm">
                      <div className="text-xs text-slate-400 dark:text-neutral-550 font-mono scale-95 leading-none">SCORE</div>
                      <div className="text-sm font-extrabold font-mono text-cyan-600 dark:text-cyan-400 leading-none mt-1">{user.points} XP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats / Gamified Card - Bento Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl text-cyan-500" />
          
          <div>
            <span className="text-xs font-mono text-cyan-705 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Gamified Learning
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight leading-snug">
              Why points and badges matter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Deltaclause tracks task submission deadlines. Delivering quality, clean GitHub repositories, and properly tested Spring client configurations awards high-grade XP multipliers.
            </p>

            {/* Rule system list */}
            <div className="space-y-3.5 mt-6">
              <div className="flex items-start gap-3">
                <div className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                  +500
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200">First-Time Submission Pass</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Awarded for high-grade manual reviewer feedback</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">
                  +150
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200">Successful Referral Approved</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Points double as credits towards next catalog sheets</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs text-orange-600 dark:text-orange-400 font-mono font-bold">
                  Multiplier
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200">Early Finish Modifier</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Completing tasks within 50% of the duration allocation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500 font-mono">
            <span>Certificates Signed</span>
            <span className="text-emerald-500 font-bold">Fully Verifiable</span>
          </div>
        </div>
      </div>

      {/* Student Portfolios / Showcase Resumes */}
      <div id="student-lives-portfolios">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Public Student Portfolios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top-tier student projects acting as their real-world resumes for HRs.
            </p>
          </div>

          {/* Filtering */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/10'
                  : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-neutral-700'
              }`}
            >
              All Tech
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/10'
                    : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolios Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPortfolios.map((portfolio, pIdx) => (
            <div
              key={portfolio.githubUrl}
              id={`portfolio-card-${pIdx}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-slate-300 dark:hover:border-slate-750 transition-all duration-300 hover:shadow-md flex flex-col justify-between text-slate-800 dark:text-slate-200"
            >
              <div>
                {/* User Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.studentName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-900 p-0.5 border border-slate-200 dark:border-neutral-800"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-neutral-100">{portfolio.studentName}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">{portfolio.internshipTitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 px-2.5 py-1 rounded-xl text-xs font-mono">
                    <Award className="w-3.5 h-3.5" />
                    <span>Graduated</span>
                  </div>
                </div>

                {/* Comment / Review details */}
                <p className="text-xs text-slate-600 dark:text-neutral-300 italic mb-4 line-clamp-3 leading-relaxed">
                  "{portfolio.comment}"
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {portfolio.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-mono text-slate-500 dark:text-neutral-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Rows */}
              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-xs font-mono text-slate-400 dark:text-neutral-500">Graduation Date:</span>
                  <span className="font-semibold text-slate-700 dark:text-neutral-300">{portfolio.completionDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={portfolio.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl transition-all hover:text-slate-950 dark:hover:text-white cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5 font-bold" />
                    <span>Source</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filteredPortfolios.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-205 dark:border-neutral-800">
              <Code className="w-8 h-8 text-neutral-450 mx-auto mb-2" />
              <p className="text-sm text-slate-505 dark:text-neutral-400 font-mono">No student portfolios found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
