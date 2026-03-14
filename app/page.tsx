"use client";

import { useEffect, useState, useRef } from "react";

// This part sends the visit to the counter
export default function Page() {
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

    return (
        <>
            <TruthSeeker />
        </>
    );
}

// TruthSeeker Component
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
            {/* Rest of the AgentCard functionality remains unchanged */}
        </div>
    );
}

function TruthSeeker() {
    const [activeTab, setActiveTab] = useState<"question" | "link">("question");
    const [query, setQuery] = useState("");
    const [url, setUrl] = useState("");
    const [comment, setComment] = useState("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageMediaType, setImageMediaType] = useState<string>("image/jpeg");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, { analysis: string; score: number }>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [overallScore, setOverallScore] = useState<number | null>(null);
    const [hasRun, setHasRun] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rest of the TruthSeeker functionality remains unchanged
    return <div>{/* TruthSeeker implementation */}</div>;
}
