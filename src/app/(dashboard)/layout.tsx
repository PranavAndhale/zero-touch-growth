"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Calendar, PenTool, Crosshair, Settings,
  Sparkles, Bell, Menu as MenuIcon, X,
} from "lucide-react"
import { GlassFilter } from "@/components/ui/liquid-glass"
import AnimatedGradient from "@/components/ui/animated-gradient"
import { TextStaggerHover } from "@/components/ui/text-stagger-hover"
import { MenuContainer, MenuItem } from "@/components/ui/fluid-menu"

const NAV_ITEMS = [
  { name: "Dashboard",       href: "/dashboard", icon: LayoutDashboard, color: "#FFE000" },
  { name: "Weekly Planner",  href: "/planner",   icon: Calendar,        color: "#A78BFA" },
  { name: "Creative Studio", href: "/studio",    icon: PenTool,         color: "#34D399" },
  { name: "Ad Performance",  href: "/ads",       icon: Crosshair,       color: "#FB923C" },
  { name: "Settings",        href: "/settings",  icon: Settings,        color: "#94A3B8" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [businessName, setBusinessName] = useState("My Business")
  const [initial, setInitial]           = useState("M")
  const [mobileOpen, setMobileOpen]     = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("businessName")
    if (stored) { setBusinessName(stored); setInitial(stored.charAt(0).toUpperCase()) }
  }, [])

  return (
    <div className="min-h-screen flex" style={{ color: "#fff", position: "relative" }}>
      <GlassFilter />

      {/* ── Full-viewport blue WebGL background ───────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <AnimatedGradient
          config={{
            preset: "custom",
            color1: "#020818",
            color2: "#0A3566",
            color3: "#66B3FF",
            rotation: -30,
            proportion: 40,
            scale: 0.6,
            speed: 18,
            distortion: 3,
            swirl: 55,
            swirlIterations: 8,
            softness: 85,
            offset: -200,
            shape: "Checks",
            shapeSize: 35,
          }}
          noise={{ opacity: 12 }}
          style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 1 }}
        />
        {/* Dark overlay for readability */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,24,0.52)", zIndex: 1 }} />
      </div>

      {/* ── Desktop fluid sidebar ──────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-40"
        style={{
          width: 72,
          background: "rgba(5,10,28,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(102,179,255,0.12)",
          overflow: "visible",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center h-16 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(102,179,255,0.1)" }}
        >
          <Link href="/" style={{ color: "#66B3FF", fontFamily: "monospace", fontWeight: 900, fontSize: 17, letterSpacing: -1, textDecoration: "none" }}>
            ZT
          </Link>
        </div>

        {/* Fluid nav menu */}
        <div className="flex flex-col items-center pt-4" style={{ overflow: "visible" }}>
          <MenuContainer>
            {/* Toggle — Menu/X */}
            <MenuItem
              icon={
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                    <MenuIcon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                    <X size={22} strokeWidth={1.5} />
                  </div>
                </div>
              }
            />

            {/* Nav items */}
            {NAV_ITEMS.map(({ name, href, icon: Icon, color }) => {
              const active = pathname === href
              return (
                <MenuItem
                  key={href}
                  isActive={active}
                  onClick={() => router.push(href)}
                  icon={
                    <div className="relative flex items-center justify-center" title={name}>
                      <Icon
                        size={22}
                        strokeWidth={1.5}
                        style={{ color: active ? color : "rgba(255,255,255,0.45)", transition: "color 150ms" }}
                      />
                      {active && (
                        <span
                          className="absolute left-full ml-3 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none"
                          style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
                        >
                          {name}
                        </span>
                      )}
                    </div>
                  }
                />
              )
            })}
          </MenuContainer>
        </div>
      </aside>

      {/* ── Mobile header ──────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(5,10,28,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(102,179,255,0.1)",
        }}
      >
        <span style={{ color: "#66B3FF", fontFamily: "monospace", fontWeight: 900, fontSize: 16 }}>ZT.os</span>
        <button onClick={() => setMobileOpen(v => !v)} style={{ color: "#66B3FF" }}>
          {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-52 flex flex-col pt-20 pb-6 px-3 gap-1"
            style={{ background: "rgba(5,10,28,0.9)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(102,179,255,0.1)" }}
            onClick={e => e.stopPropagation()}
          >
            {NAV_ITEMS.map(({ name, href, icon: Icon, color }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{
                    background: active ? `${color}12` : "transparent",
                    border: `1px solid ${active ? `${color}30` : "transparent"}`,
                    color: active ? color : "rgba(255,255,255,0.45)",
                    fontSize: 13, fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={17} strokeWidth={1.5} />
                  {name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 72, position: "relative", zIndex: 10 }}
        suppressHydrationWarning
      >
        {/* Top header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 h-16"
          style={{
            background: "rgba(5,10,28,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(102,179,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "rgba(102,179,255,0.15)", color: "#66B3FF", border: "1px solid rgba(102,179,255,0.3)" }}
            >
              {initial}
            </div>
            <TextStaggerHover text={businessName} staggerMs={25} className="font-semibold text-sm" />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/studio"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{ background: "rgba(102,179,255,0.1)", border: "1px solid rgba(102,179,255,0.25)", color: "#66B3FF" }}
            >
              <Sparkles size={12} /> AI Ready
            </Link>
            <button className="relative p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#FF4444" }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-5 md:p-7">
          {children}
        </div>
      </main>
    </div>
  )
}
