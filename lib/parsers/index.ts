import { parseDocx } from "./parseDocx";
import { parsePdf } from "./parsePdf";
import { parseTxt } from "./parseTxt";

export async function parseResume(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "docx":
      return parseDocx(buffer);
    case "pdf":
      return parsePdf(buffer);
    case "txt":
      return parseTxt(buffer);
    default:
      throw new Error(`Unsupported file type: .${ext}. Please upload a DOCX, PDF, or TXT file.`);
  }
}
