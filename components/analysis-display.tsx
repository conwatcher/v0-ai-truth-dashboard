"use client"

import { Newspaper, FlaskConical, Bot, Telescope, ShieldAlert, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisDisplayProps {
  content: string | null
  agent: string
  isLoading: boolean
  score: number
}

const agentConfig: Record<string, { icon: typeof Newspaper; label: string; color: string }> = {
  journalist: {
    icon: Newspaper,
    label: "Journalist Report",
    color: "text-primary",
  },
  scientist: {
    icon: FlaskConical,
    label: "Scientific Analysis",
    color: "text-emerald-500",
  },
  robot: {
    icon: Bot,
    label: "AI Logic Analysis",
    color: "text-sky-500",
  },
  futurist: {
    icon: Telescope,
    label: "Future Implications",
    color: "text-violet-500",
  },
  "bias-detector": {
    icon: ShieldAlert,
    label: "Bias Detection Report",
    color: "text-amber-500",
  },
}

function formatContent(content: string) {
  const lines = content.split('\n')
  return lines.map((line, index) => {
    // Headers (all caps with colon)
    if (/^[A-Z][A-Z\s]+:/.test(line.trim())) {
      return (
        <h3 key={index} className="font-semibold text-foreground mt-4 mb-2 first:mt-0">
          {line}
        </h3>
      )
    }
    // Bullet points
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      return (
        <li key={index} className="text-muted-foreground ml-4 mb-1">
          {line.replace(/^[-•]\s*/, '')}
        </li>
      )
    }
    // Regular paragraphs
    if (line.trim()) {
      return (
        <p key={index} className="text-muted-foreground mb-2">
          {line}
        </p>
      )
    }
    return null
  })
}

export function AnalysisDisplay({ content, agent, isLoading, score }: AnalysisDisplayProps) {
  const config = agentConfig[agent] || agentConfig.journalist
  const Icon = config.icon

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {agent === "journalist" ? "Researching topic..." : `Running ${config.label.toLowerCase()}...`}
          </p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-secondary p-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">No Analysis Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter a topic above and click &quot;Investigate&quot; to start the truth-seeking analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", config.color)} />
          <h2 className="font-semibold text-foreground">{config.label}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Score:</span>
          <span className={cn(
            "text-sm font-bold",
            score >= 80 && "text-emerald-500",
            score >= 60 && score < 80 && "text-primary",
            score >= 40 && score < 60 && "text-amber-500",
            score < 40 && "text-destructive"
          )}>
            {score}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-h-[600px] overflow-y-auto">
        <div className="prose prose-sm prose-invert max-w-none">
          {formatContent(content)}
        </div>
      </div>
    </div>
  )
}
