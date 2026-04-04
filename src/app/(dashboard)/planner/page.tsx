"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, GripHorizontal, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlignLeft, Loader2, AlertCircle } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { AIIndicator } from "@/components/shared/AIIndicator"
import { useRouter } from "next/navigation"

interface PlannedPost {
  type?: string
  postType?: string
  title?: string
  keyMessage?: string
  caption?: string
  timing?: string
  status?: string
  platform?: string
  festivalTie?: string
  callToAction?: string
}

interface DayPlan {
  date: string
  dayName?: string
  posts?: PlannedPost[]
  items?: PlannedPost[]
  specialNote?: string
  festivals?: string[]
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return date
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase().slice(0, 3)
}

const TYPE_COLORS: Record<string, string> = {
  FESTIVAL: 'bg-secondary/10 text-secondary border-secondary/20',
  CAROUSEL: 'bg-success/10 text-success border-success/20',
  POST: 'bg-primary/10 text-primary border-primary/20',
  STORY: 'bg-ai-glow/10 text-ai-glow border-ai-glow/20',
  REEL: 'bg-orange-100 text-orange-600 border-orange-200',
}

export default function PlannerPage() {
  const router = useRouter()
  const [selectedPost, setSelectedPost] = useState<PlannedPost | null>(null)
  const [days, setDays] = useState<DayPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()))
  const [planId, setPlanId] = useState<string | null>(null)

  const generatePlan = useCallback(async (monday: Date, regenerate = false) => {
    const businessId = localStorage.getItem("businessId")
    if (!businessId) {
      router.push("/onboard")
      return
    }

    setGenerating(true)
    setError(null)
    if (regenerate) setDays([])

    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          weekStartDate: formatDate(monday),
          weeklyGoals: ["Increase engagement", "Promote key products", "Build brand awareness"],
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate plan.")
      }

      const planDays: DayPlan[] = data.plan?.days ?? []
      setDays(planDays)
      if (data.planId) setPlanId(data.planId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong."
      setError(msg)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    setLoading(true)
    generatePlan(weekStart)
  }, [weekStart, generatePlan])

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekLabel = `${formatDisplayDate(formatDate(weekStart))} – ${formatDisplayDate(formatDate(weekEnd))}`

  // Normalise posts from either format
  function getPosts(day: DayPlan): PlannedPost[] {
    return day.posts ?? day.items ?? []
  }

  function getPostType(post: PlannedPost): string {
    return (post.postType ?? post.type ?? "POST").toUpperCase()
  }

  function getTitle(post: PlannedPost): string {
    return post.keyMessage ?? post.title ?? "Untitled Post"
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Planner</h1>
          <p className="text-text-secondary">AI-generated content calendar for this week.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" className="gap-1" onClick={prevWeek} disabled={generating}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>
          <span className="text-sm font-semibold mx-2">{weekLabel}</span>
          <Button variant="outline" size="sm" className="gap-1" onClick={nextWeek} disabled={generating}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-error/30 bg-error/10 flex items-center gap-3 text-sm text-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <Button variant="link" size="sm" className="ml-auto text-error" onClick={() => generatePlan(weekStart, true)}>Retry</Button>
        </div>
      )}

      {(loading || generating) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text-secondary">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium">
            {generating ? "Generating your AI content plan..." : "Loading..."}
          </p>
          <p className="text-xs text-text-muted max-w-xs text-center">
            Analyzing festivals, industry trends, and news to create your personalized calendar.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">

          {/* Calendar Strip */}
          <div className="flex-1 grid grid-cols-7 gap-3 overflow-x-auto pb-4">
            {days.map((day, idx) => {
              const posts = getPosts(day)
              const dayName = day.dayName ?? getDayName(day.date)
              const dateNum = new Date(day.date + 'T00:00:00').getDate()
              const isToday = day.date === formatDate(new Date())
              return (
                <div key={day.date} className={`flex flex-col rounded-xl border ${isToday ? 'border-primary/20 bg-primary/5' : 'border-border bg-surface'} shadow-sm p-3 min-w-[140px]`}>
                  <div className="text-center mb-3 border-b border-border pb-2">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{dayName}</div>
                    <div className="text-xl font-bold">{dateNum}</div>
                    {day.festivals && day.festivals.length > 0 && (
                      <div className="mt-1 text-[10px] font-bold bg-secondary/10 text-secondary py-0.5 px-2 rounded-full inline-block truncate max-w-full">
                        {day.festivals[0]}
                      </div>
                    )}
                    {day.specialNote && !day.festivals?.length && (
                      <div className="mt-1 text-[10px] font-bold bg-ai-glow/10 text-ai-glow py-0.5 px-2 rounded-full inline-block truncate max-w-full">
                        {day.specialNote}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {posts.map((post, i) => {
                      const type = getPostType(post)
                      const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.POST
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedPost(post)}
                          className={`group p-2.5 rounded-lg border text-sm cursor-pointer hover:shadow-md transition-all ${selectedPost === post ? 'ring-2 ring-primary border-transparent' : 'border-border bg-background'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${colorClass}`}>
                              {type}
                            </span>
                            <GripHorizontal className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                          </div>
                          <div className="font-semibold text-foreground line-clamp-2 leading-tight mb-2 mt-1 text-xs">
                            {getTitle(post)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted font-mono">{post.timing ?? '—'}</span>
                            <span className={`w-2 h-2 rounded-full ${post.status === 'published' ? 'bg-success' : post.status === 'scheduled' ? 'bg-warning' : 'bg-text-muted'}`} />
                          </div>
                        </div>
                      )
                    })}

                    <button className="w-full py-2 border border-dashed border-border rounded-lg text-text-muted hover:text-foreground hover:bg-surface hover:border-foreground/20 transition-colors flex items-center justify-center gap-1 text-xs font-semibold">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Placeholder columns if less than 7 days returned */}
            {Array.from({ length: Math.max(0, 7 - days.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col rounded-xl border border-dashed border-border bg-surface/30 shadow-sm p-3 min-w-[140px] opacity-40" />
            ))}
          </div>

          {/* Sidebar Detail Panel */}
          {selectedPost && (
            <div className="w-80 bg-surface border border-border shadow-md rounded-xl p-5 flex flex-col flex-shrink-0 animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${TYPE_COLORS[getPostType(selectedPost)] ?? TYPE_COLORS.POST}`}>
                      {getPostType(selectedPost)}
                    </span>
                    <span className="text-xs text-text-muted capitalize">• {selectedPost.status ?? 'draft'}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{getTitle(selectedPost)}</h3>
                  {selectedPost.platform && (
                    <p className="text-xs text-text-muted mt-1 capitalize">{selectedPost.platform}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)} className="-mt-1 -mr-1">
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </div>

              <div className="space-y-4 flex-1">
                {selectedPost.caption && (
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold mb-1"><AlignLeft className="w-4 h-4" /> Caption</div>
                    <div className="text-sm text-text-secondary bg-background p-3 rounded-lg border border-border whitespace-pre-line">
                      {selectedPost.caption}
                    </div>
                    <div className="flex justify-end mt-1">
                      <Button variant="link" size="sm" className="h-6 px-1 text-xs text-ai-glow">
                        <Sparkles className="w-3 h-3 mr-1" /> Rewrite with AI
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPost.callToAction && (
                  <div>
                    <div className="text-xs font-semibold mb-1 text-text-secondary">Call to Action</div>
                    <div className="text-sm font-medium p-2 rounded-md border border-border bg-background">
                      {selectedPost.callToAction}
                    </div>
                  </div>
                )}

                {selectedPost.festivalTie && (
                  <div>
                    <div className="text-xs font-semibold mb-1 text-text-secondary">Festival Tie-in</div>
                    <div className="text-sm p-2 rounded-md border border-secondary/20 bg-secondary/5 text-secondary font-medium">
                      {selectedPost.festivalTie}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold mb-1 text-text-secondary"><CalendarIcon className="w-3 h-3" /> Type</div>
                    <div className="text-sm font-medium p-2 rounded-md border border-border bg-background capitalize">{getPostType(selectedPost)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold mb-1 text-text-secondary"><Clock className="w-3 h-3" /> Time</div>
                    <div className="text-sm font-medium p-2 rounded-md border border-border bg-background">{selectedPost.timing ?? '—'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1">Edit</Button>
                <GlowButton className="flex-1">Approve</GlowButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Bar */}
      <div className="mt-4 p-4 rounded-xl border border-ai-glow/30 bg-ai-glow/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AIIndicator />
          <span className="text-sm font-medium">Not happy with this week&apos;s plan?</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-ai-glow/30 text-ai-glow hover:bg-ai-glow/10 gap-2"
          onClick={() => generatePlan(weekStart, true)}
          disabled={generating}
        >
          {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Regenerate Week Plan
        </Button>
      </div>

    </div>
  )
}
