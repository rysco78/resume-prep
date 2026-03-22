"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface ResultCardProps {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  downloadUrl: string;
  s3Key: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobUrl: string;
  source: string;
  changes: string[];
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="70" y="64" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
          {score}%
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="currentColor" className="text-slate-500 dark:text-slate-400">
          ATS Match
        </text>
      </svg>
      <p
        className="text-sm font-semibold"
        style={{ color }}
      >
        {score >= 80 ? "Excellent match" : score >= 60 ? "Good — a few gaps" : "Needs improvement"}
      </p>
    </div>
  );
}

export default function ResultCard({
  atsScore,
  matchedKeywords,
  missingKeywords,
  downloadUrl,
  s3Key,
  jobTitle,
  companyName,
  jobDescription,
  jobUrl,
  source,
  changes,
}: ResultCardProps) {
  const { isSignedIn } = useAuth();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, companyName, matchScore: atsScore, s3Key, jobDescription, jobUrl, source }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tailored Resume Ready</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Optimized for ATS keyword matching</p>
        </div>
        <div className="flex items-center gap-2">
          {isSignedIn && (
            <button
              onClick={handleSave}
              disabled={saveState === "saving" || saveState === "saved"}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                saveState === "saved"
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 cursor-default"
                  : saveState === "error"
                  ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {saveState === "saved" ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : saveState === "error" ? (
                "Try again"
              ) : saveState === "saving" ? (
                "Saving…"
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </>
              )}
            </button>
          )}
          <a
            href={downloadUrl}
            download="resume_tailored.docx"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download DOCX
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score */}
        <div className="flex flex-col items-center justify-center">
          <ScoreRing score={atsScore} />
        </div>

        {/* Matched keywords */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
            Matched Keywords ({matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing keywords */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
            Missing Keywords ({missingKeywords.length})
          </h3>
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">All key terms matched!</p>
          )}
        </div>
      </div>

      {/* What changed */}
      {changes.length > 0 && (
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            What was updated
          </h3>
          <ul className="flex flex-col gap-2">
            {changes.map((change, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer note */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Download link expires in 10 minutes. Files are automatically deleted from our servers after download.
        </p>
      </div>
    </div>
  );
}
