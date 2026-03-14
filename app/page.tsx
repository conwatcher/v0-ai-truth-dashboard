"use client";

import { useEffect, useState, useRef } from "react";

// Main Page component that includes the visit counter and TruthSeeker
export default function Page() {
    // This part sends the visit to the counter
    useEffect(() => {
        async function logVisit() {
            try {
                await fetch('/api/counter', { method: 'POST' });
            } catch (error) {
                console.error('Failed to update visit count:', error);
            }
        }
        logVisit();
    }, []);

    return <TruthSeeker />;
}

// Constants and Helper Functions
const JOURNALIST = { id: "journalist", name: "Journalist", emoji: "📰", role: "Investigative Summary", color: "#34D399" };
const SPECIALISTS = [
    { id: "scientist", name: "Scientist", emoji: "🔬", role: "Empirical Analysis", color: "#38BDF8" },
    { id: "robot", name: "Logic AI", emoji: "🤖", role: "Logical Analysis", color: "#A78BFA" },
    { id: "futurist", name: "Futurist", emoji: "🚀", role: "Implications", color: "#F59E0B" },
    { id: "bias", name: "Bias Detector", emoji: "🎯", role: "Bias Analysis", color: "#F87171" },
];
const ALL_AGENTS = [JOURNALIST, ...SPECIALISTS];

const SCORE_LABEL: Record<string, string> = {
    journalist: "VERDICT",
    scientist: "TRUTH",
    robot: "TRUTH",
    futurist: "IMPACT",
    bias: "TRUTH",
};

function getScoreColor(score: number) {
    if (score < 25) return "#F87171";
    if (score < 45) return "#FB923C";
    if (score < 60) return "#FBBF24";
    if (score < 80) return "#A3E635";
    return "#4ADE80";
}

function getVerdict(score: number) {
    if (score < 20) return "FALSE";
    if (score < 40) return "LIKELY FALSE";
    if (score < 60) return "UNCERTAIN";
    if (score < 80) return "LIKELY TRUE";
    return "TRUE";
}

// Spinner Component
function Spinner({ color }: { color: string }) {
    return (
        <span
            style={{
                display: "inline-block",
                width: "18px",
                height: "18px",
                border: `2px solid ${color}30`,
                borderTop: `2px solid ${color}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                verticalAlign: "middle",
                marginRight: "8px",
            }}
        />
    );
}

// AgentCard Component
function AgentCard({
    agent,
    result,
    isLoading,
}: {
    agent: typeof JOURNALIST;
    result: { analysis: string; score: number } | undefined;
    isLoading: boolean;
}) {
    return (
        <div
            style={{
                background: "#0D1220",
                border: `1px solid ${result ? agent.color + "30" : "#1E2D45"}`,
                borderRadius: "14px",
                padding: "20px",
                transition: "border-color 0.4s",
                animation: result ? "fadeIn 0.4s ease" : undefined,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "40px", height: "40px", background: agent.color, borderRadius: "8px" }}>
                        <span>{agent.emoji}</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: "bold", color: agent.color }}>{agent.name}</div>
                        <div style={{ fontSize: "12px", color: "gray" }}>{agent.role}</div>
                    </div>
                </div>
                {result && (
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(result.score) }}>
                            {result.score}
                        </div>
                        <div style={{ fontSize: "12px", color: "gray" }}>{SCORE_LABEL[agent.id]}</div>
                    </div>
                )}
            </div>
            {isLoading && <Spinner color={agent.color} />}
            {!isLoading && result && <p>{result.analysis}</p>}
        </div>
    );
}

// TruthSeeker Component
function TruthSeeker() {
    const [activeTab, setActiveTab] = useState<"question" | "link">("question");
    const [query, setQuery] = useState("");
    const [url, setUrl] = useState("");
    const [comment, setComment] = useState("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, { analysis: string; score: number }>>({});
    const [overallScore, setOverallScore] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleTabChange(tab: "question" | "link") {
        setActiveTab(tab);
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ color: "white" }}>TruthSeeker AI</h1>
            <p>Verify a claim or analyze a link below.</p>

            <div>
                <button onClick={() => handleTabChange("question")}>Question</button>
                <button onClick={() => handleTabChange("link")}>Link</button>
            </div>

            {activeTab === "question" && (
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your question"
                />
            )}

            {activeTab === "link" && (
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter a URL"
                />
            )}

            <div>
                <button
                    onClick={() => {
                        // Trigger analysis logic
                        console.log("Analyze button clicked!");
                    }}
                >
                    Analyze
                </button>
            </div>
        </div>
    );
}
