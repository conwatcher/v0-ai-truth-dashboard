"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TruthMeter } from "@/components/truth-meter"
import { AgentButton } from "@/components/agent-button"
import { QueryInput, type QueryData } from "@/components/query-input"
import { AnalysisDisplay, type AnalysisResult } from "@/components/analysis-display"

type Agent = "journalist" | "scientist" | "robot" | "futurist" | "bias-detector"

const agents: Agent[] = ["scientist", "robot", "futurist", "bias-detector"]

export default function DashboardPage() {
  const [activeAgent, setActiveAgent] = useState<Agent>("journalist")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [queryInfo, setQueryInfo] = useState<{
    type: "text" | "link" | "file" | "image"
    content: string
    fileName?: string
  } | null>(null)

  const handleSubmit = async (data: QueryData) => {
    setIsLoading(true)
    setActiveAgent("journalist")
    setResult(null)

    // Determine query type for display
    let queryType: "text" | "link" | "file" | "image" = "text"
    if (data.link) {
      queryType = "link"
    } else if (data.fileType?.startsWith("image/")) {
      queryType = "image"
    } else if (data.fileName) {
      queryType = "file"
    }

    setQueryInfo({
      type: queryType,
      content: data.link || data.question,
      fileName: data.fileName,
    })

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const analysisResult: AnalysisResult = await response.json()
      setResult(analysisResult)
    } catch (error) {
      console.error("[v0] Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgentClick = (agent: Agent) => {
    if (activeAgent === agent) {
      setActiveAgent("journalist")
    } else {
      setActiveAgent(agent)
    }
  }

  // Get current truth score based on active agent
  const getCurrentTruthScore = (): number => {
    if (!result) return 0
    const key = activeAgent === "bias-detector" ? "biasDetector" : activeAgent
    const perspective = result[key as keyof Omit<AnalysisResult, "overallTruthScore" | "timestamp">]
    return perspective?.truthScore || 0
  }

  // Check if agent has result
  const hasAgentResult = (agent: Agent): boolean => {
    if (!result) return false
    const key = agent === "bias-detector" ? "biasDetector" : agent
    return !!result[key as keyof Omit<AnalysisResult, "overallTruthScore" | "timestamp">]
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="p-4 lg:p-6">
        {/* Query Input */}
        <div className="mb-6">
          <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Truth-O-Meter */}
        <div className="mb-6">
          <TruthMeter value={getCurrentTruthScore()} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Central Feed */}
          <div className="min-w-0">
            <AnalysisDisplay
              result={result}
              activeAgent={activeAgent}
              isLoading={isLoading}
              queryInfo={queryInfo || undefined}
            />
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Analysis Agents
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Click an agent to see their perspective on the analysis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {agents.map((agent) => (
                  <AgentButton
                    key={agent}
                    agent={agent}
                    isActive={activeAgent === agent}
                    onClick={() => handleAgentClick(agent)}
                    hasResult={hasAgentResult(agent)}
                  />
                ))}
              </div>
            </div>

            {/* Agent Results Summary */}
            {result && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Analysis Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Overall Truth Score</span>
                    <span className={`text-xl font-bold ${getScoreColor(result.overallTruthScore)}`}>
                      {result.overallTruthScore}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["journalist", ...agents] as Agent[]).map((agent) => {
                      const key = agent === "bias-detector" ? "biasDetector" : agent
                      const perspective = result[key as keyof Omit<AnalysisResult, "overallTruthScore" | "timestamp">]
                      return (
                        <button
                          key={agent}
                          onClick={() => setActiveAgent(agent)}
                          className={`text-center p-2 rounded-lg transition-colors ${
                            activeAgent === agent
                              ? "bg-primary/20 ring-1 ring-primary"
                              : "bg-secondary/50 hover:bg-secondary"
                          }`}
                        >
                          <p className={`text-base font-bold ${getScoreColor(perspective?.truthScore || 0)}`}>
                            {perspective?.truthScore || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {agent.replace("-", " ")}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-primary"
  if (score >= 40) return "text-amber-500"
  return "text-destructive"
}
