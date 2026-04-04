"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Image as ImageIcon, LayoutTemplate, Type, Send, Download, Maximize2 } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('Festivals')

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Creative Studio</h1>
         <p className="text-text-secondary">Generate and manage all your visual assets and copy.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Generator Form */}
         <Card className="lg:col-span-1 shadow-sm border-border bg-surface flex flex-col">
           <CardContent className="p-6 flex-1 flex flex-col">
              
              {/* Custom Tabs to avoid complicated shadcn/tabs wiring */}
              <div className="flex gap-1 mb-6 bg-background p-1 rounded-lg border border-border">
                 {['Festivals', 'Products', 'Offers'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setActiveTab(t)}
                     className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === t ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}
                   >
                     {t}
                   </button>
                 ))}
              </div>

              <div className="space-y-5 flex-1">
                 <div>
                   <label className="text-sm font-semibold block mb-1.5">Campaign Theme</label>
                   <Input placeholder="e.g. Diwali Sweets Box" className="bg-background" />
                 </div>
                 
                 <div>
                   <label className="text-sm font-semibold block mb-1.5">Main Headline</label>
                   <Input placeholder="Festive Delights 🪔" className="bg-background" />
                 </div>

                 <div>
                   <label className="text-sm font-semibold block mb-1.5">Style</label>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="border border-primary bg-primary/5 text-primary text-sm font-medium text-center py-2 rounded-md">Vibrant 3D</div>
                     <div className="border border-border bg-background text-text-secondary text-sm font-medium text-center py-2 rounded-md cursor-pointer hover:bg-surface">Minimalist</div>
                   </div>
                 </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <GlowButton glowColor="ai" className="w-full gap-2 h-12 text-base">
                  <Sparkles className="w-4 h-4" /> Generate Creatives
                </GlowButton>
              </div>

           </CardContent>
         </Card>

         {/* Gallery */}
         <Card className="lg:col-span-2 shadow-sm border-border bg-background/50">
           <CardContent className="p-6 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Results Gallery</h3>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm">Filter</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="group relative aspect-square bg-surface border border-border shadow-sm rounded-xl overflow-hidden cursor-pointer">
                      <div className={`absolute inset-0 bg-gradient-to-br ${i%2===0 ? 'from-[#4F46E5]/20 to-[#4338CA]/10' : 'from-[#F97316]/20 to-[#F59E0B]/10'} flex items-center justify-center p-4`}>
                        <div className="text-center font-bold text-lg leading-tight opacity-70 tracking-tight">
                           Festive Title <br/><span className="text-sm font-normal">Subtext</span>
                        </div>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-foreground/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                         <div className="flex gap-2">
                           <Button size="icon" variant="secondary" className="w-10 h-10 rounded-full scale-50 group-hover:scale-100 transition-transform delay-75"><Maximize2 className="w-4 h-4" /></Button>
                           <Button size="icon" variant="secondary" className="w-10 h-10 rounded-full scale-50 group-hover:scale-100 transition-transform delay-100"><Download className="w-4 h-4" /></Button>
                         </div>
                         <Button size="sm" variant="default" className="text-xs font-semibold scale-50 group-hover:scale-100 transition-transform delay-150"><Send className="w-3 h-3 mr-1" /> Use in Post</Button>
                      </div>

                      <div className="absolute top-2 left-2 flex gap-1">
                        <div className="px-1.5 py-0.5 bg-ai-glow flex items-center justify-center rounded text-white shadow-sm">
                           <Sparkles className="w-3 h-3" />
                        </div>
                      </div>
                   </div>
                 ))}
                 
                 {/* Loading skeleton mock */}
                 <div className="aspect-square bg-surface border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-text-muted gap-2">
                    <div className="w-5 h-5 border-2 border-t-ai-glow border-border rounded-full animate-spin" />
                    <span className="text-xs font-medium">Generating...</span>
                 </div>
              </div>
           </CardContent>
         </Card>
      </div>

    </div>
  )
}
