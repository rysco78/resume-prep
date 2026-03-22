import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID ? "SET" : "NOT SET",
    APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY ? "SET" : "NOT SET",
    APP_AWS_REGION: process.env.APP_AWS_REGION ?? "NOT SET",
    AWS_REGION: process.env.AWS_REGION ?? "NOT SET",
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? "NOT SET",
  });
}
