import { NextRequest, NextResponse } from "next/server";

const AGENT_PROMPTS: Record<string, string> = {
  journalist: `You are an Investigative Journalist agent in Truth-Seeker AI. Investigate the claim as a seasoned reporter would — check who is making it, what evidence exists, and what the most likely truth is. Write a compelling 4-5 sentence investigative summary. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. If the claim is false, score it low (0-20). If true, score it high (80-100). Example: "The moon landing was faked" = score 2. "The moon landing happened" = score 98. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS (not the evidence).`,
  scientist: `You are the Scientist agent in Truth-Seeker AI. Analyze the claim using empirical evidence and scientific consensus. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. If the claim says something false, give it a LOW score even if the surrounding science is interesting. Example: "The moon landing was faked" = score 3. "Vaccines cause autism" = score 2. "Water boils at 100C" = score 97. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
  robot: `You are the Logic AI agent in Truth-Seeker AI. Analyze the claim using pure logical reasoning. Check for internal consistency and logical fallacies. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated. A logically incoherent or false claim gets a LOW score. Example: "The moon landing was faked" = score 4. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
  futurist: `You are the Futurist agent in Truth-Seeker AI. Your job is NOT to judge truth — explore what this claim means for the future. If true, what consequences follow? If false, what does its existence reveal about current fears or trends? Give a compelling 3-4 sentence forward-looking analysis. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing the SIGNIFICANCE or IMPACT of this claim's implications (0 = trivial, 100 = world-changing).`,
  bias: `You are the Bias Detector agent in Truth-Seeker AI. Identify cognitive biases, emotional manipulation, political slant, or logical fallacies in the claim. Name the specific biases you find. Keep your analysis to 3-4 sentences. IMPORTANT: Your score must reflect the truthfulness of THE CLAIM ITSELF as stated — heavily biased or manipulative claims that are false should score LOW. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 representing how true THE CLAIM IS.`,
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
  const { agentId, query, url, comment } = await req.json();

  if (!agentId || (!query && !url)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const systemPrompt = AGENT_PROMPTS[agentId];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  let userMessage = "";

  if (url) {
    const urlContent = await fetchUrlContent(url);
    userMessage = `The user submitted this URL for analysis: ${url}${comment ? `\n\nUser's comment about this link: "${comment}"` : ""}\n\nHere is the content found at that URL:\n\n${urlContent}\n\nPlease analyze the truthfulness, credibility, and accuracy of the content at this link.`;
  } else {
    userMessage = `Analyze this claim: "${query}"`;
  }

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
      messages: [{ role: "user", content: userMessage }],
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
