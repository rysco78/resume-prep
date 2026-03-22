"use client";

interface ResultCardProps {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  downloadUrl: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
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
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#64748b">
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
}: ResultCardProps) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tailored Resume Ready</h2>
          <p className="text-sm text-slate-500 mt-0.5">Optimized for ATS keyword matching</p>
        </div>
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

      {/* Body */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score */}
        <div className="flex flex-col items-center justify-center">
          <ScoreRing score={atsScore} />
        </div>

        {/* Matched keywords */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
            Matched Keywords ({matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing keywords */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3">
            Missing Keywords ({missingKeywords.length})
          </h3>
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">All key terms matched!</p>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Download link expires in 10 minutes. Files are automatically deleted from our servers after download.
        </p>
      </div>
    </div>
  );
}
