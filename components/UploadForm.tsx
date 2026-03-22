"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

const SOURCES = [
  { value: "", label: "Select source…" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Indeed", label: "Indeed" },
  { value: "Dice", label: "Dice" },
  { value: "Glassdoor", label: "Glassdoor" },
  { value: "ZipRecruiter", label: "ZipRecruiter" },
  { value: "Company Website", label: "Company Website" },
  { value: "Other", label: "Other" },
];

interface UploadFormProps {
  onSubmit: (file: File, jobDescription: string, jobUrl: string, source: string) => void;
  isLoading: boolean;
}

const ACCEPTED = ".docx,.pdf,.txt";

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [source, setSource] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): boolean {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["docx", "pdf", "txt"].includes(ext ?? "")) {
      setFileError("Please upload a DOCX, PDF, or TXT file.");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError("File must be smaller than 10 MB.");
      return false;
    }
    setFileError("");
    return true;
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) setFile(dropped);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked && validateFile(picked)) setFile(picked);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return;
    onSubmit(file, jobDescription.trim(), jobUrl.trim(), source);
  }

  const canSubmit = !!file && jobDescription.trim().length > 50 && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* File drop zone */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Resume File <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
              : file
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950"
              : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-slate-400 hover:bg-white dark:hover:bg-slate-700"
          }`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleChange} className="hidden" />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(0)} KB — click to change</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drop your resume here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">DOCX, PDF, or TXT · Max 10 MB</p>
              </div>
            </div>
          )}
        </div>
        {fileError && <p className="mt-1.5 text-xs text-red-600">{fileError}</p>}
      </div>

      {/* Job Description */}
      <div>
        <label htmlFor="jobDescription" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-y"
          disabled={isLoading}
        />
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          Copy and paste the complete job description for the best keyword match
        </p>
      </div>

      {/* Job URL + Source — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jobUrl" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Job Posting URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="jobUrl"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Source <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
            disabled={isLoading}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
      >
        {isLoading ? "Tailoring your resume…" : "Tailor My Resume"}
      </button>
    </form>
  );
}
