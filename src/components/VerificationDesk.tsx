/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Calendar, Award, FileCheck, CheckCircle2, Copy, Download } from 'lucide-react';
import { Certificate } from '../types';
import { downloadCertificate } from '../utils/documentGenerator';

interface Props {
  certificates: Certificate[];
}

export default function VerificationDesk({ certificates }: Props) {
  const [certId, setCertId] = useState('');
  const [searchResult, setSearchResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger search
  const handleVerify = (idToVerify: string) => {
    const formattedId = idToVerify.trim().toUpperCase();
    const found = certificates.find((c) => c.id.toUpperCase() === formattedId);
    setSearchResult(found || null);
    setSearched(true);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="verification-desk" className="max-w-4xl mx-auto space-y-10 font-sans">
      
      {/* Verification Query Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm text-center space-y-6 text-slate-900 dark:text-white">
        <div className="max-w-xl mx-auto col-span-3">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            VERIFICATION DESK
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">
            Verify Deltaclause Credentials
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-405 mt-2">
            Verify the authenticity of an internship certificate. Enter the unique ID listed at the bottom of the certificate.
          </p>
        </div>

        {/* Input box */}
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="e.g. DC-2026-8801"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify(certId)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-500 focus:border-indigo-505 text-slate-900 dark:text-slate-55 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-mono placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => handleVerify(certId)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3.5 px-6 rounded-2xl transition-all text-sm hover:cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-indigo-600/10"
          >
            Verify Seal
          </button>
        </div>

        {/* Testing quicklink suggestions */}
        <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-slate-150 dark:border-neutral-800/60">
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
            Demo suggestions (Click to Auto-fill and Verify):
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {certificates.map((cert) => (
              <button
                key={cert.id}
                onClick={() => {
                  setCertId(cert.id);
                  handleVerify(cert.id);
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-950/80 border border-slate-205 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-lg text-xs font-mono text-slate-600 dark:text-neutral-400 transition-all cursor-pointer"
              >
                {cert.id} ({cert.studentName.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Success / Error Display */}
      {searched && (
        <div className="animate-fade-in">
          {searchResult ? (
            <div className="space-y-6">
              {/* Green Verified Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-650 dark:text-emerald-400 text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div className="font-mono">
                  <span className="font-bold">VALID SEAL VERIFIED:</span> Cert ID matched successfully and signed digitally by Deltaclause Authorization authority.
                </div>
              </div>

              {/* Download Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-indigo-500/5 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white">
                <div className="font-mono text-[11px] text-slate-500 dark:text-gray-400">
                  Record matches officially signed registry. You can download a high-DPI printable PNG copy directly to your device:
                </div>
                <button
                  type="button"
                  onClick={() => downloadCertificate(
                    searchResult.studentName,
                    searchResult.internshipTitle,
                    searchResult.id,
                    searchResult.completionDate,
                    searchResult.durationMonths
                  )}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-4 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl font-bold font-sans cursor-pointer text-xs shadow-md shadow-indigo-604/10 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certificate</span>
                </button>
              </div>

              {/* Beautiful Simulated Certificate PDF Page structure */}
              <div className="bg-white text-neutral-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative border-8 border-neutral-100 overflow-hidden select-none">
                {/* Vintage Border corner design */}
                <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-neutral-300 pointer-events-none" />
                <div className="absolute top-6 left-6 right-6 bottom-6 border border-neutral-200 pointer-events-none" />
                
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Award className="w-96 h-96 text-black" />
                </div>

                <div className="relative z-10 text-center space-y-6">
                  {/* Company Header */}
                  <div>
                    <h3 className="text-2xl font-bold font-serif tracking-wider uppercase text-neutral-800">
                      DELTACLAUSE
                    </h3>
                    <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mt-1">
                      INTELLIGENT PROJECT ACADEMY & INTERNSHIPS
                    </p>
                  </div>

                  <div className="w-24 h-0.5 bg-neutral-800 mx-auto" />

                  {/* Document Title */}
                  <div>
                    <h4 className="text-lg font-serif italic text-neutral-600">
                      Certificate of Internship Accomplishment
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 font-sans">
                      This digitally signed certificate is proudly presented to
                    </p>
                  </div>

                  {/* Recipient */}
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-neutral-900 border-b border-dashed border-neutral-305 pb-3 max-w-lg mx-auto">
                      {searchResult.studentName}
                    </h1>
                  </div>

                  {/* Description of Course */}
                  <div className="max-w-xl mx-auto text-sm text-neutral-600 leading-relaxed font-sans space-y-2">
                    <p>
                      for successfully enrolling, executing, and submitting the industry-standard project portfolio in
                    </p>
                    <p className="text-base font-bold text-neutral-800 font-serif">
                      {searchResult.internshipTitle}
                    </p>
                    <p className="text-xs text-neutral-550 font-mono">
                      Duration: {searchResult.durationMonths} {searchResult.durationMonths === 1 ? 'Month' : 'Months'} of Project-Based Submission Deadlines
                    </p>
                  </div>

                  {/* Dates and Signatures Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto border-t border-neutral-100">
                    {/* Completion Date */}
                    <div className="text-center space-y-1">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">Completion Date</div>
                      <div className="text-xs font-bold text-neutral-800 font-mono">
                        {new Date(searchResult.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Official Gold Seal Placement */}
                    <div className="flex flex-col items-center justify-center -mt-4">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border-4 border-dashed border-amber-500 flex items-center justify-center shadow-lg relative transform rotate-12 animate-pulse">
                        <Award className="w-8 h-8 text-amber-600" />
                        <span className="absolute text-[8px] font-bold text-amber-800 font-mono tracking-tighter uppercase -bottom-1">
                          VERIFIED
                        </span>
                      </div>
                    </div>

                    {/* Authorized Digitally Sealed Signature */}
                    <div className="text-center space-y-1">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">Authorized Signature</div>
                      
                      {/* Interactive Sign */}
                      <div className="inline-block relative">
                        <span className="font-serif italic text-blue-800 font-bold text-sm tracking-wide block">
                          Deltaclause Certification Seal
                        </span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-6 border border-dashed border-emerald-500/20 rounded transform rotate-2 pointer-events-none uppercase text-[6px] flex items-center justify-center font-mono font-medium text-emerald-600">
                          Verified & Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-6 text-[10px] font-mono text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Authentic Certified Record</span>
                    </div>
                    <div className="flex items-center gap-1 bg-neutral-105 px-3 py-1.5 rounded-lg border border-neutral-150">
                      <span>Unique Cert ID:</span>
                      <strong className="text-neutral-700">{searchResult.id}</strong>
                      <button
                        onClick={() => handleCopy(searchResult.id)}
                        className="hover:text-blue-600 transition-colors cursor-pointer"
                        title="Copy Cert ID"
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-700" />}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* Certificate Not Found */
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-2 font-sans">
              <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
              <h4 className="text-red-700 dark:text-white font-bold tracking-tight">
                Certificate Could Not Be Verified
              </h4>
              <p className="text-xs text-slate-550 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                The provided certificate ID <code className="font-mono text-red-650 dark:text-red-400 px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-900 rounded">{certId}</code> does not match any official record in the system index registries. Double check spelling or make sure the payment for this enrollment is approved.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
