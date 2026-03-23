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

Signed-in users can save tailored resumes and return later to view ATS scores, job details, and re-download their files.

---

## Output Format

The generated DOCX follows strict ATS best practices:

- **Font:** Helvetica 10pt throughout, 14pt name header
- **Layout:** Single column, no tables, no text boxes, no headers/footers
- **No graphics:** No icons, skill bars, or images
- **Section order:** Contact → Professional Summary → Core Competencies → Professional Experience → Education → Certifications
- **Experience format:** Company, title, location, and dates on separate lines followed by up to 3 achievement bullets per role
- **Skills:** Up to 12 pipe-delimited keywords drawn directly from the job description
- **Filename:** `Resume_Position-Title_Company-Name.docx`

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
  │     │   │                        resume JSON + ATS score + job info + changes summary
  │     │   └── refineAndScore()   — retry call that feeds missing keywords
  │     │                            back to Claude (up to 3 attempts until ≥80%)
  │     │
  │     ├─ lib/generator/buildDocx.ts
  │     │   └── Builds ATS-safe DOCX buffer using the `docx` npm package
  │     │
  │     └─ lib/storage/s3Store.ts
  │         └── Uploads DOCX to S3, returns 10-min pre-signed URL
  │
  ├─ POST /api/resumes          Save resume record to Supabase (auth required)
  ├─ GET  /api/resumes          List saved resumes for signed-in user
  ├─ DELETE /api/resumes?id=    Delete a saved resume record
  ├─ GET  /api/resumes/download?id=  Generate fresh pre-signed S3 URL for re-download
  │
  └─ GET {presigned-s3-url}    Direct download from S3 (no proxy route)
```

**AI Model:** Claude Sonnet 4 via AWS Bedrock (`us.anthropic.claude-sonnet-4-20250514-v1:0`)

**Key design decisions:**
- Rewrite, ATS scoring, job title/company extraction, and changes summary all happen in a **single Claude call** returning `{ resume, ats, job, changes }`
- The retry loop passes the previous resume JSON + missing keywords back to Claude so it knows exactly what to fix
- Files are **never stored on the server** — the DOCX goes straight to S3 and the pre-signed URL is returned to the client
- `pdf-parse` is pinned to v1 — v2 changed to a class-based API that breaks the simple function call pattern
- Supabase RLS is disabled — row-level security is enforced server-side via Clerk auth in the API routes

---

## Deployment

**Production:** Hosted on [Vercel](https://vercel.com) with AWS services for AI and storage, Clerk for auth, and Supabase for the database.

**Infrastructure:**
| Service | Purpose |
|---|---|
| Vercel | Next.js hosting, serverless API routes |
| AWS Bedrock (`us-east-2`) | Claude Sonnet 4 AI inference |
| AWS S3 (`us-east-2`, bucket: `resume-prep-files`) | Generated DOCX storage with pre-signed URLs |
| Clerk | User authentication (Google OAuth + email) |
| Supabase | PostgreSQL database for saved resume records |

**Vercel environment variables required:**
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
S3_BUCKET_NAME=resume-prep-files
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Auto-deploys on every push to `main`.

---

## Local Development

### Prerequisites

- Node.js 18+
- AWS account with:
  - IAM user with `AmazonBedrockFullAccess` + `AmazonS3FullAccess`
  - Bedrock model access enabled for Claude Sonnet 4
  - S3 bucket in `us-east-2` with CORS configured for GET requests
- Clerk account (development instance keys)
- Supabase project with a `saved_resumes` table

### Setup

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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
npm run dev -- --port 3119
```

Open `http://localhost:3119`.

### Supabase Table

```sql
create table saved_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  job_title text,
  company_name text,
  match_score integer,
  s3_key text not null,
  job_description text,
  job_url text,
  source text,
  created_at timestamptz default now()
);
```

### S3 CORS

Apply the included `s3-cors.json` to your bucket:
```bash
aws s3api put-bucket-cors --bucket resume-prep-files \
  --cors-configuration file://s3-cors.json \
  --region us-east-2
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel |
| AI | Claude Sonnet 4 via AWS Bedrock |
| Authentication | Clerk |
| Database | Supabase (PostgreSQL) |
| File Storage | Amazon S3 (pre-signed URLs) |
| DOCX Generation | `docx` npm package |
| Resume Parsing | `mammoth` (DOCX), `pdf-parse` v1 (PDF) |
| Styling | Tailwind CSS v4 + `next-themes` (dark mode) |
