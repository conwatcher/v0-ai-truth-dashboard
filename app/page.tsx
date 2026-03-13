"use client"

import { useState } from "react"

const JOURNALIST = { id: "journalist", name: "Journalist", emoji: "📰", role: "Investigative Summary", color: "#34D399" }
const SPECIALISTS = [
  { id: "scientist", name: "Scientist", emoji: "🔬", role: "Empirical Analysis", color: "#38BDF8" },
  { id: "robot", name: "Logic AI", emoji: "🤖", role: "Logical Analysis", color: "#A78BFA" },
  { id: "futurist", name: "Futurist", emoji: "🚀", role: "Implications", color: "#F59E0B" },
  { id: "bias", name: "Bias Detector", emoji: "🎯", role: "Bias Analysis", color: "#F87171" },
]
const ALL_AGENTS = [JOURNALIST, ...SPECIALISTS]

const SCORE_LABEL: Record<string, string> = {
  journalist: "VERDICT", scientist: "TRUTH", robot: "TRUTH", futurist: "IMPACT", bias: "TRUTH",
}

function getScoreColor(score: number) {
  if (score < 25) return "#F87171"
  if (score < 45) return "#FB923C"
  if (score < 60) return "#FBBF24"
  if (score < 80) return "#A3E635"
  return "#4ADE80"
}

function getVerdict(score: number) {
  if (score < 20) return "FALSE"
  if (score < 40) return "LIKELY FALSE"
  if (score < 60) return "UNCERTAIN"
  if (score < 80) return "LIKELY TRUE"
  return "TRUE"
}

function Spinner({ color }: { color: string }) {
  return (
    <span style={{
      display: "inline-block", width: "18px", height: "18px",
      border: `2px solid ${color}30`, borderTop: `2px solid ${color}`,
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
      verticalAlign: "middle", marginRight: "8px",
    }} />
  )
}

function AgentCard({ agent, result, isLoading }: {
  agent: typeof JOURNALIST,
  result: { analysis: string; score: number } | undefined,
  isLoading: boolean
}) {
  return (
    <div style={{
      background: "#0D1220",
      border: `1px solid ${result ? agent.color + "30" : "#1E2D45"}`,
      borderRadius: "14px", padding: "20px",
      transition: "border-color 0.4s",
      animation: result ? "fadeIn 0.4s ease" : undefined
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: agent.color + "15", border: `1px solid ${agent.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
            {agent.emoji}
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: agent.color }}>{agent.name.toUpperCase()}</div>
            <div style={{ fontSize: "10px", color: "#475569" }}>{agent.role}</div>
          </div>
        </div>
        {result && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: getScoreColor(result.score), fontFamily: "Georgia, serif" }}>{result.score}</div>
            <div style={{ fontSize: "8px", letterSpacing: "1px", color: "#475569", marginTop: "2px" }}>{SCORE_LABEL[agent.id]}</div>
          </div>
        )}
      </div>
      <div style={{ fontSize: "13px", lineHeight: 1.7, color: "#94A3B8", minHeight: "70px", padding: "12px", background: "#080B14", borderRadius: "8px" }}>
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Spinner color={agent.color} />
            <span style={{ color: agent.color, fontSize: "10px", letterSpacing: "2px" }}>ANALYZING...</span>
          </div>
        )}
        {result && result.analysis}
        {!isLoading && !result && <span style={{ color: "#2D3A50" }}>Standing by...</span>}
      </div>
      {result && (
        <div style={{ marginTop: "10px", height: "3px", background: "#111827", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${result.score}%`, background: getScoreColor(result.score), borderRadius: "2px", transition: "width 1s ease" }} />
        </div>
      )}
    </div>
  )
}

export default function TruthSeeker() {
  const [activeTab, setActiveTab] = useState<"question" | "link">("question")
  const [query, setQuery] = useState("")
  const [url, setUrl] = useState("")
  const [comment, setComment] = useState("")
  const [results, setResults] = useState<Record<string, { analysis: string; score: number }>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const canSubmit = activeTab === "question" ? query.trim().length > 0 : url.trim().length > 0

  const analyze = async () => {
    if (!canSubmit) return
    setResults({})
    setOverallScore(null)
    setHasRun(true)
    setIsAnalyzing(true)
    const initLoading: Record<string, boolean> = {}
    ALL_AGENTS.forEach((a) => (initLoading[a.id] = true))
    setLoading(initLoading)
    const scores: number[] = []

    await Promise.all(
      ALL_AGENTS.map(async (agent) => {
        try {
          const body = activeTab === "question"
            ? { agentId: agent.id, query }
            : { agentId: agent.id, url, comment }

          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
          const data = await res.json()
          setResults((prev) => ({ ...prev, [agent.id]: data }))
          if (agent.id !== "futurist") scores.push(data.score ?? 50)
        } catch {
          setResults((prev) => ({ ...prev, [agent.id]: { analysis: "Analysis failed. Please try again.", score: 50 } }))
          if (agent.id !== "futurist") scores.push(50)
        } finally {
          setLoading((prev) => ({ ...prev, [agent.id]: false }))
        }
      })
    )
    setOverallScore(Math.round(scores.reduce((s, v) => s + v, 0) / scores.length))
    setIsAnalyzing(false)
  }

  const completedCount = Object.keys(results).length
  const totalCount = ALL_AGENTS.length
  const progressPct = hasRun ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = completedCount === totalCount

  const tabStyle = (tab: "question" | "link") => ({
    padding: "12px 24px", background: "transparent", border: "none",
    borderBottom: activeTab === tab ? "2px solid #F59E0B" : "2px solid transparent",
    color: activeTab === tab ? "#F59E0B" : "#475569",
    fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
    fontFamily: "inherit", fontWeight: 700, transition: "all 0.2s",
  })

  return (
    <div style={{ minHeight: "100vh", background: "#080B14", color: "#CBD5E1", fontFamily: "'Courier New', monospace", padding: "40px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#F59E0B", letterSpacing: "5px", marginBottom: "10px" }}>◈ MULTI-AGENT TRUTH VERIFICATION SYSTEM ◈</div>
