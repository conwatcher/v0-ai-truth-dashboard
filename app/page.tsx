"use client"

import { useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TruthMeter } from "@/components/truth-meter"
import { AgentButton } from "@/components/agent-button"
import { TopicSearch } from "@/components/topic-search"
import { AnalysisDisplay } from "@/components/analysis-display"

type Agent = "journalist" | "scientist" | "robot" | "futurist" | "bias-detector"

interface AnalysisResult {
  content: string
  score: number
  agent: string
  timestamp: string
}

const agents: Agent[] = ["scientist", "robot", "futurist", "bias-detector"]

export default function DashboardPage() {
  const [activeAgent, setActiveAgent] = useState<Agent>("journalist")
  const [currentTopic, setCurrentTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [truthScore, setTruthScore] = useState(0)
  
  // Store results for each agent
  const [results, setResults] = useState<Record<string, AnalysisResult | null>>({
    journalist: null,
    scientist: null,
    robot: null,
    futurist: null,
    "bias-detector": null,
  })

  const analyzeWithAgent = useCallback(async (topic: string, agent: Agent) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, agent }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data: AnalysisResult = await response.json()
      return data
    } catch (error) {
      console.error(`[v0] Analysis error for ${agent}:`, error)
      return null
    }
  }, [])

  const handleSearch = async (topic: string) => {
    setCurrentTopic(topic)
    setIsLoading(true)
    setActiveAgent("journalist")
    
    // Clear previous results
    setResults({
      journalist: null,
      scientist: null,
      robot: null,
      futurist: null,
      "bias-detector": null,
    })

    // First, get the journalist analysis
    const journalistResult = await analyzeWithAgent(topic, "journalist")
    
    if (journalistResult) {
      setResults((prev) => ({ ...prev, journalist: journalistResult }))
      setTruthScore(journalistResult.score)
    }
    
    setIsLoading(false)
  }

  const handleAgentClick = async (agent: Agent) => {
    // If clicking the same agent, go back to journalist
    if (activeAgent === agent) {
      setActiveAgent("journalist")
      const journalistResult = results.journalist
      if (journalistResult) {
        setTruthScore(journalistResult.score)
      }
      return
    }

    setActiveAgent(agent)

    // If we already have results for this agent, just display them
    if (results[agent]) {
      setTruthScore(results[agent]!.score)
      return
    }

    // If we have a topic but no results for this agent, fetch them
    if (currentTopic) {
      setIsLoading(true)
      const result = await analyzeWithAgent(currentTopic, agent)
      
      if (result) {
        setResults((prev) => ({ ...prev, [agent]: result }))
        setTruthScore(result.score)
      }
      
      setIsLoading(false)
    }
  }

  const currentResult = results[activeAgent]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="p-4 lg:p-6">
        {/* Topic Search */}
        <div className="mb-6">
          <TopicSearch onSearch={handleSearch} isLoading={isLoading && activeAgent === "journalist"} />
        </div>

        {/* Truth-O-Meter */}
        <div className="mb-6">
          <TruthMeter value={truthScore} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Central Feed */}
          <div className="min-w-0">
            <AnalysisDisplay
              content={currentResult?.content || null}
              agent={activeAgent}
              isLoading={isLoading}
              score={currentResult?.score || 0}
            />
            
            {/* Show current topic */}
            {currentTopic && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Current Topic:</span> {currentTopic}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Analysis Agents
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Click an agent to see their perspective on the current topic.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {agents.map((agent) => (
                  <AgentButton
                    key={agent}
                    agent={agent}
                    isActive={activeAgent === agent}
                    onClick={() => handleAgentClick(agent)}
                    hasResult={!!results[agent]}
                  />
                ))}
              </div>
            </div>

            {/* Agent Results Summary */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Analysis Summary
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(["journalist", ...agents] as Agent[]).map((agent) => {
                  const result = results[agent]
                  return (
                    <button
                      key={agent}
                      onClick={() => {
                        if (result) {
                          setActiveAgent(agent)
                          setTruthScore(result.score)
                        }
                      }}
                      disabled={!result}
                      className="text-center p-3 rounded-lg bg-secondary/50 transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className={`text-lg font-bold ${result ? getScoreColor(result.score) : "text-muted-foreground"}`}>
                        {result ? `${result.score}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {agent.replace("-", " ")}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
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
