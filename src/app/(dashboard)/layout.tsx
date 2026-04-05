"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Calendar, PenTool, Crosshair, Settings, Sparkles, Bell, Menu, X
} from "lucide-react"
import { GlassFilter } from "@/components/ui/liquid-glass"
import AnimatedGradient from "@/components/ui/animated-gradient"
import { TextStaggerHover } from "@/components/ui/text-stagger-hover"

const NAV_ITEMS = [
  { name: "Dashboard",      href: "/dashboard", icon: LayoutDashboard, color: "#FFE000" },
  { name: "Weekly Planner", href: "/planner",   icon: Calendar,        color: "#A78BFA" },
  { name: "Creative Studio",href: "/studio",    icon: PenTool,         color: "#34D399" },
  { name: "Ad Performance", href: "/ads",       icon: Crosshair,       color: "#FB923C" },
  { name: "Settings",       href: "/settings",  icon: Settings,        color: "#94A3B8" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const [businessName, setBusinessName] = useState("My Business")
  const [initial, setInitial]           = useState("M")
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("businessName")
    if (stored) { setBusinessName(stored); setInitial(stored.charAt(0).toUpperCase()) }
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0a", color: "#fff" }}>
      <GlassFilter />

      {/* ── Compact Icon Sidebar (desktop) ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-40"
        style={{ width: 72, background: "#0d0d0d", borderRight: "1px solid rgba(255,223,0,0.1)" }}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: "rgba(255,223,0,0.1)" }}>
          <span style={{ color: "#FFE000", fontFamily: "monospace", fontWeight: 900, fontSize: 18, letterSpacing: -1 }}>
            ZT
          </span>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-2 py-4">
          {NAV_ITEMS.map(({ name, href, icon: Icon, color }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} title={name}
                className="group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: active ? `${color}18` : "transparent",
                  border: `1px solid ${active ? `${color}40` : "transparent"}`,
                }}
              >
                <Icon
                  size={20}
                  style={{ color: active ? color : "rgba(255,255,255,0.35)", transition: "color 200ms" }}
                  className="group-hover:!text-white"
                />
                {/* Tooltip */}
                <span
                  className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,223,0,0.2)", color: "#FFE000" }}
                >
                  {name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* AI credits dot */}
        <div className="flex flex-col items-center pb-4 gap-1">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer group"
            style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <Sparkles size={18} style={{ color: "#A78BFA" }} />
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>45/100</span>
        </div>
      </aside>

      {/* ── Mobile top bar + drawer ─────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(255,223,0,0.1)" }}
      >
        <span style={{ color: "#FFE000", fontFamily: "monospace", fontWeight: 900, fontSize: 16 }}>ZT.os</span>
        <button onClick={() => setSidebarOpen(v => !v)} style={{ color: "#FFE000" }}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-56 flex flex-col py-20 px-4 gap-2"
            style={{ background: "#0d0d0d", borderRight: "1px solid rgba(255,223,0,0.15)" }}
            onClick={e => e.stopPropagation()}
          >
            {NAV_ITEMS.map(({ name, href, icon: Icon, color }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{
                    background: active ? `${color}15` : "transparent",
                    border: `1px solid ${active ? `${color}35` : "transparent"}`,
                    color: active ? color : "rgba(255,255,255,0.5)",
                    fontSize: 14, fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={18} />
                  {name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 72 }} suppressHydrationWarning>

        {/* Top header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 h-16"
          style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,223,0,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(255,223,0,0.15)", color: "#FFE000", border: "1px solid rgba(255,223,0,0.3)" }}
            >
              {initial}
            </div>
            <TextStaggerHover
              text={businessName}
              staggerMs={25}
              className="font-semibold text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/studio"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{ background: "rgba(255,223,0,0.08)", border: "1px solid rgba(255,223,0,0.2)", color: "#FFE000" }}
            >
              <Sparkles size={13} /> AI Ready
            </Link>
            <button className="relative p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#FF4444" }} />
            </button>
          </div>
        </header>

        {/* Animated gradient background — subtle */}
        <div className="fixed inset-0 -z-10" style={{ marginLeft: 72 }}>
          <AnimatedGradient
            config={{ preset: "Vortex", speed: 8 }}
            noise={{ opacity: 15 }}
            style={{ opacity: 0.35 }}
          />
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 md:p-7 mt-0 md:mt-0 pt-0 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
