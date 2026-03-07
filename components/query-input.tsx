"use client"

import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { Search, Loader2, Upload, Link, X, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface QueryData {
  question: string
  link?: string
  file?: File
  fileBase64?: string
  fileName?: string
  fileType?: string
}

interface QueryInputProps {
  onSubmit: (data: QueryData) => void
  isLoading: boolean
}

type InputMode = "question" | "link" | "file"

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [mode, setMode] = useState<InputMode>("question")
  const [question, setQuestion] = useState("")
  const [link, setLink] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const data: QueryData = {
      question: question.trim(),
    }

    if (mode === "link" && link.trim()) {
      data.link = link.trim()
    }

    if (mode === "file" && file) {
      data.fileName = file.name
      data.fileType = file.type
      
      // Convert file to base64 for API transmission
      const reader = new FileReader()
      reader.onloadend = () => {
        data.fileBase64 = reader.result as string
        onSubmit(data)
      }
      reader.readAsDataURL(file)
      return
    }

    if (data.question || data.link) {
      onSubmit(data)
    }
  }

  const isValid = () => {
    if (!question.trim()) return false
    if (mode === "link" && !link.trim()) return false
    if (mode === "file" && !file) return false
    return true
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("question")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            mode === "question"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Search className="h-4 w-4" />
          Question
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            mode === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Link className="h-4 w-4" />
          Link
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            mode === "file"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Link Input */}
        {mode === "link" && (
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste a URL to analyze (article, webpage, etc.)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
              disabled={isLoading}
            />
          </div>
        )}

        {/* File Upload */}
        {mode === "file" && (
          <div className="space-y-3">
            {!file ? (
              <label
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-secondary/30"
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  Images, PDFs, Documents (Max 10MB)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  disabled={isLoading}
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center">
                    {file.type.includes("pdf") ? (
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Question Input - Always shown */}
        <div className="relative">
          <Textarea
            placeholder={
              mode === "question"
                ? "Ask a question or enter a claim to verify..."
                : mode === "link"
                ? "What would you like to know about this link?"
                : "What would you like to know about this file?"
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px] bg-secondary/50 border-border resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing with Truth-Seeker Agent...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Investigate Truth
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
