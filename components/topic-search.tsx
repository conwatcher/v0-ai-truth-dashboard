"use client"

import { useState, type FormEvent } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TopicSearchProps {
  onSearch: (topic: string) => void
  isLoading: boolean
}

export function TopicSearch({ onSearch, isLoading }: TopicSearchProps) {
  const [topic, setTopic] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !isLoading) {
      onSearch(topic.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter a topic to investigate (e.g., 'climate change effects on coral reefs')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="pl-10 bg-secondary/50 border-border focus-visible:ring-primary"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={!topic.trim() || isLoading}
        className="px-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analyzing
          </>
        ) : (
          "Investigate"
        )}
      </Button>
    </form>
  )
}
