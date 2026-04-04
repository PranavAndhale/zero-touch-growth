"use client"

import React, { useEffect, useState } from "react"
import { MetricCard } from "@/components/shared/MetricCard"
import { Sparkles, Calendar, TrendingUp, PartyPopper, CheckCircle2, ChevronRight, Download, BarChart2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIIndicator } from "@/components/shared/AIIndicator"
import { GlowButton } from "@/components/shared/GlowButton"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"

const performanceData = [
  { name: 'Mon', engagement: 400 },
  { name: 'Tue', engagement: 300 },
  { name: 'Wed', engagement: 550 },
  { name: 'Thu', engagement: 450 },
  { name: 'Fri', engagement: 700 },
  { name: 'Sat', engagement: 650 },
  { name: 'Sun', engagement: 800 },
]

interface ContentPillar {
  name: string
  description: string
  weeklyPosts: number
}

interface SeasonalOpportunity {
  festival: string
  date: string
  marketingAngle: string
}

interface PlatformStrategy {
  platform: string
  focus: string
  postFrequency: string
  bestTimes?: string[]
}

interface QuickWin {
  action: string
  impact: string
  timeframe: string
}

interface BusinessProfile {
  businessSummary?: string
  contentPillars?: ContentPillar[]
  seasonalOpportunities?: SeasonalOpportunity[]
  platformStrategy?: PlatformStrategy[]
  quickWins?: QuickWin[]
  industryAnalysis?: { keyTrends?: string[] }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("My Business")
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem("businessName")
    const profileRaw = localStorage.getItem("businessProfile")

    if (!profileRaw) {
      // No business analyzed yet — send to onboarding
      router.push("/onboard")
      return
    }

    if (name) setBusinessName(name)
    try {
      setProfile(JSON.parse(profileRaw))
    } catch {
      // corrupted storage — ignore, show defaults
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const pillars = profile?.contentPillars ?? []
  const seasonal = profile?.seasonalOpportunities ?? []
  const platforms = profile?.platformStrategy ?? []
  const quickWins = profile?.quickWins ?? []
  const trends = profile?.industryAnalysis?.keyTrends ?? []

  const nextFestival = seasonal[0]
  const nextFestivalDays = nextFestival?.date
    ? Math.max(0, Math.ceil((new Date(nextFestival.date).getTime() - Date.now()) / 86400000))
    : null

  const today = new Date()
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + 1 + i)
    return d.getDate()
  })
  const todayIdx = (today.getDay() + 6) % 7 // Mon=0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-text-secondary">Here&apos;s how {businessName} is growing this week.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio">
            <GlowButton glowColor="primary" className="gap-2">
              <Sparkles className="w-4 h-4" /> Generate Creative
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Row 1: Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Content Pillars"
          value={String(pillars.length || "—")}
          trendLabel="AI-generated strategy"
          icon={<Calendar className="w-5 h-5" />}
          iconBgColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Platforms Planned"
          value={String(platforms.length || "—")}
          trendLabel="active channels"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-success/10 text-success"
        />
        <MetricCard
          title="Upcoming Festival"
          value={nextFestival?.festival ?? "—"}
          trendLabel={nextFestivalDays !== null ? `In ${nextFestivalDays} days` : "Check planner"}
          icon={<PartyPopper className="w-5 h-5" />}
          iconBgColor="bg-secondary/10 text-secondary"
        />
        <MetricCard
          title="Quick Wins"
          value={String(quickWins.length || "—")}
          trendLabel="actionable this week"
          icon={<Sparkles className="w-5 h-5" />}
          iconBgColor="bg-ai-glow/10 text-ai-glow"
        />
      </div>

      {/* Row 2: Weekly Calendar + AI Insights */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Weekly Calendar Summary */}
        <Card className="lg:col-span-8 flex flex-col h-full border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">This Week</CardTitle>
            <Link href="/planner" className="text-sm text-primary font-medium hover:underline flex items-center">
              View Full Planner <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <div className="flex gap-2 h-full">
              {DAYS.map((day, i) => {
                const isToday = i === todayIdx
                const festivalThisDay = seasonal.find(s => {
                  const fd = new Date(s.date)
                  const d = new Date(today)
                  d.setDate(today.getDate() - today.getDay() + 1 + i)
                  return fd.toDateString() === d.toDateString()
                })
                return (
                  <div key={day} className={`flex-1 flex flex-col items-center justify-start p-2 rounded-lg border ${isToday ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-surface/50 border-transparent hover:bg-surface hover:border-border'}`}>
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{day}</span>
                    <span className="text-lg font-bold mb-4">{weekDates[i]}</span>
                    <div className="flex flex-col gap-1.5 w-full">
                      {pillars[i % pillars.length] && (
                        <div className="w-full h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      {festivalThisDay && (
                        <div className="w-full h-8 rounded bg-secondary/10 border border-secondary/20 font-bold text-[8px] text-secondary flex items-center justify-center text-center leading-tight tracking-tighter px-1">
                          {festivalThisDay.festival.toUpperCase().slice(0, 10)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="lg:col-span-4 border-ai-glow/20 bg-gradient-to-b from-ai-glow/5 to-surface shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <AIIndicator />
            </div>
            <CardTitle className="text-lg">Growth Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trends.slice(0, 2).map((trend, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface border border-border shadow-sm flex gap-3 text-sm">
                <div className="mt-0.5 text-secondary"><TrendingUp className="w-4 h-4" /></div>
                <div><span className="font-semibold text-foreground">Industry Trend:</span> {trend}</div>
              </div>
            ))}
            {quickWins[0] && (
              <div className="p-3 rounded-lg bg-surface border border-border shadow-sm flex gap-3 text-sm">
                <div className="mt-0.5 text-ai-glow"><Sparkles className="w-4 h-4" /></div>
                <div><span className="font-semibold text-foreground">Quick Win:</span> {quickWins[0].action}</div>
              </div>
            )}
            {trends.length === 0 && quickWins.length === 0 && (
              <div className="text-sm text-text-secondary">Complete onboarding to see AI insights.</div>
            )}
            <Button variant="outline" className="w-full font-medium mt-2 gap-2 text-ai-glow border-ai-glow/20 hover:bg-ai-glow/10">
              Apply Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Content Pillars */}
      {pillars.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Your Content Pillars</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-secondary' : 'bg-ai-glow'}`} />
                    <span className="font-semibold text-sm">{pillar.name}</span>
                    <span className="ml-auto text-xs text-text-muted">{pillar.weeklyPosts}x/week</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Performance & Seasonal Opportunities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Engagement Overview</CardTitle>
            <Button variant="ghost" size="icon"><BarChart2 className="w-4 h-4 text-text-secondary" /></Button>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} stroke="var(--text-muted)" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="engagement" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Upcoming Opportunities</CardTitle>
            <Link href="/planner" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Plan Now <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seasonal.slice(0, 4).map((opp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <PartyPopper className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{opp.festival}</span>
                      <span className="text-xs text-text-muted whitespace-nowrap">{opp.date}</span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{opp.marketingAngle}</p>
                  </div>
                </div>
              ))}
              {seasonal.length === 0 && (
                <div className="text-sm text-text-secondary py-4 text-center">
                  No seasonal data available. <Link href="/onboard" className="text-primary underline">Re-analyze your business</Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
