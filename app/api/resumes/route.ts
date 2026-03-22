import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase/client";

// GET /api/resumes — list saved resumes for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from("saved_resumes")
    .select("id, job_title, company_name, match_score, s3_key, job_description, job_url, source, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/resumes — save a tailored resume
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobTitle, companyName, matchScore, s3Key, jobDescription, jobUrl, source } = await request.json();

  if (!jobTitle || !matchScore || !s3Key) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("saved_resumes")
    .insert({
      user_id: userId,
      job_title: jobTitle,
      company_name: companyName ?? "",
      match_score: matchScore,
      s3_key: s3Key,
      job_description: jobDescription ?? "",
      job_url: jobUrl ?? "",
      source: source ?? "",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}

// DELETE /api/resumes?id=<resume_id>
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await getSupabase()
    .from("saved_resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
