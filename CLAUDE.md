# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- --port 3119   # Start dev server (always use port 3119)
npm run build                # Production build
npm run lint                 # ESLint
npx tsc --noEmit             # Type check without building
```

No test suite is configured.

## Environment

`.env.local` requires:
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
S3_BUCKET_NAME=resume-prep-files
```

## Architecture

**Single API route** (`app/api/tailor/route.ts`) orchestrates the entire flow:
1. Parse uploaded resume file → `lib/parsers/` (DOCX via mammoth, PDF via pdf-parse v1, TXT native)
2. Rewrite + ATS score in one Claude call → `lib/claude/tailorResume.ts`
3. Retry up to 3 times if ATS score < 80%, passing missing keywords back each attempt
4. Generate DOCX → `lib/generator/buildDocx.ts`
5. Upload to S3, return pre-signed URL → `lib/storage/s3Store.ts`

**AI layer** (`lib/claude/tailorResume.ts`): Uses AWS Bedrock (`us.anthropic.claude-sonnet-4-5-20251001-v1:0`) via `@aws-sdk/client-bedrock-runtime`. Both the resume rewrite and ATS scoring are done in a **single combined JSON response** with shape `{ resume: TailoredResume, ats: AtsResult }`. The retry path uses `refineAndScore()` which passes the previous resume JSON + missing keywords back to Claude.

**DOCX output** (`lib/generator/buildDocx.ts`): Strict ATS-safe format — Helvetica 11pt, no tables/graphics, single column. Section order is fixed: Contact → Professional Summary → Core Competencies → Professional Experience → Education → Certifications. Skills are hard-capped at 12.

**File storage**: No files are persisted to disk. Generated DOCXs are uploaded to S3 with a 10-minute pre-signed URL returned directly to the client. There is no `/api/download` route.

**Key constraints**:
- `pdf-parse` must stay at v1 (v2 has a breaking API change — no default export)
- `pdf-parse` and `mammoth` are in `serverExternalPackages` in `next.config.ts` to prevent Turbopack bundling issues with Node.js-only modules
- Bedrock region must match the S3 bucket region (`us-east-2`)
