import * as cheerio from "cheerio";

export async function scrapeJob(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job posting: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise elements
  $("nav, header, footer, script, style, noscript, aside, iframe, [aria-hidden='true']").remove();
  $("[class*='nav'], [class*='header'], [class*='footer'], [class*='cookie'], [class*='banner']").remove();
  $("[id*='nav'], [id*='header'], [id*='footer'], [id*='cookie'], [id*='banner']").remove();

  // Try to find the main job content
  const selectors = [
    "[class*='job-description']",
    "[class*='jobDescription']",
    "[class*='job_description']",
    "[class*='description']",
    "[data-testid*='job']",
    "main",
    "article",
    "#job-content",
    ".job-content",
  ];

  let text = "";
  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length && el.text().trim().length > 200) {
      text = el.text();
      break;
    }
  }

  // Fallback: grab body text
  if (!text || text.length < 200) {
    text = $("body").text();
  }

  // Clean up whitespace
  const cleaned = text
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Cap at ~6000 chars to stay within token limits
  return cleaned.slice(0, 6000);
}
