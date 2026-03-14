import { NextRequest, NextResponse } from "next/server";

const TEXT_PROMPTS: Record<string, string> = {
  journalist: `You are an Investigative Journalist agent in Truth-Seeker AI. Investigate the claim as a seasoned reporter would — check who is making it, what evidence exists, and what the most likely truth is. Write a compelling 4-5 sentence investigative summary. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. If the claim is false, score it low (0-20). If true, score it high (80-100). At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
  scientist: `You are the Scientist agent in Truth-Seeker AI. Analyze the claim using empirical evidence and scientific consensus. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. If the claim says something false, give it a LOW score. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
  robot: `You are the Logic AI agent in Truth-Seeker AI. Analyze the claim using pure logical reasoning. Check for internal consistency and logical fallacies. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
  futurist: `You are the Futurist agent in Truth-Seeker AI. Your job is NOT to judge truth — explore what this claim means for the future. If true, what consequences follow? If false, what does its existence reveal about current fears or trends? Give a compelling 3-4 sentence forward-looking analysis. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing the SIGNIFICANCE or IMPACT (0 = trivial, 100 = world-changing).`,
  bias: `You are the Bias Detector agent in Truth-Seeker AI. Identify cognitive biases, emotional manipulation, political slant, or logical fallacies in the claim. Name the specific biases you find. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
};

const IMAGE_PROMPTS: Record<string, string> = {
  journalist: `You are an Investigative Journalist agent in Truth-Seeker AI analyzing an image. Investigate this image as a seasoned reporter would — consider its context, what story it appears to tell, whether it seems authentic, and any red flags that suggest manipulation or misrepresentation. Write a compelling 4-5 sentence investigative summary. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how authentic and trustworthy this image appears (0 = clearly fake/manipulated, 100 = appears completely genuine).`,
  scientist: `You are the Scientist agent in Truth-Seeker AI analyzing an image. Examine this image for scientific and physical inconsistencies — look at lighting direction, shadow consistency, perspective accuracy, pixel artifacts, unnatural edges, cloning patterns, and any signs of AI generation such as distorted hands, unnatural backgrounds, or facial asymmetry. Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how physically authentic this image appears.`,
  robot: `You are the Logic AI agent in Truth-Seeker AI analyzing an image. Analyze this image with pure logical scrutiny — does everything in the scene make logical sense together? Are objects, people, and context internally consistent? Do proportions, scales, and spatial relationships add up? Look for anything that defies logical coherence. Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how logically consistent and authentic this image appears.`,
  futurist: `You are the Futurist agent in Truth-Seeker AI analyzing an image. Consider the broader implications of this image — if it is real, what does it mean? If it is manipulated or AI-generated, what does its existence and spread reveal about our information environment? What are the societal consequences of images like this circulating? Give a compelling 3-4 sentence forward-looking analysis. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing the SIGNIFICANCE or IMPACT of this image (0 = trivial, 100 = world-changing implications).`,
  bias: `You are the Bias Detector agent in Truth-Seeker AI analyzing an image. Examine this image for manipulative framing, selective cropping, emotional manipulation, misleading visual composition, or propaganda techniques. Consider what the image is trying to make the viewer feel or believe, and whether that framing appears honest or manipulative. Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how unbiased and honest the image's framing appears.`,
};

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TruthSeeker/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    return text || "Could not extract text content from this URL.";
  } catch {
    return "Could not fetch this URL. It may be unavailable or blocked.";
  }
}

export async function POST(req: NextRequest) {
  const { agentId, query, url, comment, imageBase64, imageMediaType } = await req.json();

  if (!agentId || (!query && !url && !imageBase64)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  let systemPrompt = "";
  let messageContent: unknown;

  if (imageBase64) {
    systemPrompt = IMAGE_PROMPTS[agentId];
    if (!systemPrompt) return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    messageContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageMediaType || "image/jpeg",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: "Please analyze this image thoroughly according to your role.",
      },
    ];
  } else if (url) {
    systemPrompt = TEXT_PROMPTS[agentId];
    if (!systemPrompt) return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    const urlContent = await fetchUrlContent(url);
    messageContent = `The user submitted this URL for analysis: ${url}${comment ? `\n\nUser's comment: "${comment}"` : ""}\n\nContent found at that URL:\n\n${urlContent}\n\nAnalyze the truthfulness and credibility of this content.`;
  } else {
    systemPrompt = TEXT_PROMPTS[agentId];
    if (!systemPrompt) return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    messageContent = `Analyze this claim: "${query}"`;
  }
systemPrompt = `Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. You are operating in real time.\n\n` + systemPrompt;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: messageContent }],
    }),
  });

  const data = await response.json();
  const fullText = (data.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");

  const scoreMatch = fullText.match(/\{"score":\s*(\d+)\}/);
  const score = scoreMatch ? Math.max(0, Math.min(100, parseInt(scoreMatch[1], 10))) : 50;
  const analysis = fullText.replace(/\{"score":\s*\d+\}/g, "").trim();

  return NextResponse.json({ analysis, score });
}
