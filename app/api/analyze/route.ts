// API route to forward requests to your external Truth-Seeker Agent

export interface AgentResponse {
  journalist: {
    content: string
    score: number
  }
  scientist: {
    content: string
    score: number
  }
  robot: {
    content: string
    score: number
  }
  futurist: {
    content: string
    score: number
  }
  biasDetector: {
    content: string
    score: number
  }
  overallScore: number
  timestamp: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, link, fileBase64, fileName, fileType } = body

    // Get the API key from environment variables
    const apiKey = process.env.TRUTH_SEEKER_API_KEY
    const apiUrl = process.env.TRUTH_SEEKER_API_URL

    if (!apiKey || !apiUrl) {
      return Response.json(
        { error: "Truth-Seeker API not configured. Please add TRUTH_SEEKER_API_KEY and TRUTH_SEEKER_API_URL environment variables." },
        { status: 500 }
      )
    }

    // Build the request payload for your agent
    const payload: Record<string, unknown> = {
      question,
    }

    if (link) {
      payload.link = link
    }

    if (fileBase64 && fileName) {
      payload.file = {
        data: fileBase64,
        name: fileName,
        type: fileType,
      }
    }

    // Call your external Truth-Seeker Agent API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Truth-Seeker API error:", errorText)
      return Response.json(
        { error: "Failed to get response from Truth-Seeker Agent" },
        { status: response.status }
      )
    }

    const data: AgentResponse = await response.json()

    // Return the full response from your agent
    return Response.json(data)

  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json(
      { error: "Failed to analyze request" },
      { status: 500 }
    )
  }
}
