"use client"

import { useEffect, useState } from "react"

interface TruthMeterProps {
  value: number
  label?: string
}

export function TruthMeter({ value, label = "Truth-O-Meter" }: TruthMeterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const getStatusColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500"
    if (val >= 60) return "bg-primary"
    if (val >= 40) return "bg-amber-500"
    return "bg-destructive"
  }

  const getStatusText = (val: number) => {
    if (val >= 80) return "Highly Verified"
    if (val >= 60) return "Mostly True"
    if (val >= 40) return "Partially Verified"
    return "Needs Review"
  }

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{getStatusText(displayValue)}</span>
          <span className="text-lg font-bold text-primary">{displayValue}%</span>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-1000 ease-out ${getStatusColor(displayValue)}`}
          style={{ width: `${displayValue}%` }}
        />
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 border-r border-background/20 last:border-r-0"
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  )
}
