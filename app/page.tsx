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
          <h1 style={{ fontSize: "52px", fontWeight: 900, fontFamily: "Georgia, serif", color: "#F8FAFC", margin: 0 }}>TRUTH-SEEKER AI</h1>
          <div style={{ marginTop: "12px", fontSize: "10px", color: "#334155", letterSpacing: "3px" }}>POWERED BY CLAUDE — REAL-TIME FACT VERIFICATION</div>
          <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#0F1A2B", border: "1px solid #1E3A5F", borderRadius: "100px", padding: "4px 16px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#4ADE80", letterSpacing: "2px" }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Input Panel */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "16px", overflow: "hidden", marginBottom: "28px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1E2D45", background: "#080B14" }}>
            <button style={tabStyle("question")} onClick={() => setActiveTab("question")}>⬡ QUESTION</button>
            <button style={tabStyle("link")} onClick={() => setActiveTab("link")}>⬡ LINK / URL</button>
          </div>

          <div style={{ padding: "24px" }}>
            {activeTab === "question" && (
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Enter a claim to verify... e.g. "The moon landing was faked in 1969"'
                style={{ width: "100%", minHeight: "100px", background: "#080B14", border: "1px solid #1E2D45", borderRadius: "10px", color: "#CBD5E1", padding: "14px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
              />
            )}

            {activeTab === "link" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "9px", color: "#475569", letterSpacing: "2px", marginBottom: "6px" }}>URL TO ANALYZE</div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article-or-post"
                    style={{ width: "100%", background: "#080B14", border: "1px solid #1E2D45", borderRadius: "10px", color: "#CBD5E1", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#475569", letterSpacing: "2px", marginBottom: "6px" }}>YOUR COMMENT <span style={{ color: "#2D3A50" }}>(OPTIONAL — tell us what concerned you about this link)</span></div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder='e.g. "This article claims vaccines cause autism — is this true?"'
                    style={{ width: "100%", minHeight: "80px", background: "#080B14", border: "1px solid #1E2D45", borderRadius: "10px", color: "#CBD5E1", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: "12px" }}>
              <button
                onClick={analyze}
                disabled={!canSubmit || isAnalyzing}
                style={{ background: canSubmit && !isAnalyzing ? "#F59E0B" : "#1A2030", color: canSubmit && !isAnalyzing ? "#080B14" : "#2D3A50", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "11px", letterSpacing: "3px", fontWeight: 900, cursor: canSubmit && !isAnalyzing ? "pointer" : "default", fontFamily: "inherit" }}
              >
                {isAnalyzing ? "INVESTIGATING..." : "▶ INVESTIGATE"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {hasRun && !allDone && (
          <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Spinner color="#F59E0B" />
                <span style={{ fontSize: "10px", color: "#F59E0B", letterSpacing: "3px" }}>AGENTS INVESTIGATING...</span>
              </div>
              <span style={{ fontSize: "11px", color: "#475569" }}>{completedCount} / {totalCount} complete</span>
            </div>
            <div style={{ height: "6px", background: "#0F1A2B", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "#F59E0B", borderRadius: "3px", transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", gap: "6px" }}>
              {ALL_AGENTS.map((agent) => (
                <div key={agent.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "14px", marginBottom: "2px" }}>{agent.emoji}</div>
                  <div style={{ width: "100%", height: "3px", borderRadius: "2px", background: results[agent.id] ? agent.color : loading[agent.id] ? agent.color + "40" : "#1E2D45", transition: "background 0.3s" }} />
                  <div style={{ fontSize: "8px", color: results[agent.id] ? agent.color : "#2D3A50", marginTop: "3px", letterSpacing: "1px" }}>
                    {results[agent.id] ? "DONE" : loading[agent.id] ? "..." : "WAIT"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Truth-O-Meter */}
        {allDone && overallScore !== null && (
          <div style={{ background: "#0D1220", border: `1px solid ${getScoreColor(overallScore)}40`, borderRadius: "16px", padding: "28px", marginBottom: "28px", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "4px", marginBottom: "16px" }}>◈ TRUTH-O-METER ◈</div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: getScoreColor(overallScore), fontFamily: "Georgia, serif", lineHeight: 1 }}>{overallScore}<span style={{ fontSize: "36px", opacity: 0.6 }}>%</span></div>
            <div style={{ fontSize: "22px", letterSpacing: "6px", color: getScoreColor(overallScore), margin: "8px 0", fontWeight: 700 }}>{getVerdict(overallScore)}</div>
            <div style={{ height: "8px", background: "#0F1A2B", borderRadius: "4px", overflow: "hidden", marginTop: "16px" }}>
              <div style={{ height: "100%", width: `${overallScore}%`, background: getScoreColor(overallScore), borderRadius: "4px", transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "9px", color: "#2D3A50" }}>
              <span>FALSE</span><span>UNCERTAIN</span><span>TRUE</span>
            </div>
          </div>
        )}

        {/* Results */}
        {hasRun && (
          <div>
            <AgentCard agent={JOURNALIST} result={results[JOURNALIST.id]} isLoading={loading[JOURNALIST.id]} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#1E2D45" }} />
              <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "3px", whiteSpace: "nowrap" }}>◈ SPECIALIST ANALYSIS ◈</div>
              <div style={{ flex: 1, height: "1px", background: "#1E2D45" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {SPECIALISTS.map((agent) => (
                <AgentCard key={agent.id} agent={agent} result={results[agent.id]} isLoading={loading[agent.id]} />
              ))}
            </div>
          </div>
        )}

        {!hasRun && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#1E2D45" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>◈</div>
            <div style={{ fontSize: "11px", letterSpacing: "3px" }}>SUBMIT A CLAIM OR LINK TO BEGIN ANALYSIS</div>
            <div style={{ fontSize: "10px", color: "#172030", letterSpacing: "1px", marginTop: "8px" }}>THE JOURNALIST WILL GIVE YOU THE SUMMARY — SPECIALISTS PROVIDE THE DETAIL</div>
          </div>
        )}

        <div style={{ marginTop: "50px", textAlign: "center", fontSize: "10px", color: "#1E2D45", letterSpacing: "2px" }}>TRUTH-SEEKER AI — POWERED BY CLAUDE</div>
      </div>
    </div>
  )
}
