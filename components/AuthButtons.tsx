"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";

interface AuthButtonsProps {
  showMyResumes?: boolean;
}

export default function AuthButtons({ showMyResumes = true }: AuthButtonsProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <div className="w-20 h-8" />;

  return (
    <div className="flex items-center gap-2">
      {isSignedIn ? (
        <>
          {showMyResumes && (
            <a
              href="/resumes"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Resumes
            </a>
          )}
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <button className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Sign in
          </button>
        </SignInButton>
      )}
    </div>
  );
}
