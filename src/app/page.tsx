"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  ArrowUpRight, Sparkles, Brain, Calendar, PartyPopper,
  PenTool, BarChart2, TrendingUp, ChevronRight, Zap,
} from "lucide-react"
import AnimatedGradient from "@/components/ui/animated-gradient"
import { GlassFilter } from "@/components/ui/liquid-glass"
import { TextStaggerHover } from "@/components/ui/text-stagger-hover"

// ── Glass card style ─────────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
}

const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.09)",
  border: "1px solid rgba(102,179,255,0.25)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderRadius: 24,
}

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Features data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Brain size={22} />,
    color: "#66B3FF",
    title: "AI Business Analysis",
    desc: "Gemini 2.0 Flash analyzes your website, industry trends, and competitors to build a full growth strategy in seconds.",
    tag: "LIVE",
  },
  {
    icon: <Calendar size={22} />,
    color: "#A78BFA",
    title: "Weekly AI Planner",
    desc: "Auto-generates a 7-day content calendar with captions, posting times, and platform-specific strategy — zero effort.",
    tag: "LIVE",
  },
  {
    icon: <PartyPopper size={22} />,
    color: "#34D399",
    title: "Festival Campaigns",
    desc: "Never miss Diwali, Eid, or Independence Day again. AI plans culturally-relevant campaigns 90 days in advance.",
    tag: "LIVE",
  },
  {
    icon: <PenTool size={22} />,
    color: "#FB923C",
    title: "Creative Studio",
    desc: "Generate on-brand social creatives, ad banners, and carousel posts using Stable Diffusion and your brand colors.",
    tag: "BETA",
  },
  {
    icon: <BarChart2 size={22} />,
    color: "#F472B6",
    title: "Ad Performance Hub",
    desc: "Connect Google Ads and Facebook Ads. AI surfaces insights, flags underperformers, and suggests budget shifts.",
    tag: "BETA",
  },
  {
    icon: <TrendingUp size={22} />,
    color: "#FBBF24",
    title: "Growth Intelligence",
    desc: "Real-time industry trends from GNews and RSS feeds, surfaced as actionable content ideas every morning.",
    tag: "LIVE",
  },
]

