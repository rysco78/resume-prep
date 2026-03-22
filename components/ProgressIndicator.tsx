"use client";

export type Step = {
  label: string;
  status: "pending" | "active" | "done" | "error";
};

export default function ProgressIndicator({ steps }: { steps: Step[] }) {
  return (
    <div className="w-full">
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            {/* Icon */}
            <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
              {step.status === "done" && (
                <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              {step.status === "active" && (
                <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </span>
              )}
              {step.status === "error" && (
                <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              {step.status === "pending" && (
                <span className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                </span>
              )}
            </span>

            {/* Label */}
            <span
              className={`text-sm font-medium ${
                step.status === "done"
                  ? "text-emerald-700"
                  : step.status === "active"
                  ? "text-blue-700"
                  : step.status === "error"
                  ? "text-red-600"
                  : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
