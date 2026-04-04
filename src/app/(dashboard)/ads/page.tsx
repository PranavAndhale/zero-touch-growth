"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/shared/MetricCard"
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend } from "recharts"
import { MousePointerClick, Eye, Users, RefreshCw, AlertCircle } from "lucide-react"

const adData = [
  { name: 'Campaign A', clicks: 4000, impressions: 24000 },
  { name: 'Campaign B', clicks: 3000, impressions: 13980 },
  { name: 'Campaign C', clicks: 2000, impressions: 9800 },
]

export default function AdsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Ad Performance</h1>
         <p className="text-text-secondary">Track ROI on your AI-optimized campaigns.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Total Clicks" value="9,342" trend={14.2} 
          icon={<MousePointerClick className="w-5 h-5" />} 
        />
        <MetricCard 
          title="Impressions" value="124.5k" trend={8.1} 
          icon={<Eye className="w-5 h-5" />} iconBgColor="bg-secondary/10 text-secondary"
        />
        <MetricCard 
          title="Avg. ROAS" value="4.2x" trend={4.5} 
          icon={<RefreshCw className="w-5 h-5" />} iconBgColor="bg-success/10 text-success"
        />
        <MetricCard 
          title="Conversion Rate" value="3.1%" trend={-1.2} 
          icon={<Users className="w-5 h-5" />} iconBgColor="bg-ai-glow/10 text-ai-glow"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={adData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'var(--surface)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Bar dataKey="impressions" fill="var(--border)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div className="space-y-4">
           <Card className="border-warning/30 bg-warning/5">
             <CardContent className="p-5 flex gap-4">
               <AlertCircle className="w-5 h-5 text-warning shrink-0" />
               <div>
                  <h4 className="font-semibold text-warning mb-1 text-sm">Audience Exhaustion</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">Campaign C CTR has dropped 15% in 3 days. AI recommends swapping creative 2 immediately.</p>
                  <button className="text-xs font-bold text-foreground mt-2 hover:underline">Apply Fix</button>
               </div>
             </CardContent>
           </Card>

           <Card className="border-ai-glow/30 bg-ai-glow/5">
             <CardContent className="p-5 flex gap-4">
               <RefreshCw className="w-5 h-5 text-ai-glow shrink-0" />
               <div>
                  <h4 className="font-semibold text-ai-glow mb-1 text-sm">Budget Reallocation</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">Shift $50/day from Campaign B to Campaign A to maximize ROAS by an estimated 12%.</p>
                  <button className="text-xs font-bold text-foreground mt-2 hover:underline">Optimize Budget</button>
               </div>
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  )
}
