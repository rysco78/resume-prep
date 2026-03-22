import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-2",
  followRegionRedirects: true,
});
const BUCKET = process.env.S3_BUCKET_NAME!;
const EXPIRES_IN = 600; // 10 minutes

function buildFilename(jobTitle: string, companyName: string): string {
  const sanitize = (s: string) =>
    s.trim().replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-");
  const parts = ["Resume", sanitize(jobTitle), sanitize(companyName)].filter(Boolean);
  return parts.join("_") + ".docx";
}

export async function uploadDocx(
  buffer: Buffer,
  jobTitle = "",
  companyName = ""
): Promise<{ key: string; url: string }> {
  const key = `resumes/${uuidv4()}.docx`;
  const filename = buildFilename(jobTitle, companyName);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ContentDisposition: `attachment; filename="${filename}"`,
    })
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: EXPIRES_IN }
  );

  return { key, url };
}

export async function getDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: EXPIRES_IN }
  );
}
