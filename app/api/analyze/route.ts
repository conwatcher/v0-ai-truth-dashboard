import { NextRequest, NextResponse } from "next/server";

const AGENT_PROMPTS: Record<string, string> = {
  journalist: `You are an Investigative Journalist agent in Truth-Seeker AI. Your role is to provide the overall summary verdict. Investigate the claim as a seasoned reporter would — check who is making it, what evidence exists, what experts say, and what the most likely truth is. Synthesize everything into a clear, compelling 4-5 sentence investigative summary that a reader could act on. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 truth confidence.`,
  scientist: `You are the Scientist agent in Truth-Seeker AI. Analyze claims using empirical evidence, scientific consensus, statistics, and verifiable data. Be rigorous and evidence-based. Keep your analysis to 3-4 clear sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 truth confidence.`,
  robot: `You are the Logic AI agent in Truth-Seeker AI. Analyze claims using pure logical reasoning. Check for internal consistency, logical fallacies, and whether conclusions follow from premises. Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 truth confidence.`,
  futurist: `You are the Futurist agent in Truth-Seeker AI. Analyze the broader implications of the claim. If true, what does it mean for society? If false, why does the narrative exist? Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 truth confidence.`,
  bias: `You are the Bias Detector agent in Truth-Seeker AI. Identify cognitive biases, emotional manipulation, political slant, or logical fallacies in the claim. Name the specific biases you find. Keep your analysis to 3-4 sentences. At the very end output ONLY this JSON on its own line: {"score": X} where X is 0-100 truth confidence.`,
};

export async function POST(req: NextRequest) {
  const { agentId, query } = await req.json();

  if (!agentId || !query) {
    return NextResponse.json({ error: "Missing agentId or query" }, { status: 400 });
  }

  const systemPrompt = AGENT_PROMPTS[agentId];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
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
      messages: [{ role: "user", content: `Analyze this claim: "${query}"` }],
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
