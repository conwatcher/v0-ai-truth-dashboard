"use client"

import { cn } from "@/lib/utils"
import { FlaskConical, Bot, Telescope, ShieldAlert, type LucideIcon } from "lucide-react"

interface AgentButtonProps {
  agent: "scientist" | "robot" | "futurist" | "bias-detector"
  isActive?: boolean
  onClick?: () => void
  hasResult?: boolean
}

const agentConfig: Record<
  string,
  { icon: LucideIcon; label: string; description: string; color: string }
> = {
  scientist: {
    icon: FlaskConical,
    label: "Scientist",
    description: "Fact-check with data",
    color: "from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20",
  },
  robot: {
    icon: Bot,
    label: "Robot",
    description: "AI analysis mode",
    color: "from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20",
  },
  futurist: {
    icon: Telescope,
    label: "Futurist",
    description: "Predict implications",
    color: "from-violet-500/20 to-violet-600/10 hover:from-violet-500/30 hover:to-violet-600/20",
  },
  "bias-detector": {
    icon: ShieldAlert,
    label: "Bias Detector",
    description: "Identify bias patterns",
    color: "from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20",
  },
}

export function AgentButton({ agent, isActive, onClick, hasResult }: AgentButtonProps) {
  const config = agentConfig[agent]
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-lg border border-border bg-gradient-to-br p-4 text-left transition-all duration-300",
        config.color,
        isActive && "ring-2 ring-primary border-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-lg bg-card/80 p-2.5 transition-transform group-hover:scale-110",
          isActive && "bg-primary/20"
        )}>
          <Icon className={cn(
            "h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground",
            isActive && "text-primary"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">{config.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
        </div>
      </div>
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {hasResult && !isActive && (
          <div className="h-2 w-2 rounded-full bg-emerald-500" title="Analysis complete" />
        )}
        {isActive && (
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
    </button>
  )
}
