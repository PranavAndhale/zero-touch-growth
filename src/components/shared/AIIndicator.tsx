import * as React from "react"
import { Sparkles } from "lucide-react"

export function AIIndicator({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ai-glow/10 border border-ai-glow/20 text-ai-glow text-xs font-semibold ${className}`}>
      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      <span>AI Generated</span>
    </div>
  )
}
