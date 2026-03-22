import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { TailoredResume, AtsResult } from "./types";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-2",
});

// Claude 3.5 Sonnet on Bedrock — best model available with broad region support
const MODEL_ID = "us.anthropic.claude-sonnet-4-20250514-v1:0";

const REWRITE_SYSTEM = `You are an expert ATS resume writer and career coach. Rewrite a resume to maximize ATS keyword matching for a specific job description, then score the result.

OUTPUT FORMAT: Return ONLY valid JSON, no markdown, no explanation. The JSON must match this exact structure:
{
  "resume": {
    "contact": {
      "name": "Full Name",
      "city": "City",
      "state": "ST",
      "phone": "555-555-5555",
      "email": "email@example.com",
      "linkedin": "linkedin.com/in/profile"
    },
    "summary": "3 sentence professional summary mirroring exact language from the job description",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "experience": [
      {
        "company": "Company Name",
        "title": "Job Title",
        "city": "City",
        "state": "ST",
        "startDate": "Month YYYY",
        "endDate": "Month YYYY",
        "bullets": [
          "Achievement bullet starting with strong action verb with metric",
          "Achievement bullet starting with strong action verb with metric"
        ]
      }
    ],
    "education": [
      {
        "degree": "Full Degree Name, Major",
        "institution": "Institution Name"
      }
    ],
    "certifications": [
      {
        "name": "Certification Name",
        "issuingBody": "Issuing Organization",
        "year": "YYYY"
      }
    ]
  },
  "ats": {
    "score": 85,
    "matchedKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword3", "keyword4"]
  }
}

REWRITING RULES:
1. Contact: Extract from the original resume. Format LinkedIn as plain URL. Use "Month YYYY" format for all dates.
2. Summary: 3-4 sentences using EXACT language and keywords from the JD. This is prime ATS real estate — pack it with JD terminology.
3. Skills: Select the 8–12 most impactful skills from the JD that the candidate can plausibly claim. Prioritize the highest-frequency and most critical terms. Use EXACT JD terminology — not synonyms. Never include fewer than 8 or more than 12.
4. Experience: PRESERVE all job titles, companies, and dates EXACTLY as in the original. Aggressively rewrite every bullet point to incorporate the JD's exact keywords and phrases. Use 5-6 bullets per role. Each bullet should echo specific language from the JD where truthfully applicable. Lead with strong action verbs. Include metrics where possible.
5. Education: Spell out degrees fully. No GPA.
6. Certifications: Only include if present in the original resume.
7. NEVER invent credentials, companies, degrees, dates, or metrics not in the original resume.

SCORING RULES (for the "ats" field):
1. Extract all significant keywords from the JD (skills, tools, methodologies, titles, industry terms)
2. Check each against the rewritten resume content (case-insensitive)
3. score = (matched / total) * 100, rounded to nearest integer
4. matchedKeywords: top 15 matched, most important first
5. missingKeywords: top 10 missing that would most improve the score`;

async function invokeModel(system: string, userMessage: string, maxTokens: number): Promise<string> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);
  const parsed = JSON.parse(Buffer.from(response.body).toString());
  return parsed.content[0].text as string;
}

export async function rewriteAndScore(
  rawResume: string,
  jobDescription: string
): Promise<{ resume: TailoredResume; ats: AtsResult }> {
  const text = await invokeModel(
    REWRITE_SYSTEM,
    `ORIGINAL RESUME:\n${rawResume}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}\n\n---\n\nRewrite the resume and calculate the ATS score. Return only the JSON object.`,
    6000
  );

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as { resume: TailoredResume; ats: AtsResult };
}

export async function refineAndScore(
  previousResume: TailoredResume,
  jobDescription: string,
  missingKeywords: string[],
  currentScore: number
): Promise<{ resume: TailoredResume; ats: AtsResult }> {
  const text = await invokeModel(
    REWRITE_SYSTEM,
    `The resume below scored ${currentScore}% ATS match. It must reach at least 80%.

MISSING KEYWORDS that must be incorporated: ${missingKeywords.join(", ")}

Work through each missing keyword and weave it naturally into the summary, skills list, or experience bullets where truthfully applicable. Expand bullets if needed — there is no length limit.

CURRENT RESUME (JSON):
${JSON.stringify(previousResume, null, 2)}

---

JOB DESCRIPTION:
${jobDescription}

---

Return the improved resume with a new ATS score. Return only the JSON object.`,
    6000
  );

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model did not return valid JSON on refinement");

  return JSON.parse(jsonMatch[0]) as { resume: TailoredResume; ats: AtsResult };
}
