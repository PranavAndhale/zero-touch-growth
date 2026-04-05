"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Building, Users, Palette, ArrowRight, Check, AlertCircle, Sparkles, Menu as MenuIcon, X, LayoutDashboard, Calendar, PenTool } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassEffect, GlassButton, GlassFilter } from "@/components/ui/liquid-glass"
import { MenuContainer, MenuItem } from "@/components/ui/fluid-menu"
import { YellowSpinner } from "@/components/ui/spinner-1"

// Background images — same Pinterest set as landing page
const BG_IMAGES = [
  "https://i.pinimg.com/736x/9f/10/23/9f1023c3785097536e164d3ef7ac9fb6.jpg",
  "https://i.pinimg.com/736x/bf/f0/4d/bff04d662db206377de801ec0bc42804.jpg",
  "https://i.pinimg.com/736x/90/cf/ec/90cfec4c5230978dba450909c676fd42.jpg",
]

const INDUSTRIES = [
  "Bakery", "Restaurant", "Cafe", "Salon & Beauty", "Gym & Fitness", "Retail Fashion",
  "Electronics Retail", "Grocery", "Pharmacy", "Jewelry", "Interior Design",
  "Real Estate", "Education & Tutoring", "Healthcare & Clinic", "Auto Services",
  "Photography", "Event Management", "Travel Agency", "IT Services", "Other",
]

const TONES = [
  { label: "Professional", value: "professional" },
  { label: "Friendly",     value: "friendly" },
  { label: "Playful",      value: "playful" },
  { label: "Authoritative",value: "authoritative" },
]

const ANALYSIS_STEPS = [
  "Scanning website architecture...",
  "Fetching industry trends...",
  "Loading festival calendar...",
  "Generating AI content strategy...",
  "Building your growth plan...",
]

const STEP_LABELS = ["Business", "Audience", "Brand"]

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUrl(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
  try { new URL(withProtocol); return withProtocol } catch { return undefined }
}

// ── Slide variants ────────────────────────────────────────────────────────────

