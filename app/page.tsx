"use client"

import { useState } from "react"

const AGENTS = [
  { id: "scientist", name: "Scientist", emoji: "🔬", role: "Empirical Analysis", color: "#38BDF8" },
  { id: "robot", name: "Logic AI", emoji: "🤖", role: "Logical Analysis", color: "#A78BFA" },
  { id: "futurist", name: "Futurist", emoji: "🚀", role: "Implications", color: "#F59E0B" },
  { id: "bias", name: "Bias Detector", emoji: "🎯", role: "Bias Analysis", color: "#F87171" },
]

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

export default function TruthSeeker() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, { analysis: string; score: number }>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [hasRun, setHasRun] = useState(false)

  const analyze = async () => {
    if (!query.trim()) return
    setResults({})
    setOverallScore(null)
    setHasRun(true)
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
          scores.push(data.score ?? 50)
        } catch {
          setResults((prev) => ({ ...prev, [agent.id]: { analysis: "Analysis failed. Please try again.", score: 50 } }))
          scores.push(50)
        } finally {
          setLoading((prev) => ({ ...prev, [agent.id]: false }))
        }
      })
    )
    setOverallScore(Math.round(scores.reduce((s, v) => s + v, 0) / scores.length))
  }

  const allDone = Object.keys(results).length === AGENTS.length

  return (
    <div style={{ minHeight: "100vh", background: "#080B14", color: "#CBD5E1", fontFamily: "'Courier New', monospace", padding: "40px 20px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#F59E0B", letterSpacing: "5px", marginBottom: "10px" }}>◈ MULTI-AGENT TRUTH VERIFICATION SYSTEM ◈</div>
          <h1 style={{ fontSize: "52px", fontWeight: 900, fontFamily: "Georgia, serif", color: "#F8FAFC", margin: 0 }}>TRUTH-SEEKER AI</h1>
          <div style={{ marginTop: "12px", fontSize: "10px", color: "#334155", letterSpacing: "3px" }}>POWERED BY CLAUDE — REAL-TIME FACT VERIFICATION</div>
          <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#0F1A2B", border: "1px solid #1E3A5F", borderRadius: "100px", padding: "4px 16px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
            <span style={{ fontSize: "10px", color: "#4ADE80", letterSpacing: "2px" }}>SYSTEM ONLINE</span>
          </div>
        </div>

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
              disabled={!query.trim()}
              style={{ background: query.trim() ? "#F59E0B" : "#1A2030", color: query.trim() ? "#080B14" : "#2D3A50", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "11px", letterSpacing: "3px", fontWeight: 900, cursor: query.trim() ? "pointer" : "default", fontFamily: "inherit" }}
            >
              ▶ INVESTIGATE
            </button>
          </div>
        </div>

        {allDone && overallScore !== null && (
          <div style={{ background: "#0D1220", border: `1px solid ${getScoreColor(overallScore)}40`, borderRadius: "16px", padding: "28px", marginBottom: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "4px", marginBottom: "16px" }}>◈ TRUTH-O-METER ◈</div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: getScoreColor(overallScore), fontFamily: "Georgia, serif", lineHeight: 1 }}>{overallScore}<span style={{ fontSize: "36px", opacity: 0.6 }}>%</span></div>
            <div style={{ fontSize: "22px", letterSpacing: "6px", color: getScoreColor(overallScore), margin: "8px 0", fontWeight: 700 }}>{getVerdict(overallScore)}</div>
            <div style={{ height: "8px", background: "#0F1A2B", borderRadius: "4px", overflow: "hidden", marginTop: "16px" }}>
              <div style={{ height: "100%", width: `${overallScore}%`, background: getScoreColor(overallScore), borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "9px", color: "#2D3A50" }}>
              <span>FALSE</span><span>UNCERTAIN</span><span>TRUE</span>
            </div>
          </div>
        )}

        {hasRun && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
            {AGENTS.map((agent) => {
              const result = results[agent.id]
              const isLoading = loading[agent.id]
              return (
                <div key={agent.id} style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: agent.color + "15", border: `1px solid ${agent.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{agent.emoji}</div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: agent.color }}>{agent.name.toUpperCase()}</div>
                        <div style={{ fontSize: "10px", color: "#475569" }}>{agent.role}</div>
                      </div>
                    </div>
                    {result && <div style={{ fontSize: "28px", fontWeight: 900, color: getScoreColor(result.score), fontFamily: "Georgia, serif" }}>{result.score}</div>}
                  </div>
                  <div style={{ fontSize: "13px", lineHeight: 1.7, color: "#94A3B8", minHeight: "70px", padding: "12px", background: "#080B14", borderRadius: "8px" }}>
                    {isLoading && <span style={{ color: agent.color }}>● Analyzing...</span>}
                    {result && result.analysis}
                    {!isLoading && !result && <span style={{ color: "#2D3A50" }}>Standing by...</span>}
                  </div>
                  {result && (
                    <div style={{ marginTop: "10px", height: "3px", background: "#111827", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${result.score}%`, background: getScoreColor(result.score), borderRadius: "2px" }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!hasRun && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#1E2D45" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>◈</div>
            <div style={{ fontSize: "11px", letterSpacing: "3px" }}>SUBMIT A CLAIM TO BEGIN ANALYSIS</div>
          </div>
        )}

        <div style={{ marginTop: "50px", textAlign: "center", fontSize: "10px", color: "#1E2D45", letterSpacing: "2px" }}>TRUTH-SEEKER AI — POWERED BY CLAUDE</div>
      </div>
    </div>
  )
}
