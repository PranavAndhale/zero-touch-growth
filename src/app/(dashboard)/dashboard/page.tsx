"use client"

import React, { useEffect, useState } from "react"
import {
  Sparkles, Calendar, TrendingUp, PartyPopper, CheckCircle2,
  ChevronRight, BarChart2, Loader2
} from "lucide-react"
import { GlassEffect, GlassButton } from "@/components/ui/liquid-glass"
import { TextStaggerHover } from "@/components/ui/text-stagger-hover"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"

const PERF_DATA = [
  { name: "Mon", v: 400 }, { name: "Tue", v: 300 }, { name: "Wed", v: 550 },
  { name: "Thu", v: 450 }, { name: "Fri", v: 700 }, { name: "Sat", v: 650 }, { name: "Sun", v: 800 },
]
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

interface ContentPillar   { name: string; description: string; weeklyPosts: number }
interface SeasonalOpp     { festival: string; date: string; marketingAngle: string }
interface PlatformStrategy{ platform: string; focus: string; postFrequency: string }
interface QuickWin        { action: string; impact: string; timeframe: string }
interface BusinessProfile {
  businessSummary?: string
  contentPillars?: ContentPillar[]
  seasonalOpportunities?: SeasonalOpp[]
  platformStrategy?: PlatformStrategy[]
  quickWins?: QuickWin[]
  industryAnalysis?: { keyTrends?: string[] }
}

// ── Color palette (non-yellow accents) ──────────────────────────────────────
const PILLAR_COLORS = ["#FFE000", "#A78BFA", "#34D399", "#FB923C", "#60A5FA", "#F472B6"]

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  backdropFilter: "blur(12px)",
}