const slideIn: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.25 } },
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [bgIdx, setBgIdx]         = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [error, setError]         = useState<string | null>(null)

  // Form state
  const [name,           setName]           = useState("")
  const [websiteUrl,     setWebsiteUrl]     = useState("")
  const [industry,       setIndustry]       = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [location,       setLocation]       = useState("")
  const [tone,           setTone]           = useState("professional")
  const [products,       setProducts]       = useState("")
  const [primaryColor,   setPrimaryColor]   = useState("#10B981")
  const [secondaryColor, setSecondaryColor] = useState("#1A1A2E")

  // Cycle bg image every 4s
  useEffect(() => {
    const id = setInterval(() => setBgIdx(i => (i + 1) % BG_IMAGES.length), 4000)
    return () => clearInterval(id)
  }, [])

  const handleAnalyze = async () => {
    setError(null)
    setIsAnalyzing(true)
    setAnalysisStep(0)

    const timers = ANALYSIS_STEPS.map((_, i) =>
      setTimeout(() => setAnalysisStep(i), i * 1400)
    )

    try {
      const payload = {
        name:           name.trim() || "My Business",
        websiteUrl:     sanitizeUrl(websiteUrl),
        industry:       industry || "general",
        targetAudience: targetAudience.trim() || "general audience",
        location:       location.trim() || "India",
        products:       products.trim() || undefined,
        tone,
        brandColors:    [primaryColor, secondaryColor],
      }

      const res  = await fetch("/api/business/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      timers.forEach(clearTimeout)
      setAnalysisStep(ANALYSIS_STEPS.length - 1)

      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed. Please try again.")

      localStorage.setItem("businessId",      data.businessId)
      localStorage.setItem("businessProfile", JSON.stringify(data.profile))
      localStorage.setItem("businessName",    name.trim() || "My Business")

      await new Promise(r => setTimeout(r, 700))
      router.push("/dashboard")
    } catch (err: unknown) {
      timers.forEach(clearTimeout)
      setIsAnalyzing(false)
      setAnalysisStep(0)
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else handleAnalyze()
  }

  // ── Analyzing overlay ─────────────────────────────────────────────────────

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 relative overflow-hidden">
        <GlassFilter />
        {/* Blurred bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${BG_IMAGES[bgIdx]})`, filter: "blur(40px) brightness(0.15)" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="mb-8"
          >
            <Sparkles style={{ color: "rgb(255,223,0)", width: 48, height: 48 }} />
          </motion.div>
          <h2 className="text-3xl font-bold mb-8 tracking-tight" style={{ color: "rgb(255,223,0)" }}>
            Analyzing your business...
          </h2>
          <div className="w-full space-y-4">
            {ANALYSIS_STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: i <= analysisStep ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex items-center gap-3 text-left"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                  style={{
                    background: i < analysisStep
                      ? "rgb(255,223,0)"
                      : i === analysisStep
                        ? "rgba(255,223,0,0.15)"
                        : "rgba(255,255,255,0.05)",
                    border: i === analysisStep ? "1.5px solid rgb(255,223,0)" : "none",
                  }}
                >
                  {i < analysisStep && <Check style={{ width: 12, height: 12, color: "#000" }} />}
                  {i === analysisStep && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: "rgb(255,223,0)" }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-mono tracking-wide uppercase"
                  style={{ color: i <= analysisStep ? "rgba(255,223,0,0.9)" : "rgba(255,255,255,0.2)" }}
                >
                  {s}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 relative overflow-hidden">
      <GlassFilter />

      {/* Background image — dimmed, same as landing */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgIdx}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGES[bgIdx]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </AnimatePresence>
      {/* Extra dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Corner nav */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <div
          className="w-2 h-2 border"
          style={{ borderColor: "rgba(255,223,0,0.3)" }}
        />
        <span
          className="font-mono text-xs tracking-widest uppercase"
          style={{ color: "rgba(255,223,0,0.5)" }}
        >
          Zero-Touch<span style={{ color: "rgb(255,223,0)" }}>.os</span>
        </span>
      </div>

      <div className="fixed top-4 right-6 z-50">
        <MenuContainer>
          <MenuItem icon={
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 transition-all duration-300 origin-center opacity-100 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:rotate-180"
                style={{ color: "rgba(255,223,0,0.6)" }}>
                <MenuIcon size={22} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 transition-all duration-300 origin-center opacity-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:rotate-0"
                style={{ color: "rgba(255,223,0,0.6)" }}>
                <X size={22} strokeWidth={1.5} />
              </div>
            </div>
          } />
          <MenuItem icon={<LayoutDashboard size={20} strokeWidth={1.5} style={{ color: "rgba(255,223,0,0.5)" }} />}
            onClick={() => router.push("/dashboard")} />
          <MenuItem icon={<Calendar size={20} strokeWidth={1.5} style={{ color: "rgba(255,223,0,0.5)" }} />}
            onClick={() => router.push("/planner")} />
          <MenuItem icon={<PenTool size={20} strokeWidth={1.5} style={{ color: "rgba(255,223,0,0.5)" }} />}
            onClick={() => router.push("/studio")} />
        </MenuContainer>
      </div>

      {/* Progress strip */}
      <div className="relative z-10 w-full max-w-xl mb-8 px-1">
        <div className="flex justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => i + 1 < step && setStep(i + 1)}
              className="font-mono text-[10px] tracking-widest uppercase transition-colors"
              style={{ color: step >= i + 1 ? "rgb(255,223,0)" : "rgba(255,255,255,0.2)" }}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
        <div className="h-px w-full" style={{ background: "rgba(255,223,0,0.1)" }}>
          <motion.div
            className="h-full"
            style={{ background: "rgb(255,223,0)" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Form card */}
      <GlassEffect
        className="relative z-10 w-full max-w-xl rounded-2xl border"
        style={{ borderColor: "rgba(255,223,0,0.12)", background: "rgba(0,0,0,0.55)" }}
      >
        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Business ── */}
            {step === 1 && (
              <motion.div key="s1" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,223,0,0.1)", border: "1px solid rgba(255,223,0,0.2)" }}>
                    <Building style={{ width: 18, height: 18, color: "rgb(255,223,0)" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: "rgb(255,223,0)" }}>
                      What&apos;s your business?
                    </h2>
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Let&apos;s start with the basics.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Business Name" required>
                    <YellowInput
                      placeholder="e.g. Sharma Bakery"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoFocus
                    />
                  </Field>

                  <Field label="Industry" required>
                    <select
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg text-sm font-mono outline-none appearance-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,223,0,0.2)",
                        color: industry ? "rgb(255,223,0)" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      <option value="" style={{ background: "#111", color: "#999" }}>Select your industry...</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind} style={{ background: "#111", color: "rgb(255,223,0)" }}>{ind}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Website URL" hint="optional — unlocks deeper AI analysis">
                    <YellowInput
                      placeholder="https://yoursite.com"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                    />
                  </Field>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Audience ── */}
            {step === 2 && (
              <motion.div key="s2" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,223,0,0.1)", border: "1px solid rgba(255,223,0,0.2)" }}>
                    <Users style={{ width: 18, height: 18, color: "rgb(255,223,0)" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: "rgb(255,223,0)" }}>
                      Who are your customers?
                    </h2>
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Helps AI generate targeted content.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Target Audience">
                    <YellowInput
                      placeholder="e.g. Health-conscious families in Mumbai"
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value)}
                      autoFocus
                    />
                  </Field>

                  <Field label="City / Location" hint="optional">
                    <YellowInput
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </Field>

                  <Field label="Tone of Voice">
                    <div className="grid grid-cols-2 gap-2">
                      {TONES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTone(t.value)}
                          className="h-10 rounded-lg text-sm font-mono tracking-wide transition-all"
                          style={{
                            border: tone === t.value ? "1px solid rgb(255,223,0)" : "1px solid rgba(255,255,255,0.1)",
                            background: tone === t.value ? "rgba(255,223,0,0.1)" : "rgba(255,255,255,0.03)",
                            color: tone === t.value ? "rgb(255,223,0)" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Brand ── */}
            {step === 3 && (
              <motion.div key="s3" variants={slideIn} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,223,0,0.1)", border: "1px solid rgba(255,223,0,0.2)" }}>
                    <Palette style={{ width: 18, height: 18, color: "rgb(255,223,0)" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: "rgb(255,223,0)" }}>
                      Your brand identity
                    </h2>
                    <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Applied to your templates automatically.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Primary Color">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                          style={{ accentColor: primaryColor }}
                        />
                        <YellowInput
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="font-mono uppercase text-sm"
                        />
                      </div>
                    </Field>
                    <Field label="Secondary Color">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                          style={{ accentColor: secondaryColor }}
                        />
                        <YellowInput
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="font-mono uppercase text-sm"
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Key Products / Services" hint="optional">
                    <textarea
                      placeholder="e.g. Custom cakes, pastries, gift hampers..."
                      value={products}
                      onChange={e => setProducts(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-mono resize-none outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,223,0,0.2)",
                        color: "rgba(255,223,0,0.85)",
                      }}
                    />
                  </Field>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between items-center pt-6" style={{ borderTop: "1px solid rgba(255,223,0,0.08)" }}>
            <GlassButton
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="text-sm font-mono tracking-widest uppercase px-5 py-2.5"
              style={{ color: "rgba(255,223,0,0.5)", minWidth: 90 } as React.CSSProperties}
            >
              Back
            </GlassButton>

            {step < 3 ? (
              <GlassButton
                onClick={handleNext}
                disabled={step === 1 && (!name.trim() || !industry)}
                className="text-sm font-mono tracking-widest uppercase px-6 py-2.5 gap-2"
                style={{ color: "rgb(255,223,0)", minWidth: 130 } as React.CSSProperties}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </GlassButton>
            ) : (
              <GlassButton
                onClick={handleNext}
                className="text-sm font-mono tracking-widest uppercase px-6 py-2.5 gap-2"
                style={{ color: "rgb(255,223,0)", minWidth: 200 } as React.CSSProperties}
              >
                <Sparkles className="w-4 h-4" /> Analyze Business
              </GlassButton>
            )}
          </div>
        </div>
      </GlassEffect>

      {/* Bottom coord strip */}
      <div
        className="relative z-10 mt-8 font-mono text-xs tracking-widest uppercase"
        style={{ color: "rgba(255,223,0,0.2)" }}
      >
        19.0760° N, 72.8777° E
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5">
        <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,223,0,0.5)" }}>
          {label}
        </span>
        {required && <span style={{ color: "rgba(239,68,68,0.7)", fontSize: 10 }}>*</span>}
        {hint && <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function YellowInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3 rounded-lg text-sm font-mono outline-none transition-colors ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,223,0,0.2)",
        color: "rgba(255,223,0,0.85)",
        ...(props.style || {}),
      }}
      onFocus={e => { e.target.style.borderColor = "rgba(255,223,0,0.5)" }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,223,0,0.2)" }}
    />
  )
}
