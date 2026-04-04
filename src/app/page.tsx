"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { BuildingIcon, Sparkles, RocketIcon, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  
  return (
    <main className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      
      {/* Navbar (Simple) */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-sans font-bold text-xl tracking-tight">
            Zero-Touch<span className="text-primary">.os</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard"><Button variant="ghost">Login</Button></Link>
            <Link href="/onboard"><GlowButton size="sm">Get Started Free</GlowButton></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Built for NMIMS INNOVATHON 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Your AI Marketing Team. <br />
              <span className="text-gradient gradient-primary">Zero Cost.</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              The autonomous growth OS that replaces your social media manager, 
              content creator, and ad optimizer — on autopilot.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/onboard">
                <GlowButton size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                  Get Started Free
                </GlowButton>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto hover:bg-surface">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* 3D Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 5 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="mt-20 relative perspective-[2000px] transform-style-[preserve-3d]"
          >
            <div className="w-full max-w-4xl mx-auto h-[400px] md:h-[600px] rounded-xl border border-white/20 bg-surface/50 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center relative ring-1 ring-border/50 transition-all hover:rotate-x-0 hover:translate-y-2">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="text-text-muted flex flex-col items-center gap-4">
                <BarChart3 className="w-12 h-12 opacity-50" />
                <p className="font-mono text-sm uppercase tracking-widest">Dashboard Preview</p>
              </div>
            </div>
            {/* Ambient shadow glow */}
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] -z-10 rounded-full opacity-50 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* How it Works Sequence */}
      <section className="py-32 px-6 bg-surface/30 border-y border-border" ref={targetRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-text-secondary">Three steps to autonomous growth</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BuildingIcon className="w-8 h-8 text-primary" />}
              title="1. Tell Us About Your Business"
              desc="Share your target audience, industry, and brand voice. We handle the rest."
              delay={0}
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-ai-glow" />}
              title="2. AI Creates Your Strategy"
              desc="Get a tailored 7-day content calendar complete with copy and creatives."
              delay={0.2}
            />
            <FeatureCard 
              icon={<RocketIcon className="w-8 h-8 text-success" />}
              title="3. Grow on Autopilot"
              desc="Approve once, and let the system publish and optimize automatically."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Stop Managing. <span className="text-ai-glow">Start Growing.</span></h2>
          <Link href="/onboard">
            <GlowButton size="lg" glowColor="ai" className="h-14 px-8 text-lg">
              Create Your Growth Plan — Free
            </GlowButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-text-muted border-t border-border bg-surface">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <p>© 2026 Zero-Touch Growth OS. Built for NMIMS INNOVATHON.</p>
          <div className="flex gap-4">
             <span>Next.js 16</span>
             <span>Tailwind 4</span>
             <span>Gemini</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-8 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="mb-6 w-16 h-16 rounded-2xl bg-background flex items-center justify-center border border-border shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{desc}</p>
    </motion.div>
  )
}
