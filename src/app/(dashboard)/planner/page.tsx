"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, GripHorizontal, ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, Tag, Clock, Share2, AlignLeft } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { AIIndicator } from "@/components/shared/AIIndicator"

const mockDays = [
  { name: 'Mon', date: 'Oct 14', items: [ { type: 'POST', title: 'Product Showcase', time: '10:00 AM', status: 'Published' } ] },
  { name: 'Tue', date: 'Oct 15', items: [] },
  { name: 'Wed', date: 'Oct 16', items: [ { type: 'FESTIVAL', title: 'Diwali Prep', time: '6:30 PM', status: 'Scheduled' } ], special: 'Diwali Week' },
  { name: 'Thu', date: 'Oct 17', items: [] },
  { name: 'Fri', date: 'Oct 18', items: [ { type: 'CAROUSEL', title: '5 Tips for Growth', time: '4:00 PM', status: 'Draft' } ] },
  { name: 'Sat', date: 'Oct 19', items: [] },
  { name: 'Sun', date: 'Oct 20', items: [ { type: 'POST', title: 'Behind the Scenes', time: '11:00 AM', status: 'Draft' } ] },
]

export default function PlannerPage() {
  const [selectedPost, setSelectedPost] = useState<any>(null)

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-6">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Planner</h1>
            <p className="text-text-secondary">AI-generated content calendar for this week.</p>
         </div>
         <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" className="gap-1"><ChevronLeft className="w-4 h-4" /> Prev</Button>
            <span className="text-sm font-semibold mx-2">Oct 14 - Oct 20</span>
            <Button variant="outline" size="sm" className="gap-1">Next <ChevronRight className="w-4 h-4" /></Button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Calendar Strip */}
        <div className="flex-1 grid grid-cols-7 gap-3 overflow-x-auto pb-4">
           {mockDays.map((day, idx) => (
             <div key={day.date} className={`flex flex-col rounded-xl border ${idx===2 ? 'border-primary/20 bg-primary/5' : 'border-border bg-surface'} shadow-sm p-3 min-w-[140px]`}>
                <div className="text-center mb-3 border-b border-border pb-2">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{day.name}</div>
                  <div className="text-xl font-bold">{day.date.split(' ')[1]}</div>
                  {day.special && (
                     <div className="mt-1 text-[10px] font-bold bg-secondary/10 text-secondary py-0.5 px-2 rounded-full inline-block">
                       {day.special}
                     </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {day.items.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPost(item)}
                      className={`group p-2.5 rounded-lg border text-sm cursor-pointer hover:shadow-md transition-all ${selectedPost?.title === item.title ? 'ring-2 ring-primary border-transparent' : 'border-border bg-background'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.type === 'FESTIVAL' ? 'bg-secondary/10 text-secondary' : item.type === 'CAROUSEL' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                          {item.type}
                        </span>
                        <GripHorizontal className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="font-semibold text-foreground line-clamp-2 leading-tight mb-2 mt-1">{item.title}</div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-text-muted font-mono">{item.time}</span>
                         <span className={`w-2 h-2 rounded-full ${item.status === 'Published' ? 'bg-success' : item.status === 'Scheduled' ? 'bg-warning' : 'bg-text-muted'}`} />
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full py-2 border border-dashed border-border rounded-lg text-text-muted hover:text-foreground hover:bg-surface hover:border-foreground/20 transition-colors flex items-center justify-center gap-1 text-xs font-semibold">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
             </div>
           ))}
        </div>

        {/* Sidebar Detail Panel */}
        {selectedPost && (
          <div className="w-80 bg-surface border border-border shadow-md rounded-xl p-5 flex flex-col flex-shrink-0 animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
             <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-primary/10 text-primary`}>
                       {selectedPost.type}
                     </span>
                     <span className={`text-xs ${selectedPost.status === 'Scheduled' ? 'text-warning' : 'text-text-muted'}`}>
                       • {selectedPost.status}
                     </span>
                   </div>
                   <h3 className="font-bold text-lg leading-tight">{selectedPost.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)} className="-mt-1 -mr-1">
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
             </div>

             <div className="mb-4 aspect-square rounded-lg bg-border flex items-center justify-center text-text-muted bg-[url('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop')] bg-cover relative overflow-hidden group">
               <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button size="sm" variant="secondary" className="shadow-sm">Edit Design</Button>
               </div>
             </div>

             <div className="space-y-4 flex-1">
                <div>
                   <div className="flex items-center gap-1 text-sm font-semibold mb-1"><AlignLeft className="w-4 h-4" /> Caption</div>
                   <div className="text-sm text-text-secondary bg-background p-3 rounded-lg border border-border">
                     Enjoy our special treats this festive season! 🪔✨ Made with love and the finest ingredients.<br/><br/>#SharmaBakery #FestiveTreats #DiwaliSweets
                   </div>
                   <div className="flex justify-end mt-1"><Button variant="link" size="sm" className="h-6 px-1 text-xs text-ai-glow"><Sparkles className="w-3 h-3 mr-1"/> Rewrite with AI</Button></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <div className="flex items-center gap-1 text-xs font-semibold mb-1 text-text-secondary"><CalendarIcon className="w-3 h-3" /> Date</div>
                     <div className="text-sm font-medium p-2 rounded-md border border-border bg-background">Oct 16, 2026</div>
                   </div>
                   <div>
                     <div className="flex items-center gap-1 text-xs font-semibold mb-1 text-text-secondary"><Clock className="w-3 h-3" /> Time</div>
                     <div className="text-sm font-medium p-2 rounded-md border border-border bg-background">6:30 PM</div>
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

      {/* AI Bar */}
      <div className="mt-4 p-4 rounded-xl border border-ai-glow/30 bg-ai-glow/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <AIIndicator />
            <span className="text-sm font-medium">Not happy with this week's plan?</span>
         </div>
         <Button variant="outline" size="sm" className="border-ai-glow/30 text-ai-glow hover:bg-ai-glow/10 gap-2">
            <Sparkles className="w-3 h-3" /> Regenerate Week Plan
         </Button>
      </div>

    </div>
  )
}
