import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  LevelFormat,
} from "docx";
import type { TailoredResume } from "../claude/types";

const FONT = "Helvetica";
const FONT_SIZE = 20; // half-points (10pt * 2)
const FONT_SIZE_NAME = 28; // 14pt for name
const FONT_SIZE_SECTION = 20; // 10pt section headers (bold)

function text(content: string, opts: { bold?: boolean; size?: number } = {}): TextRun {
  return new TextRun({
    text: content,
    font: FONT,
    size: opts.size ?? FONT_SIZE,
    bold: opts.bold ?? false,
  });
}

function para(
  runs: TextRun | TextRun[],
  opts: { spacing?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}
): Paragraph {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    alignment: opts.alignment ?? AlignmentType.LEFT,
    spacing: { line: 276, after: opts.spacing ?? 60 }, // 1.15 line spacing
  });
}

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT,
        size: FONT_SIZE_SECTION,
        bold: true,
      }),
    ],
    border: {
      bottom: { color: "000000", size: 6, space: 1, style: "single" },
    },
    spacing: { before: 390, after: 100 },
  });
}

function bullet(content: string): Paragraph {
  return new Paragraph({
    children: [text(content)],
    bullet: { level: 0 },
    spacing: { line: 276, after: 40 },
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [text("")], spacing: { after: 100 } });
}

export async function buildDocx(resume: TailoredResume): Promise<Buffer> {
  const { contact, summary, skills, experience, education, certifications } = resume;

  const sections: Paragraph[] = [];

  // ── Contact Block ──────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contact.name,
          font: FONT,
          size: FONT_SIZE_NAME,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
    })
  );

  const contactLine = [contact.city, contact.state]
    .filter(Boolean)
    .join(", ")
    .concat(
      [contact.phone, contact.email, contact.linkedin]
        .filter(Boolean)
        .map((v) => ` | ${v}`)
        .join("")
    );

  sections.push(
    new Paragraph({
      children: [text(contactLine)],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // ── Professional Summary ───────────────────────────────────────────
  sections.push(sectionHeader("Professional Summary"));
  sections.push(para(text(summary), { spacing: 120 }));

  // ── Core Competencies ─────────────────────────────────────────────
  sections.push(sectionHeader("Core Competencies"));
  sections.push(para(text(skills.slice(0, 12).join(" | ")), { spacing: 120 }));

  // ── Professional Experience ────────────────────────────────────────
  sections.push(sectionHeader("Professional Experience"));

  for (const job of experience) {
    sections.push(para(text(job.company, { bold: true }), { spacing: 20 }));
    sections.push(para(text(job.title, { bold: true }), { spacing: 20 }));
    sections.push(
      para(text([job.city, job.state].filter(Boolean).join(", ")), { spacing: 20 })
    );
    sections.push(
      para(text(`${job.startDate} – ${job.endDate}`), { spacing: 60 })
    );
    for (const b of job.bullets.slice(0, 3)) {
      sections.push(bullet(b));
    }
    sections.push(emptyLine());
  }

  // ── Education ─────────────────────────────────────────────────────
  sections.push(sectionHeader("Education"));
  for (const edu of education) {
    sections.push(para(text(edu.degree, { bold: true }), { spacing: 20 }));
    sections.push(para(text(edu.institution), { spacing: 120 }));
  }

  // ── Certifications ────────────────────────────────────────────────
  if (certifications && certifications.length > 0) {
    sections.push(sectionHeader("Certifications"));
    for (const cert of certifications) {
      const issuingAndYear = [cert.issuingBody, cert.year].filter(Boolean).join(" | ");
      sections.push(
        para(
          [
            text(cert.name, { bold: true }),
            ...(issuingAndYear ? [text(` | ${issuingAndYear}`)] : []),
          ],
          { spacing: 80 }
        )
      );
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
                },
                run: { font: FONT, size: FONT_SIZE },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
            },
          },
        },
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