const STEPS = [
  { n: "01", title: "Tell us about your business", desc: "Name, industry, website URL, target audience — takes 60 seconds." },
  { n: "02", title: "AI builds your strategy",     desc: "Gemini analyses your business and generates content pillars, platform strategy, and quick wins." },
  { n: "03", title: "Get your weekly plan",        desc: "A full 7-day content calendar with captions, festival tie-ins, and posting schedule — ready to go." },
]

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
      style={{
        background: "rgba(5,5,15,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(102,179,255,0.1)",
      }}
    >
      <div style={{ color: "#66B3FF", fontFamily: "monospace", fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>
        Zero-Touch<span style={{ color: "#fff" }}>.os</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {["Features", "How it works", "Pricing"].map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            className="text-sm transition-colors duration-200 hover:text-white"
            style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard"
          className="hidden sm:flex text-sm font-medium transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
          Sign in
        </Link>
        <Link href="/onboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "rgba(102,179,255,0.15)", border: "1px solid rgba(102,179,255,0.35)", color: "#66B3FF" }}>
          Get started <ChevronRight size={14} />
        </Link>
      </div>
    </nav>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <GlassFilter />

      {/* Fixed animated gradient background (Prism = blue) */}
      <div className="fixed inset-0 -z-10">
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
          style={{ opacity: 1 }}
        />
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0" style={{ background: "rgba(2,8,24,0.55)" }} />
      </div>

      <Nav />

      <main style={{ color: "#fff" }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32">

          {/* Glow blur behind headline */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 600, height: 300, top: "20%", left: "50%",
              transform: "translateX(-50%) rotate(-20deg)",
              background: "rgb(54,157,253)",
              opacity: 0.18,
              filter: "blur(120px)",
            }}
          />

          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(102,179,255,0.1)", border: "1px solid rgba(102,179,255,0.25)", color: "#66B3FF" }}>
              <Zap size={11} /> Powered by Gemini 2.0 Flash
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto leading-[1.05]"
              style={{
                background: "linear-gradient(to bottom, #ffffff 0%, #b3d8ff 45%, #66B3FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Zero-Touch Growth<br className="hidden md:block" /> Operating System
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              AI builds your entire marketing strategy, weekly content calendar, and festival campaigns — in under 90 seconds. Built for Indian SMBs.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              {/* Primary CTA */}
              <Link href="/onboard"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(102,179,255,0.15)",
                  border: "1px solid rgba(102,179,255,0.4)",
                  color: "#fff",
                  backdropFilter: "blur(12px)",
                }}>
                Analyze my business
                <div className="relative w-5 h-5 overflow-hidden">
                  <ArrowUpRight size={18} className="absolute transition-all duration-500 group-hover:translate-x-5 group-hover:-translate-y-5" />
                  <ArrowUpRight size={18} className="absolute -translate-x-5 -translate-y-5 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
              </Link>
              {/* Secondary CTA */}
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                }}>
                View dashboard <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* Stats bar */}
          <Reveal delay={0.45} className="w-full max-w-2xl mt-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-0 divide-x divide-white/10"
              style={glass}>
              {[
                { v: "90s", l: "Setup time" },
                { v: "7-day", l: "Content calendar" },
                { v: "100%", l: "Free to start" },
                { v: "AI", l: "Festival detection" },
              ].map(({ v, l }) => (
                <div key={l} className="flex-1 flex flex-col items-center py-4 px-6">
                  <span className="font-bold text-xl" style={{ color: "#66B3FF", fontFamily: "monospace" }}>{v}</span>
                  <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="relative px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#66B3FF" }}>How it works</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">From zero to strategy in 3 steps</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.12}>
                <div style={glassStrong} className="p-7 h-full">
                  <div style={{ color: "#66B3FF", fontFamily: "monospace", fontSize: 38, fontWeight: 900, lineHeight: 1, opacity: 0.35, marginBottom: 16 }}>
                    {n}
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="relative px-6 md:px-12 py-24 max-w-6xl mx-auto">

          {/* Section glow */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-48 pointer-events-none"
            style={{ background: "rgba(102,179,255,0.12)", filter: "blur(80px)", borderRadius: "50%" }} />

          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#66B3FF" }}>Features</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Everything your SMB needs to grow</h2>
              <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                Six AI-powered modules working together. No marketing team required.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, color, title, desc, tag }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div style={glass} className="group p-6 h-full flex flex-col transition-all duration-300 hover:scale-[1.02]"
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${color}35` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.14)" }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                      {icon}
                    </div>
                    <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: tag === "LIVE" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
                        border: `1px solid ${tag === "LIVE" ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`,
                        color: tag === "LIVE" ? "#34D399" : "#FBBF24",
                      }}>
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#fff" }}>{title}</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
                  <div className="flex items-center gap-1 mt-5 text-xs font-semibold" style={{ color }}>
                    Learn more <ArrowUpRight size={13} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ────────────────────────────────────────── */}
        <section className="relative px-6 md:px-12 py-24 max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#66B3FF" }}>Dashboard</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Your growth command centre</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={glassStrong} className="p-6 md:p-8">
              {/* Mock dashboard UI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Content Pillars", val: "4", c: "#66B3FF" },
                  { label: "Platforms",       val: "3", c: "#A78BFA" },
                  { label: "Next Festival",   val: "7d", c: "#FB923C" },
                  { label: "Quick Wins",      val: "5", c: "#34D399" },
                ].map(({ label, val, c }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }} className="p-4">
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                    <div style={{ color: c, fontSize: 26, fontWeight: 700, fontFamily: "monospace", marginTop: 6 }}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Mock calendar strip */}
              <div className="flex gap-2">
                {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d, i) => (
                  <div key={d} className="flex-1 rounded-xl p-2 text-center"
                    style={{
                      background: i === 2 ? "rgba(102,179,255,0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${i === 2 ? "rgba(102,179,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{d}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? "#66B3FF" : "#fff", margin: "4px 0" }}>{7+i}</div>
                    <div style={{ height: 20, borderRadius: 6, background: "rgba(102,179,255,0.15)", border: "1px solid rgba(102,179,255,0.1)", marginTop: 4 }} />
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Live preview after onboarding — all data generated by AI from your business profile
              </p>
            </div>
          </Reveal>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section className="relative px-6 md:px-12 py-32 max-w-3xl mx-auto text-center">

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div style={{ width: 400, height: 200, background: "rgba(102,179,255,0.18)", filter: "blur(100px)", borderRadius: "50%" }} />
          </div>

          <Reveal>
            <div style={glassStrong} className="p-12 md:p-16 relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(102,179,255,0.12)", border: "1px solid rgba(102,179,255,0.25)" }}>
                <Sparkles size={22} style={{ color: "#66B3FF" }} />
              </div>
              <TextStaggerHover
                text="Start growing today."
                as="h2"
                staggerMs={30}
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              />
              <p className="mb-10 text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
                Takes 60 seconds. No credit card. No agency fees.<br />
                Just AI doing the heavy lifting for your business.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/onboard"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
                  style={{
                    background: "rgba(102,179,255,0.2)",
                    border: "1px solid rgba(102,179,255,0.45)",
                    color: "#fff",
                  }}>
                  Analyze my business — free
                  <div className="relative w-5 h-5 overflow-hidden">
                    <ArrowUpRight size={18} className="absolute transition-all duration-500 group-hover:translate-x-5 group-hover:-translate-y-5" />
                    <ArrowUpRight size={18} className="absolute -translate-x-5 -translate-y-5 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="px-6 md:px-12 py-10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            <span style={{ color: "#66B3FF", fontFamily: "monospace", fontWeight: 900, fontSize: 15 }}>
              Zero-Touch<span style={{ color: "rgba(255,255,255,0.5)" }}>.os</span>
            </span>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
              NMIMS INNOVATHON 2026 · Challenge 1 · Zero-Touch Growth Operating System
            </p>
            <div className="flex gap-5">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "GitHub",    href: "https://github.com/PranavAndhale/zero-touch-growth" },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
