"use client"

import { useState } from "react"

const AGENTS = [
  { id: "journalist", name: "Journalist", emoji: "📰", role: "Investigative Summary", color: "#34D399" },
  { id: "scientist", name: "Scientist", emoji: "🔬", role: "Empirical Analysis", color: "#38BDF8" },
  { id: "robot", name: "Logic AI", emoji: "🤖", role: "Logical Analysis", color: "#A78BFA" },
  { id: "futurist", name: "Futurist", emoji: "🚀", role: "Implications", color: "#F59E0B" },
  { id: "bias", name: "Bias Detector", emoji: "🎯", role: "Bias Analysis", color: "#F87171" },
]

const SCORE_LABEL: Record<string, string> = {
  journalist: "VERDICT",
  scientist: "TRUTH",
  robot: "TRUTH",
  futurist: "IMPACT",
  bias: "TRUTH",
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
      display: "inline-block",
      width: "18px", height: "18px",
      border: `2px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      verticalAlign: "middle",
      marginRight: "8px",
    }} />
  )
}

export default function TruthSeeker() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, { analysis: string; score: number }>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyze = async () => {
    if (!query.trim()) return
    setResults({})
    setOverallScore(null)
    setHasRun(true)
    setIsAnalyzing(true)
    const initLoading: Record<string, boolean> = {}
    AGENTS.forEach((a) => (initLoading[a.id] = true))
    setLoading(initLoading)
    const scores: number[] = []
    await Promise.all(
      AGENTS.map(async (agent) => {
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId: agent.id, query }),
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
  const totalCount = AGENTS.length
  const progressPct = hasRun ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = completedCount === totalCount

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
          <h1 style={{ fontSize: "52px", fontWeight: 900, fontFamily: "Georgia, serif", color: "#F8FAFC", margin: 0 }}>TRUTH-SEEKER AI</h1>
          <div style={{ marginTop: "12px", fontSize: "10px", color: "#334155", letterSpacing: "3px" }}>POWERED BY CLAUDE — REAL-TIME FACT VERIFICATION</div>
          <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#0F1A2B", border: "1px solid #1E3A5F", borderRadius: "100px", padding: "4px 16px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#4ADE80", letterSpacing: "2px" }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Input */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "16px", padding: "24px", marginBottom: "28px" }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Enter a claim to verify... e.g. "The moon landing was faked in 1969"'
            style={{ width: "100%", minHeight: "100px", background: "#080B14", border: "1px solid #1E2D45", borderRadius: "10px", color: "#CBD5E1", padding: "14px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
          />
          <div style={{ textAlign: "right", marginTop: "12px" }}>
            <button
              onClick={analyze}
              disabled={!query.trim() || isAnalyzing}
              style={{ background: query.trim() && !isAnalyzing ? "#F59E0B" : "#1A2030", color: query.trim() && !isAnalyzing ? "#080B14" : "#2D3A50", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "11px", letterSpacing: "3px", fontWeight: 900, cursor: query.trim() && !isAnalyzing ? "pointer" : "default", fontFamily: "inherit" }}
            >
              {isAnalyzing ? "INVESTIGATING..." : "▶ INVESTIGATE"}
            </button>
          </div>
        </div>

        {/* Overall progress bar */}
        {hasRun && !allDone && (
          <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={
