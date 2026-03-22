# Resume Tailor

An AI-powered web application that rewrites your resume to maximize ATS (Applicant Tracking System) keyword match for a specific job. Upload your resume, paste a job description, and get back a fully rewritten, ATS-optimized DOCX ready to submit.

---

## What It Does

Most resumes are filtered out by ATS software before a human ever reads them. Resume Tailor solves this by:

1. Parsing your existing resume (DOCX, PDF, or TXT)
2. Analyzing the job description you paste in
3. Using Claude AI to rewrite the resume with the job's exact keywords and language — without changing your job titles, companies, or dates
4. Scoring the result against the job description and retrying until it hits **≥ 80% ATS match**
5. Delivering a properly formatted, ATS-safe DOCX file via a download link

---

## Output Format

The generated DOCX follows strict ATS best practices:

- **Font:** Helvetica 11pt throughout
- **Layout:** Single column, no tables, no text boxes, no headers/footers
- **No graphics:** No icons, skill bars, or images
- **Section order:** Contact → Professional Summary → Core Competencies → Professional Experience → Education → Certifications
- **Experience format:** Company, title, location, and dates on separate lines followed by 5–6 achievement bullets
- **Dates:** Month + 4-digit year everywhere (e.g. `July 2019 – March 2022`)
- **Skills:** 8–12 pipe-delimited keywords drawn directly from the job description

---

## Architecture

```
User (browser)
  │
  ├─ POST /api/tailor (multipart: resume file + job description text)
  │     │
  │     ├─ lib/parsers/        Parse resume → plain text
  │     │   ├── DOCX (mammoth)
  │     │   ├── PDF (pdf-parse v1)
  │     │   └── TXT (native)
  │     │
  │     ├─ lib/claude/tailorResume.ts
  │     │   ├── rewriteAndScore()  — single Bedrock call, returns rewritten
  │     │   │                        resume JSON + ATS score in one response
  │     │   └── refineAndScore()   — retry call that feeds missing keywords
  │     │                            back to Claude (up to 3 attempts until ≥80%)
  │     │
  │     ├─ lib/generator/buildDocx.ts
  │     │   └── Builds ATS-safe DOCX buffer using the `docx` npm package
  │     │
  │     └─ lib/storage/s3Store.ts
  │         └── Uploads DOCX to S3, returns 10-min pre-signed URL
  │
  └─ GET {presigned-s3-url}   Direct download from S3 (no proxy route)
```

**AI Model:** Claude Sonnet 4 via AWS Bedrock (`us.anthropic.claude-sonnet-4-20250514-v1:0`)

**Key design decisions:**
- Rewrite and ATS scoring happen in a **single Claude call** that returns `{ resume, ats }` — avoids inconsistency between two separate calls
- The retry loop passes the previous resume JSON + missing keywords back to Claude so it knows exactly what to fix
- Files are **never stored on the server** — the DOCX goes straight to S3 and the pre-signed URL is returned to the client
- `pdf-parse` is pinned to v1 — v2 changed to a class-based API that breaks the simple function call pattern

---

## Prerequisites

- Node.js 18+
- AWS account with:
  - IAM user with `AmazonBedrockFullAccess` + `AmazonS3FullAccess`
  - Bedrock model access enabled for Claude Sonnet 4
  - S3 bucket (e.g. `resume-prep-files`) in `us-east-2`

---

## Setup

```bash
git clone https://github.com/rysco78/resume-prep.git
cd resume-prep
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
S3_BUCKET_NAME=resume-prep-files
```

```bash
npm run dev -- --port 3119
```

Open `http://localhost:3119`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI | Claude Sonnet 4 via AWS Bedrock |
| File Storage | Amazon S3 (pre-signed URLs) |
| DOCX Generation | `docx` npm package |
| Resume Parsing | `mammoth` (DOCX), `pdf-parse` v1 (PDF) |
| Styling | Tailwind CSS |