export default function DashboardPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("My Business")
  const [profile, setProfile]           = useState<BusinessProfile | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const name       = localStorage.getItem("businessName")
    const profileRaw = localStorage.getItem("businessProfile")
    if (!profileRaw) { router.push("/onboard"); return }
    if (name) setBusinessName(name)
    try { setProfile(JSON.parse(profileRaw)) } catch { /* ignore */ }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} style={{ color: "#FFE000" }} className="animate-spin" />
      </div>
    )
  }

  const pillars  = profile?.contentPillars        ?? []
  const seasonal = profile?.seasonalOpportunities ?? []
  const platforms= profile?.platformStrategy      ?? []
  const quickWins= profile?.quickWins             ?? []
  const trends   = profile?.industryAnalysis?.keyTrends ?? []

  const nextFest     = seasonal[0]
  const nextFestDays = nextFest?.date
    ? Math.max(0, Math.ceil((new Date(nextFest.date).getTime() - Date.now()) / 86400000))
    : null

  const today    = new Date()
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + 1 + i)
    return d.getDate()
  })
  const todayIdx = (today.getDay() + 6) % 7

  const stats = [
    { label: "Content Pillars",   value: pillars.length  || "—", sub: "AI strategy",        color: "#FFE000",  icon: <Calendar size={16} /> },
    { label: "Platforms Planned", value: platforms.length|| "—", sub: "active channels",     color: "#A78BFA",  icon: <TrendingUp size={16} /> },
    { label: "Next Festival",     value: nextFest?.festival ?? "—", sub: nextFestDays !== null ? `In ${nextFestDays} days` : "Check planner", color: "#FB923C", icon: <PartyPopper size={16} /> },
    { label: "Quick Wins",        value: quickWins.length || "—", sub: "actionable this week",color: "#34D399",  icon: <Sparkles size={16} /> },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <TextStaggerHover
            text={`Overview — ${businessName}`}
            as="h1"
            staggerMs={18}
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#fff", fontFamily: "monospace" } as React.CSSProperties}
          />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            Here&apos;s how your business is growing this week.
          </p>
        </div>
        <Link href="/studio">
          <GlassButton
            className="gap-2 text-sm"
            style={{ color: "#FFE000", border: "1px solid rgba(255,223,0,0.25)" }}
          >
            <Sparkles size={14} /> Generate Creative
          </GlassButton>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, color, icon }) => (
          <div key={label} style={card} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
              <span style={{ color, opacity: 0.8 }}>{icon}</span>
            </div>
            <div style={{ color, fontSize: 28, fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly calendar + AI Insights */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Calendar */}
        <div style={card} className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>This Week</span>
            <Link href="/planner" className="flex items-center gap-1 text-xs font-medium" style={{ color: "#FFE000" }}>
              View Planner <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex gap-2">
            {DAYS.map((day, i) => {
              const isToday = i === todayIdx
              const hasFest = seasonal.some(s => {
                const d = new Date(today)
                d.setDate(today.getDate() - today.getDay() + 1 + i)
                return new Date(s.date).toDateString() === d.toDateString()
              })
              return (
                <div key={day} className="flex-1 flex flex-col items-center p-2 rounded-xl"
                  style={{
                    background: isToday ? "rgba(255,223,0,0.07)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isToday ? "rgba(255,223,0,0.25)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>{day}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: isToday ? "#FFE000" : "#fff", margin: "6px 0 8px" }}>
                    {weekDates[i]}
                  </span>
                  {pillars[i % Math.max(pillars.length, 1)] && pillars.length > 0 && (
                    <div className="w-full rounded flex items-center justify-center" style={{ height: 24, background: "rgba(255,223,0,0.08)", border: "1px solid rgba(255,223,0,0.15)" }}>
                      <CheckCircle2 size={11} style={{ color: "#FFE000" }} />
                    </div>
                  )}
                  {hasFest && (
                    <div className="w-full rounded mt-1 flex items-center justify-center" style={{ height: 20, background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.2)" }}>
                      <span style={{ fontSize: 7, color: "#FB923C", fontWeight: 700 }}>FEST</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-4" style={{ ...card, padding: 20 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} style={{ color: "#A78BFA" }} />
            <span style={{ color: "#A78BFA", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>AI Insights</span>
          </div>
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Growth Signals</h3>
          <div className="space-y-3">
            {trends.slice(0, 2).map((trend, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)" }}>
                <TrendingUp size={14} style={{ color: "#A78BFA", marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5 }}>{trend}</p>
              </div>
            ))}
            {quickWins[0] && (
              <div className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                <Sparkles size={14} style={{ color: "#34D399", marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5 }}>{quickWins[0].action}</p>
              </div>
            )}
            {trends.length === 0 && quickWins.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Complete onboarding to see AI insights.</p>
            )}
          </div>
          <GlassButton
            className="w-full mt-4 text-xs"
            style={{ color: "#A78BFA", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            Apply Recommendations
          </GlassButton>
        </div>
      </div>

      {/* Content Pillars */}
      {pillars.length > 0 && (
        <div>
          <h2 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Content Pillars
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => {
              const c = PILLAR_COLORS[i % PILLAR_COLORS.length]
              return (
                <div key={i} style={card} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{pillar.name}</span>
                    <span style={{ marginLeft: "auto", color: c, fontSize: 10, fontFamily: "monospace" }}>
                      {pillar.weeklyPosts}×/wk
                    </span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.55 }}>{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Performance chart + Seasonal */}
      <div className="grid lg:grid-cols-2 gap-5 pb-8">
        {/* Chart */}
        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Engagement Overview</span>
            <BarChart2 size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERF_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FFE000" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FFE000" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.3)" }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.3)" }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,223,0,0.2)", borderRadius: 8 }}
                  labelStyle={{ color: "#FFE000" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="v" stroke="#FFE000" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal */}
        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Upcoming Opportunities</span>
            <Link href="/planner" className="flex items-center gap-1 text-xs" style={{ color: "#FB923C" }}>
              Plan Now <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {seasonal.slice(0, 4).map((opp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.12)" }}>
                <div className="rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(251,146,60,0.12)" }}>
                  <PartyPopper size={14} style={{ color: "#FB923C" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }} className="truncate">{opp.festival}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, whiteSpace: "nowrap" }}>{opp.date}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }} className="line-clamp-1">
                    {opp.marketingAngle}
                  </p>
                </div>
              </div>
            ))}
            {seasonal.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", paddingTop: 16 }}>
                No seasonal data.{" "}
                <Link href="/onboard" style={{ color: "#FFE000", textDecoration: "underline" }}>Re-analyze</Link>
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
