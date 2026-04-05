"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Sparkles, GripHorizontal, ChevronLeft, ChevronRight, Plus,
  Calendar as CalendarIcon, Clock, AlignLeft, Loader2, AlertCircle
} from "lucide-react"
import { GlassButton } from "@/components/ui/liquid-glass"
import { TextStaggerHover } from "@/components/ui/text-stagger-hover"
import { useRouter } from "next/navigation"

interface PlannedPost {
  id?: string
  // type field — AI returns "post"|"carousel"|"story"|"reel"
  type?: string; postType?: string
  // title/headline — AI returns suggestedHeadline, legacy uses title/keyMessage
  suggestedHeadline?: string; title?: string; keyMessage?: string
  theme?: string
  // caption — AI returns captionHook, legacy uses caption
  captionHook?: string; caption?: string
  // timing — AI returns time (HH:MM), legacy uses timing
  time?: string; timing?: string
  // CTA — AI returns cta, legacy uses callToAction
  cta?: string; callToAction?: string
  // other
  category?: string
  platform?: string | string[]
  hashtags?: string[]
  estimatedReach?: string
  notes?: string
  festivalTie?: string; festivalName?: string
  status?: string
}
interface DayPlan {
  date: string
  dayName?: string
  isFestival?: boolean
  festivalName?: string | null
  posts?: PlannedPost[]
  items?: PlannedPost[]  // legacy field name
  specialNote?: string
  festivals?: string[]
}

function getMonday(d: Date): Date {
  const date = new Date(d); const day = date.getDay()
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1)); return date
}
function formatDate(d: Date)         { return d.toISOString().split("T")[0] }
function formatDisplay(s: string)    { return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric" }) }
function getDayName(s: string)       { return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase().slice(0, 3) }

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FESTIVAL: { bg: "rgba(251,146,60,0.1)",  text: "#FB923C", border: "rgba(251,146,60,0.25)" },
  CAROUSEL: { bg: "rgba(52,211,153,0.1)",  text: "#34D399", border: "rgba(52,211,153,0.25)" },
  POST:     { bg: "rgba(255,223,0,0.08)",  text: "#FFE000", border: "rgba(255,223,0,0.2)"  },
  STORY:    { bg: "rgba(167,139,250,0.1)", text: "#A78BFA", border: "rgba(167,139,250,0.25)" },
  REEL:     { bg: "rgba(96,165,250,0.1)",  text: "#60A5FA", border: "rgba(96,165,250,0.25)" },
}
const DEFAULT_TYPE = TYPE_COLORS.POST

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16, backdropFilter: "blur(12px)",
}

