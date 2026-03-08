"use client"

import { Newspaper, FlaskConical, Bot, Telescope, ShieldAlert, Loader2, FileText, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AgentPerspective {
  analysis: string
  truthScore: number
  keyFindings: string[]
  confidence: number
}

export interface AnalysisResult {
  journalist: AgentPerspective
  scientist: AgentPerspective
  robot: AgentPerspective
  futurist: AgentPerspective
  biasDetector: AgentPerspective
  overallTruthScore: number
  timestamp: string
}

interface AnalysisDisplayProps {
  result: AnalysisResult | null
  activeAgent: "journalist" | "scientist" | "robot" | "futurist" | "bias-detector"
  isLoading: boolean
  queryInfo?: {
    type: "text" | "link" | "file" | "image"
    content: string
    fileName?: string
  }
}

const agentConfig: Record<string, { icon: typeof Newspaper; label: string; color: string; description: string }> = {
  journalist: {
    icon: Newspaper,
    label: "Journalist Report",
    color: "text-primary",
    description: "Investigative analysis and fact-finding"
  },
  scientist: {
    icon: FlaskConical,
    label: "Scientific Analysis",
    color: "text-emerald-500",
    description: "Evidence-based evaluation"
  },
  robot: {
    icon: Bot,
    label: "AI Logic Analysis",
    color: "text-sky-500",
    description: "Logical consistency check"
  },
  futurist: {
    icon: Telescope,
    label: "Future Implications",
    color: "text-violet-500",
    description: "Predictive impact assessment"
  },
  "bias-detector": {
    icon: ShieldAlert,
    label: "Bias Detection Report",
    color: "text-amber-500",
    description: "Source bias and slant analysis"
  },
}

const queryTypeIcons = {
  text: FileText,
  link: LinkIcon,
  file: FileText,
  image: ImageIcon
}

function formatContent(content: string) {
  const lines = content.split('\n')
  return lines.map((line, index) => {
    if (/^[A-Z][A-Z\s]+:/.test(line.trim())) {
      return (
        <h3 key={index} className="font-semibold text-foreground mt-4 mb-2 first:mt-0">
          {line}
        </h3>
      )
    }
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      return (
        <li key={index} className="text-muted-foreground ml-4 mb-1">
          {line.replace(/^[-•]\s*/, '')}
        </li>
      )
    }
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

export function AnalysisDisplay({ result, activeAgent, isLoading, queryInfo }: AnalysisDisplayProps) {
  const config = agentConfig[activeAgent] || agentConfig.journalist
  const Icon = config.icon

  // Map activeAgent to result key
  const resultKey = activeAgent === "bias-detector" ? "biasDetector" : activeAgent
  const perspective = result?.[resultKey as keyof Omit<AnalysisResult, "overallTruthScore" | "timestamp">]

  const QueryIcon = queryInfo ? queryTypeIcons[queryInfo.type] : FileText

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Running Truth-Seeker analysis...
          </p>
        </div>
      </div>
    )
  }

  if (!result || !perspective) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-secondary p-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Ready to Investigate</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Submit a question, link, image, or file to begin truth-seeking analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <div>
              <h2 className="font-semibold text-foreground">{config.label}</h2>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Truth Score</span>
              <span className={cn(
                "text-lg font-bold",
                perspective.truthScore >= 80 && "text-emerald-500",
                perspective.truthScore >= 60 && perspective.truthScore < 80 && "text-primary",
                perspective.truthScore >= 40 && perspective.truthScore < 60 && "text-amber-500",
                perspective.truthScore < 40 && "text-destructive"
              )}>
                {perspective.truthScore}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Confidence</span>
              <span className="text-lg font-bold text-foreground">
                {perspective.confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Query info */}
        {queryInfo && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-background/50">
            <QueryIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                {queryInfo.type === "image" ? "Image" : queryInfo.type === "file" ? "File" : queryInfo.type === "link" ? "Link" : "Question"}
              </p>
              <p className="text-sm text-foreground break-words">
                {queryInfo.fileName || queryInfo.content}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 max-h-[500px] overflow-y-auto">
        <div className="prose prose-sm prose-invert max-w-none mb-6">
          {formatContent(perspective.analysis)}
        </div>

        {/* Key Findings */}
        {perspective.keyFindings && perspective.keyFindings.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Key Findings</h4>
            <ul className="space-y-2">
              {perspective.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full mt-2 shrink-0 bg-primary")} />
                  <span className="text-sm text-muted-foreground">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
