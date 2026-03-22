"use client";

import AuthButtons from "@/components/AuthButtons";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  showMyResumes?: boolean;
}

export default function Header({ showMyResumes = true }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Resume Tailor
          </span>
        </a>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <AuthButtons showMyResumes={showMyResumes} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
