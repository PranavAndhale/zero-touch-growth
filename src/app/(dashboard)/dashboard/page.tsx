"use client"

import React from "react"
import { MetricCard } from "@/components/shared/MetricCard"
import { Sparkles, Calendar, TrendingUp, PartyPopper, CheckCircle2, ChevronRight, Download, BarChart2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIIndicator } from "@/components/shared/AIIndicator"
import { GlowButton } from "@/components/shared/GlowButton"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import Link from "next/link"

const performanceData = [
  { name: 'Mon', engagement: 400 },
  { name: 'Tue', engagement: 300 },
  { name: 'Wed', engagement: 550 },
  { name: 'Thu', engagement: 450 },
  { name: 'Fri', engagement: 700 },
  { name: 'Sat', engagement: 650 },
  { name: 'Sun', engagement: 800 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
           <p className="text-text-secondary">Here's how Sharma Bakery is growing this week.</p>
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
          title="Posts Scheduled" 
          value="5/7" 
          trend={12} 
          trendLabel="vs last week"
          icon={<Calendar className="w-5 h-5" />} 
          iconBgColor="bg-primary/10 text-primary"
        />
        <MetricCard 
          title="Avg. Engagement Rate" 
          value="4.2%" 
          trend={0.3} 
          trendLabel="vs last 30 days"
          icon={<TrendingUp className="w-5 h-5" />} 
          iconBgColor="bg-success/10 text-success"
        />
        <MetricCard 
          title="Upcoming Festival" 
          value="Diwali" 
          trendLabel="Starts in 12 Days"
          icon={<PartyPopper className="w-5 h-5" />} 
          iconBgColor="bg-secondary/10 text-secondary"
        />
        <MetricCard 
          title="Creatives Generated" 
          value="124" 
          trend={45} 
          trendLabel="this month"
          icon={<Sparkles className="w-5 h-5" />} 
          iconBgColor="bg-ai-glow/10 text-ai-glow"
        />
      </div>

      {/* Row 2: AI Insights & Planner Summary */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Weekly Calendar Summary (8 cols) */}
        <Card className="lg:col-span-8 flex flex-col h-full border-border">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-base font-semibold">This Week's Plan</CardTitle>
             <Link href="/planner" className="text-sm text-primary font-medium hover:underline flex items-center">
               View Full Planner <ChevronRight className="w-4 h-4 ml-1" />
             </Link>
           </CardHeader>
           <CardContent className="flex-1 pb-6">
              <div className="flex gap-2 h-full">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className={`flex-1 flex flex-col items-center justify-start p-2 rounded-lg border ${i===2 ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-surface/50 border-transparent relative hover:bg-surface hover:border-border'}`}>
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{day}</span>
                    <span className="text-lg font-bold mb-4">{10 + i}</span>
                    
                    {/* Mock Post dots */}
                    <div className="flex flex-col gap-1.5 w-full">
                       {i === 1 || i === 3 ? null : <div className="w-full h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-primary" /></div>}
                       {i === 2 && <div className="w-full h-8 rounded bg-secondary/10 border border-secondary/20 font-bold text-[8px] text-secondary flex items-center justify-center text-center leading-tight tracking-tighter">FESTIVAL</div>}
                       {i === 6 && <div className="w-full h-8 rounded bg-success/10 border border-success/20 font-bold text-[8px] text-success flex items-center justify-center text-center leading-tight tracking-tighter">CAROUSEL</div>}
                    </div>
                  </div>
                ))}
              </div>
           </CardContent>
        </Card>

        {/* AI Insights (4 cols) */}
        <Card className="lg:col-span-4 border-ai-glow/20 bg-gradient-to-b from-ai-glow/5 to-surface shadow-sm">
           <CardHeader className="pb-4">
             <div className="flex items-center gap-2 mb-1">
               <AIIndicator />
             </div>
             <CardTitle className="text-lg">Growth Insights</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-surface border border-border shadow-sm flex gap-3 text-sm">
                <div className="mt-0.5 text-secondary"><Sparkles className="w-4 h-4" /></div>
                <div><span className="font-semibold text-foreground">Trending in Bakery:</span> "Diwali Hampers" mentions are up 400% locally. Consider generating a campaign.</div>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border shadow-sm flex gap-3 text-sm">
                <div className="mt-0.5 text-success"><TrendingUp className="w-4 h-4" /></div>
                <div><span className="font-semibold text-foreground">Optimal Time:</span> Your audience is most active at 6:30 PM IST. We adjusts schedules automatically.</div>
              </div>
              <Button variant="outline" className="w-full font-medium mt-2 gap-2 text-ai-glow border-ai-glow/20 hover:bg-ai-glow/10">
                Apply Recommendations
              </Button>
           </CardContent>
        </Card>
      </div>

      {/* Row 3: Performance & Studio Preview */}
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
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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

        {/* Recent Creatives Gallery (Half row shortcut) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
             <CardTitle className="text-base font-semibold">Recent Creatives</CardTitle>
             <Link href="/studio" className="text-sm text-primary font-medium hover:underline">View Studio</Link>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
               {[1, 2, 3].map((item) => (
                 <div key={item} className="group relative aspect-square rounded-lg bg-surface border border-border overflow-hidden cursor-pointer shadow-sm">
                   <div className={`absolute inset-0 bg-gradient-to-br ${item===1 ? 'from-orange-100 to-orange-50' : item===2 ? 'from-indigo-100 to-indigo-50' : 'from-emerald-100 to-emerald-50'} dark:opacity-20`} />
                   
                   {/* Mock Graphic inside */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center mix-blend-multiply dark:mix-blend-screen opacity-60">
                      <div className={`w-8 h-8 rounded-full mb-2 ${item===1 ? 'bg-secondary' : item===2 ? 'bg-primary' : 'bg-success'}`} />
                      <div className="w-16 h-2 rounded bg-foreground/20 mb-1" />
                      <div className="w-10 h-2 rounded bg-foreground/10" />
                   </div>

                   {/* Hover Actions */}
                   <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full scale-50 group-hover:scale-100 transition-transform"><Download className="w-4 h-4" /></Button>
                   </div>
                   
                   <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-background/90 text-foreground shadow-sm">
                     {item===1 ? 'FESTIVAL' : item===2 ? 'POST' : 'CAROUSEL'}
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
