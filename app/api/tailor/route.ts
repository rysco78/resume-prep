import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parsers";
import { rewriteAndScore, refineAndScore } from "@/lib/claude/tailorResume";
import { buildDocx } from "@/lib/generator/buildDocx";
import { uploadDocx } from "@/lib/storage/s3Store";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json({ error: "Please paste a job description" }, { status: 400 });
    }

    // Step 1: Parse resume
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const rawResume = await parseResume(fileBuffer, file.name);

    if (!rawResume || rawResume.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from resume. Please check your file." },
        { status: 422 }
      );
    }

    // Step 3: Rewrite + score, retry until 80% or 3 attempts
    let { resume, ats, job, changes } = await rewriteAndScore(rawResume, jobDescription);

    const MAX_RETRIES = 3;
    let attempts = 1;
    while (ats.score < 80 && attempts < MAX_RETRIES) {
      console.log(`[tailor] ATS score ${ats.score}% — refining (attempt ${attempts + 1})`);
      ({ resume, ats, job, changes } = await refineAndScore(resume, jobDescription, ats.missingKeywords, ats.score));
      attempts++;
    }

    const jobTitle = job?.jobTitle || "Untitled Role";
    const companyName = job?.companyName || "";

    // Step 4: Generate DOCX and upload to S3
    const docxBuffer = await buildDocx(resume);
    const { key: s3Key, url: downloadUrl } = await uploadDocx(docxBuffer, jobTitle, companyName);

    return NextResponse.json({
      atsScore: ats.score,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      downloadUrl,
      s3Key,
      jobTitle,
      companyName,
      jobDescription,
      changes: changes ?? [],
    });
  } catch (err) {
    console.error("[/api/tailor]", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
