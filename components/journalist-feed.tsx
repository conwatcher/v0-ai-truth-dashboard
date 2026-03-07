"use client"

import { Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Report {
  id: string
  title: string
  content: string
  source: string
  timestamp: string
  status: "verified" | "pending" | "flagged"
  truthScore: number
}

interface JournalistFeedProps {
  reports: Report[]
  activeAgent: string | null
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    className: "text-emerald-500 bg-emerald-500/10",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "text-amber-500 bg-amber-500/10",
  },
  flagged: {
    icon: AlertTriangle,
    label: "Flagged",
    className: "text-destructive bg-destructive/10",
  },
}

export function JournalistFeed({ reports, activeAgent }: JournalistFeedProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Journalist Reports</h2>
        </div>
        {activeAgent && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
            {activeAgent.replace("-", " ")} Active
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {reports.map((report) => {
          const status = statusConfig[report.status]
          const StatusIcon = status.icon

          return (
            <article
              key={report.id}
              className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-card/80"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-foreground leading-tight text-balance">
                  {report.title}
                </h3>
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0",
                  status.className
                )}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {report.content}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Source: <span className="text-foreground">{report.source}</span>
                  </span>
                  <span className="text-muted-foreground">{report.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Truth Score:</span>
                  <span className={cn(
                    "font-semibold",
                    report.truthScore >= 80 && "text-emerald-500",
                    report.truthScore >= 60 && report.truthScore < 80 && "text-primary",
                    report.truthScore >= 40 && report.truthScore < 60 && "text-amber-500",
                    report.truthScore < 40 && "text-destructive"
                  )}>
                    {report.truthScore}%
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
