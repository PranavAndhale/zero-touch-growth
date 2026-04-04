"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, PenTool, Crosshair, Settings, Sparkles, Bell, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [businessName, setBusinessName] = useState("My Business")
  const [initial, setInitial] = useState("M")

  useEffect(() => {
    const stored = localStorage.getItem("businessName")
    if (stored) {
      setBusinessName(stored)
      setInitial(stored.charAt(0).toUpperCase())
    }
  }, [])

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Weekly Planner", href: "/planner", icon: Calendar },
    { name: "Creative Studio", href: "/studio", icon: PenTool },
    { name: "Ad Performance", href: "/ads", icon: Crosshair },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="fixed w-64 h-screen bg-surface border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border text-lg font-bold tracking-tight">
           Zero-Touch<span className="text-primary">.os</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-background hover:text-foreground"}`}>
                <Icon className="w-5 h-5 opacity-90" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-br from-ai-glow/10 to-primary/10 rounded-xl p-4 border border-ai-glow/20 relative overflow-hidden group hover:border-ai-glow/40 transition-colors cursor-pointer">
             <div className="absolute -inset-2 bg-ai-glow/20 blur-[20px] opacity-0 group-hover:opacity-100 transition duration-500" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-ai-glow font-bold text-sm mb-1">
                 <Sparkles className="w-4 h-4" /> AI Credits
               </div>
               <div className="text-2xl font-bold tracking-tight mb-2">45<span className="text-sm font-normal text-text-secondary">/100</span></div>
               <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                 <div className="h-full bg-ai-glow w-[45%]" />
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-[#F5F3EF] dark:bg-[#0F0F1A]">
        {/* Top Navbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
           <div className="flex items-center gap-4">
             <div className="md:hidden">
               <Button variant="ghost" size="icon"><LayoutGrid /></Button>
             </div>
             <div className="font-semibold text-lg flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-white text-xs font-bold shadow-sm">{initial}</div>
               {businessName}
             </div>
           </div>

           <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-text-secondary border-dashed">
               <Sparkles className="w-4 h-4 text-ai-glow" /> AI Insights Ready
             </Button>
             <Button variant="ghost" size="icon" className="relative text-text-secondary">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
             </Button>
             <div className="w-8 h-8 rounded-full bg-text-muted overflow-hidden flex items-center justify-center bg-[url('https://i.pravatar.cc/100')] bg-cover border border-border cursor-pointer relative" />
           </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
