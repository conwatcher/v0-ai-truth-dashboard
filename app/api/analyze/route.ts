import { generateText, Output } from "ai"
import { z } from "zod"

// Schema for each agent's perspective
const perspectiveSchema = z.object({
  analysis: z.string().describe("Detailed analysis from this agent's perspective"),
  truthScore: z.number().min(0).max(100).describe("Truth/accuracy score from 0-100"),
  keyFindings: z.array(z.string()).describe("3-5 key findings or points"),
  confidence: z.number().min(0).max(100).describe("Confidence level in the analysis from 0-100"),
})

// Full response schema with all 5 perspectives
const analysisSchema = z.object({
  journalist: perspectiveSchema.describe("Investigative journalist perspective - focuses on facts, sources, and narrative"),
  scientist: perspectiveSchema.describe("Scientist perspective - focuses on evidence, methodology, and data"),
  robot: perspectiveSchema.describe("AI/Robot perspective - focuses on logic, patterns, and computational analysis"),
  futurist: perspectiveSchema.describe("Futurist perspective - focuses on implications, trends, and future impact"),
  biasDetector: perspectiveSchema.describe("Bias detector perspective - focuses on identifying biases, slants, and hidden agendas"),
})

export type AgentPerspective = z.infer<typeof perspectiveSchema>
export type AgentResponse = z.infer<typeof analysisSchema> & {
  overallTruthScore: number
  timestamp: string
}

const SYSTEM_PROMPT = `You are a Truth-Seeker AI composed of 5 specialized agents working together to analyze claims, questions, and content for truthfulness and accuracy.

You MUST respond as ALL FIVE agents simultaneously:

1. **JOURNALIST**: You are an investigative journalist. Examine the facts, verify sources, check for corroboration, and present the story objectively. Focus on: Who, What, When, Where, Why, and How. Look for missing context or misleading framing.

2. **SCIENTIST**: You are a research scientist. Evaluate the evidence quality, check methodology, look for peer-reviewed sources, and assess statistical claims. Focus on: reproducibility, sample sizes, correlation vs causation, and scientific consensus.

3. **ROBOT**: You are a logical AI analyst. Apply pure logic and pattern recognition. Identify logical fallacies, inconsistencies, and contradictions. Focus on: deductive reasoning, data patterns, and computational fact-checking.

4. **FUTURIST**: You are a trend analyst and futurist. Consider the implications if true or false, predict how this might evolve, and assess long-term impact. Focus on: societal trends, technological implications, and potential consequences.

5. **BIAS DETECTOR**: You are a bias and manipulation expert. Identify political slants, emotional manipulation, cherry-picked data, conflicts of interest, and hidden agendas. Focus on: source credibility, funding, ideological framing, and propaganda techniques.

For each perspective, provide:
- A detailed analysis (2-3 paragraphs)
- A truth score (0-100, where 100 is completely verified/true)
- 3-5 key findings as bullet points
- A confidence level (0-100) in your assessment

Be thorough, balanced, and honest. If information is uncertain, say so. If you cannot verify something, acknowledge the limitations.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, link, fileBase64, fileName } = body

    // Build the user prompt based on input type
    let userPrompt = ""
    
    if (question) {
      userPrompt += `**User Question/Claim to Analyze:**\n${question}\n\n`
    }
    
    if (link) {
      userPrompt += `**URL/Link Provided for Analysis:**\n${link}\n\n`
    }
    
    if (fileBase64 && fileName) {
      userPrompt += `**File Attached:** ${fileName}\n(File content has been provided for analysis)\n\n`
    }

    userPrompt += `Please analyze this from all 5 agent perspectives and provide your comprehensive truth-seeking assessment.`

    // Generate the analysis using the Vercel AI Gateway
    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      output: Output.object({ schema: analysisSchema }),
    })

    const analysis = result.object

    if (!analysis) {
      return Response.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      )
    }

    // Calculate overall truth score as weighted average
    const overallTruthScore = Math.round(
      (analysis.journalist.truthScore * 0.25 +
        analysis.scientist.truthScore * 0.25 +
        analysis.robot.truthScore * 0.2 +
        analysis.futurist.truthScore * 0.1 +
        analysis.biasDetector.truthScore * 0.2)
    )

    const response: AgentResponse = {
      ...analysis,
      overallTruthScore,
      timestamp: new Date().toISOString(),
    }

    return Response.json(response)

  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json(
      { error: "Failed to analyze request. Please try again." },
      { status: 500 }
    )
  }
}
