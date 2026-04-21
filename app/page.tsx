"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ProgressIndicator, { Step } from "@/components/ProgressIndicator";
import ResultCard from "@/components/ResultCard";
import Header from "@/components/Header";

interface TailorResult {
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

const INITIAL_STEPS: Step[] = [
  { label: "Parsing resume", status: "pending" },
  { label: "Fetching job description", status: "pending" },
  { label: "Rewriting with AI", status: "pending" },
  { label: "Generating document", status: "pending" },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setStep(index: number, status: Step["status"]) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s))
    );
  }

  async function handleSubmit(file: File, jobDescription: string, jobUrl: string, source: string) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSteps(INITIAL_STEPS);

    setStep(0, "active");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);

    // Simulate step progression while the API call is in flight
    const t1 = setTimeout(() => {
      setStep(0, "done");
      setStep(1, "active");
    }, 1500);
    const t2 = setTimeout(() => {
      setStep(1, "done");
      setStep(2, "active");
    }, 4000);
    const t3 = setTimeout(() => {
      setStep(2, "done");
      setStep(3, "active");
    }, 18000);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await response.json();

      if (!response.ok) {
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: s.status === "active" ? "error" : s.status,
          }))
        );
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSteps([
        { label: "Parsing resume", status: "done" },
        { label: "Fetching job description", status: "done" },
        { label: "Rewriting with AI", status: "done" },
        { label: "Generating document", status: "done" },
      ]);

      setResult({ ...(data as TailorResult), jobUrl, source });
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setError("Network error — please check your connection and try again.");
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: s.status === "active" ? "error" : "pending",
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Get past the robots.{" "}
            <span className="text-blue-600">Land the interview.</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Upload your resume and a job posting URL. We&apos;ll rewrite your resume to
            target 80%+ ATS keyword match and deliver it as a recruiter-ready DOCX.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "ATS keyword optimization",
              "Optimized for Workday applications",
              "Claude-powered rewrite",
              "Instant DOCX download",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Upload form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">
                Upload &amp; Tailor
              </h2>
              <UploadForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isLoading && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Processing…
                </h3>
                <ProgressIndicator steps={steps} />
              </div>
            )}

            {!isLoading && !result && (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    How it works
                  </h3>
                  <ol className="flex flex-col gap-4">
                    {[
                      {
                        num: "1",
                        title: "Upload your resume",
                        desc: "DOCX, PDF, or plain text — we handle all formats.",
                      },
                      {
                        num: "2",
                        title: "Paste the job description",
                        desc: "Copy and paste the full job posting text.",
                      },
                      {
                        num: "3",
                        title: "AI rewrites your resume",
                        desc: "Claude mirrors the job's exact keywords and language.",
                      },
                      {
                        num: "4",
                        title: "Download & apply",
                        desc: "Get an ATS-safe DOCX ready to submit in seconds.",
                      },
                    ].map((s) => (
                      <li key={s.num} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                          {s.num}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {s.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-3">
                    ATS-Safe Output Format
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {[
                      "Helvetica 11pt, single column",
                      "No tables, text boxes, or graphics",
                      "Standardized resume structure",
                      "Max 2 pages",
                      "Optimized for Workday parsing",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-5 py-4 flex gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Something went wrong
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <ResultCard
            atsScore={result.atsScore}
            matchedKeywords={result.matchedKeywords}
            missingKeywords={result.missingKeywords}
            downloadUrl={result.downloadUrl}
            s3Key={result.s3Key}
            jobTitle={result.jobTitle}
            companyName={result.companyName}
            jobDescription={result.jobDescription}
            jobUrl={result.jobUrl}
            source={result.source}
            changes={result.changes}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
            Resume Tailor &copy; 2026 Ryan R. Scott | All Rights Reserved
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-right">
            Powered by Claude Sonnet 4
          </p>
        </div>
      </footer>
    </div>
  );
}
