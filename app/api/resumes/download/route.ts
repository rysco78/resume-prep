import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase/client";
import { getDownloadUrl } from "@/lib/storage/s3Store";

// GET /api/resumes/download?id=<resume_id>
// Verifies ownership then returns a fresh 10-min pre-signed URL
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await getSupabase()
    .from("saved_resumes")
    .select("s3_key")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = await getDownloadUrl(data.s3_key);
  return NextResponse.json({ url });
}