export default function PlannerPage() {
  const router = useRouter()
  const [selectedPost, setSelectedPost] = useState<PlannedPost | null>(null)
  const [days, setDays]                 = useState<DayPlan[]>([])
  const [loading, setLoading]           = useState(true)
  const [generating, setGenerating]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [weekStart, setWeekStart]       = useState<Date>(getMonday(new Date()))

  const generatePlan = useCallback(async (monday: Date, regenerate = false) => {
    const businessId = localStorage.getItem("businessId")
    if (!businessId) { router.push("/onboard"); return }
    setGenerating(true); setError(null)
    if (regenerate) setDays([])

    // Always send businessData as fallback in case Firestore lookup fails
    // (happens when businessId is "local-..." from a failed Firestore save)
    let businessData: Record<string, unknown> | undefined
    try {
      const profileRaw = localStorage.getItem("businessProfile")
      const inputRaw   = localStorage.getItem("businessInput")
      if (profileRaw) {
        businessData = {
          profile: JSON.parse(profileRaw),
          input: inputRaw ? JSON.parse(inputRaw) : {
            name: localStorage.getItem("businessName") ?? "My Business",
            industry: "general",
            location: "India",
            products: [],
            targetAudience: ["General audience"],
            tone: "professional",
          },
        }
      }
    } catch { /* ignore parse errors */ }

    try {
      const res  = await fetch("/api/planner/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          weekStartDate: formatDate(monday),
          weeklyGoals: "Increase engagement, promote key products, build brand awareness",
          ...(businessData && { businessData }),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate plan.")
      setDays(data.plan?.days ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally { setGenerating(false); setLoading(false) }
  }, [router])

  useEffect(() => { setLoading(true); generatePlan(weekStart) }, [weekStart, generatePlan])

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }
  const weekEnd  = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)
  const weekLabel= `${formatDisplay(formatDate(weekStart))} – ${formatDisplay(formatDate(weekEnd))}`

  function getPosts(day: DayPlan)      { return day.posts ?? day.items ?? [] }
  function getPostType(p: PlannedPost) { return (p.postType ?? p.type ?? "POST").toUpperCase() }
  // AI returns suggestedHeadline; fallback/legacy uses keyMessage or title
  function getTitle(p: PlannedPost)    { return p.suggestedHeadline ?? p.keyMessage ?? p.title ?? p.theme ?? "Untitled Post" }
  // AI returns captionHook; legacy uses caption
  function getCaption(p: PlannedPost)  { return p.captionHook ?? p.caption ?? "" }
  // AI returns time (HH:MM 24hr); legacy uses timing
  function getTiming(p: PlannedPost)   { return p.time ?? p.timing ?? "—" }
  // AI returns cta; legacy uses callToAction
  function getCTA(p: PlannedPost)      { return p.cta ?? p.callToAction ?? "" }
  // Festival tie-in
  function getFestivalTie(p: PlannedPost) { return p.festivalTie ?? p.festivalName ?? "" }
  // Platform display
  function getPlatformDisplay(p: PlannedPost) {
    if (Array.isArray(p.platform)) return p.platform.join(", ")
    return p.platform ?? ""
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <TextStaggerHover text="Weekly Planner" as="h1" staggerMs={18}
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#fff", fontFamily: "monospace" } as React.CSSProperties}
          />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            AI-generated content calendar for this week.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek} disabled={generating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <span style={{ color: "#FFE000", fontFamily: "monospace", fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: "center" }}>
            {weekLabel}
          </span>
          <button
            onClick={nextWeek} disabled={generating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b" }}>
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
          <button onClick={() => generatePlan(weekStart, true)} className="ml-auto text-xs underline" style={{ color: "#FFE000" }}>Retry</button>
        </div>
      )}

      {(loading || generating) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={32} style={{ color: "#A78BFA" }} className="animate-spin" />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>
            {generating ? "Generating your AI content plan…" : "Loading…"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, maxWidth: 280, textAlign: "center" }}>
            Analyzing festivals, industry trends, and news to craft your personalized calendar.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">

          {/* Calendar Strip */}
          <div className="flex-1 grid grid-cols-7 gap-2 overflow-x-auto pb-4">
            {days.map((day) => {
              const posts   = getPosts(day)
              const dayName = day.dayName ?? getDayName(day.date)
              const dateNum = new Date(day.date + "T00:00:00").getDate()
              const isToday = day.date === formatDate(new Date())
              return (
                <div key={day.date} className="flex flex-col rounded-2xl p-3 min-w-[130px]"
                  style={{
                    background: isToday ? "rgba(255,223,0,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isToday ? "rgba(255,223,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  <div className="text-center pb-2 mb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase" }}>{dayName}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isToday ? "#FFE000" : "#fff", lineHeight: 1.2, margin: "4px 0" }}>{dateNum}</div>
                    {(day.festivalName || day.festivals?.[0]) && (
                      <div className="truncate max-w-full mx-auto rounded-full px-2 py-0.5 inline-block" style={{ fontSize: 8, fontWeight: 700, background: "rgba(251,146,60,0.12)", color: "#FB923C" }}>
                        {day.festivalName ?? day.festivals?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {posts.map((post, i) => {
                      const type  = getPostType(post)
                      const tc    = TYPE_COLORS[type] ?? DEFAULT_TYPE
                      const isSel = selectedPost === post
                      return (
                        <div key={i} onClick={() => setSelectedPost(post)}
                          className="group p-2 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: isSel ? tc.bg : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isSel ? tc.border : "rgba(255,255,255,0.08)"}`,
                            outline: isSel ? `1px solid ${tc.border}` : "none",
                          }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="rounded px-1.5 py-0.5 font-bold tracking-wide"
                              style={{ fontSize: 8, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                              {type}
                            </span>
                            <GripHorizontal size={10} style={{ color: "rgba(255,255,255,0.2)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, lineHeight: 1.4 }} className="line-clamp-2 mt-1">
                            {getTitle(post)}
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{getTiming(post)}</span>
                            <div className="w-1.5 h-1.5 rounded-full" style={{
                              background: post.status === "published" ? "#34D399" : post.status === "scheduled" ? "#FFE000" : "rgba(255,255,255,0.2)"
                            }} />
                          </div>
                        </div>
                      )
                    })}
                    <button className="w-full py-1.5 rounded-xl border border-dashed flex items-center justify-center gap-1 transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)", fontSize: 10 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,223,0,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#FFE000" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)" }}
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                </div>
              )
            })}
            {Array.from({ length: Math.max(0, 7 - days.length) }).map((_, i) => (
              <div key={`e-${i}`} className="rounded-2xl min-w-[130px]"
                style={{ border: "1px dashed rgba(255,255,255,0.05)", opacity: 0.3 }} />
            ))}
          </div>

          {/* Detail Panel */}
          {selectedPost && (
            <div className="w-72 flex flex-col flex-shrink-0 rounded-2xl p-5 overflow-y-auto animate-in slide-in-from-right-8 duration-300"
              style={{ ...card, border: "1px solid rgba(255,223,0,0.12)" }}>
              <div className="flex items-start justify-between mb-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => { const tc = TYPE_COLORS[getPostType(selectedPost)] ?? DEFAULT_TYPE; return (
                      <span className="rounded px-2 py-0.5 font-bold tracking-wide" style={{ fontSize: 9, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                        {getPostType(selectedPost)}
                      </span>
                    )})()}
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>• {selectedPost.status ?? "draft"}</span>
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{getTitle(selectedPost)}</h3>
                  {getPlatformDisplay(selectedPost) && (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4, textTransform: "capitalize" }}>{getPlatformDisplay(selectedPost)}</p>
                  )}
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 8 }}>
                  <Plus size={16} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {getCaption(selectedPost) && (
                  <div>
                    <div className="flex items-center gap-1 mb-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>
                      <AlignLeft size={12} /> Caption Hook
                    </div>
                    <div className="p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                      {getCaption(selectedPost)}
                    </div>
                    <div className="flex justify-end mt-1">
                      <button style={{ color: "#A78BFA", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                        <Sparkles size={10} /> Rewrite with AI
                      </button>
                    </div>
                  </div>
                )}
                {getCTA(selectedPost) && (
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>CTA</div>
                    <div className="p-2 rounded-xl text-xs font-medium" style={{ background: "rgba(255,223,0,0.06)", border: "1px solid rgba(255,223,0,0.15)", color: "#FFE000" }}>
                      {getCTA(selectedPost)}
                    </div>
                  </div>
                )}
                {getFestivalTie(selectedPost) && (
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Festival Tie-in</div>
                    <div className="p-2 rounded-xl text-xs font-medium" style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", color: "#FB923C" }}>
                      {getFestivalTie(selectedPost)}
                    </div>
                  </div>
                )}
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Hashtags</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.hashtags.map((tag, hi) => (
                        <span key={hi} className="px-2 py-0.5 rounded-lg text-[9px] font-medium"
                          style={{ background: "rgba(102,179,255,0.08)", border: "1px solid rgba(102,179,255,0.15)", color: "#66B3FF" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <CalendarIcon size={10} />, label: "Type",  val: getPostType(selectedPost) },
                    { icon: <Clock size={10} />,         label: "Time",  val: getTiming(selectedPost) },
                  ].map(({ icon, label, val }) => (
                    <div key={label}>
                      <div className="flex items-center gap-1 mb-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                        {icon} {label}
                      </div>
                      <div className="p-2 rounded-xl text-xs font-medium" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  Edit
                </button>
                <GlassButton className="flex-1 text-xs" style={{ color: "#FFE000", border: "1px solid rgba(255,223,0,0.25)" }}>
                  Approve
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Regenerate bar */}
      <div className="mt-4 p-4 rounded-2xl flex items-center justify-between"
        style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
        <div className="flex items-center gap-3">
          <Sparkles size={14} style={{ color: "#A78BFA" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>Not happy with this week&apos;s plan?</span>
        </div>
        <GlassButton
          className="gap-2 text-xs"
          style={{ color: "#A78BFA", border: "1px solid rgba(167,139,250,0.2)" }}
          onClick={() => generatePlan(weekStart, true)}
          disabled={generating}
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Regenerate
        </GlassButton>
      </div>

    </div>
  )
}
