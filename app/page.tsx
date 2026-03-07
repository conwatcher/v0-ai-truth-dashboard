"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TruthMeter } from "@/components/truth-meter"
import { AgentButton } from "@/components/agent-button"
import { JournalistFeed } from "@/components/journalist-feed"

const mockReports = [
  {
    id: "1",
    title: "New Study Reveals Climate Change Accelerating Faster Than Predicted",
    content:
      "A comprehensive analysis of global temperature data from over 50 research institutions indicates that current climate models may be underestimating the rate of warming by approximately 15-20%. Scientists urge immediate policy action.",
    source: "Nature Climate Research",
    timestamp: "2 hours ago",
    status: "verified" as const,
    truthScore: 94,
  },
  {
    id: "2",
    title: "Tech Giant Announces Revolutionary Quantum Computing Breakthrough",
    content:
      "Claims of achieving 1000-qubit quantum supremacy are being examined. Initial peer reviews suggest promising results, though independent verification is still pending from multiple academic institutions.",
    source: "TechCrunch",
    timestamp: "4 hours ago",
    status: "pending" as const,
    truthScore: 67,
  },
  {
    id: "3",
    title: "Viral Social Media Post Claims New Miracle Health Treatment",
    content:
      "A widely shared post claiming a new supplement can cure multiple diseases lacks scientific evidence. Medical experts warn against unverified health claims circulating on social platforms.",
    source: "Health Watch Network",
    timestamp: "6 hours ago",
    status: "flagged" as const,
    truthScore: 23,
  },
  {
    id: "4",
    title: "Economic Report Shows Mixed Signals for Global Markets",
    content:
      "Latest quarterly analysis presents nuanced findings about economic recovery patterns. While some sectors show strong growth, others continue to face significant headwinds from supply chain disruptions.",
    source: "Financial Times",
    timestamp: "8 hours ago",
    status: "verified" as const,
    truthScore: 88,
  },
]

const agents = ["scientist", "robot", "futurist", "bias-detector"] as const

export default function DashboardPage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [truthScore, setTruthScore] = useState(72)

  const handleAgentClick = (agent: string) => {
    if (activeAgent === agent) {
      setActiveAgent(null)
      setTruthScore(72)
    } else {
      setActiveAgent(agent)
      // Simulate different truth scores based on agent analysis
      const scores: Record<string, number> = {
        scientist: 78,
        robot: 85,
        futurist: 69,
        "bias-detector": 62,
      }
      setTruthScore(scores[agent] || 72)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="p-4 lg:p-6">
        {/* Truth-O-Meter */}
        <div className="mb-6">
          <TruthMeter value={truthScore} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Central Feed */}
          <div className="min-w-0">
            <JournalistFeed reports={mockReports} activeAgent={activeAgent} />
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Analysis Agents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {agents.map((agent) => (
                  <AgentButton
                    key={agent}
                    agent={agent}
                    isActive={activeAgent === agent}
                    onClick={() => handleAgentClick(agent)}
                  />
                ))}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Today&apos;s Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-foreground">47</p>
                  <p className="text-xs text-muted-foreground">Reports Analyzed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-emerald-500">38</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-amber-500">6</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-destructive">3</p>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
