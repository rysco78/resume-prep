import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-2",
  followRegionRedirects: true,
});
const BUCKET = process.env.S3_BUCKET_NAME!;
const EXPIRES_IN = 600; // 10 minutes

export async function uploadDocx(buffer: Buffer): Promise<string> {
  const key = `resumes/${uuidv4()}.docx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ContentDisposition: 'attachment; filename="resume_tailored.docx"',
    })
  );

  // Generate a pre-signed URL — client downloads directly from S3
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: EXPIRES_IN }
  );

  return url;
}
