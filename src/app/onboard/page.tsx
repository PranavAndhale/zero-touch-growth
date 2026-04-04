"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Building, Users, Palette, ArrowRight, Check, AlertCircle } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const INDUSTRIES = [
  "Bakery", "Restaurant", "Cafe", "Salon & Beauty", "Gym & Fitness", "Retail Fashion",
  "Electronics Retail", "Grocery", "Pharmacy", "Jewelry", "Interior Design",
  "Real Estate", "Education & Tutoring", "Healthcare & Clinic", "Auto Services",
  "Photography", "Event Management", "Travel Agency", "IT Services", "Other"
]

const TONES = ['Professional', 'Friendly', 'Playful', 'Authoritative']

const ANALYSIS_STEPS = [
  { label: "Scanning website architecture...", delay: 0 },
  { label: "Analyzing industry trends...", delay: 1.2 },
  { label: "Fetching upcoming festivals...", delay: 2.4 },
  { label: "Generating content strategy with AI...", delay: 3.6 },
  { label: "Building your growth plan...", delay: 5.0 },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [name, setName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [industry, setIndustry] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [location, setLocation] = useState("")
  const [tone, setTone] = useState("Professional")
  const [products, setProducts] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#10B981")
  const [secondaryColor, setSecondaryColor] = useState("#1A1A2E")

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const handleAnalyze = async () => {
    setError(null)
    setIsAnalyzing(true)
    setAnalysisStep(0)

    // Advance analysis step display while waiting
    const stepTimers = ANALYSIS_STEPS.map((s, i) =>
      setTimeout(() => setAnalysisStep(i), s.delay * 1000)
    )

    try {
      const res = await fetch("/api/business/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "My Business",
          websiteUrl: websiteUrl.trim() || undefined,
          industry: industry || "Other",
          targetAudience: targetAudience.trim() || "general audience",
          location: location.trim() || "India",
          products: products.trim() || undefined,
          tone: tone.toLowerCase() as "professional" | "friendly" | "playful" | "authoritative",
          brandColors: [primaryColor, secondaryColor],
        }),
      })

      stepTimers.forEach(clearTimeout)
      setAnalysisStep(ANALYSIS_STEPS.length - 1)

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed. Please try again.")
      }

      // Persist to localStorage
      localStorage.setItem("businessId", data.businessId)
      localStorage.setItem("businessProfile", JSON.stringify(data.profile))
      localStorage.setItem("businessName", name.trim() || "My Business")

      // Small pause so user sees the final step
      await new Promise((r) => setTimeout(r, 800))
      router.push("/dashboard")
    } catch (err: unknown) {
      stepTimers.forEach(clearTimeout)
      setIsAnalyzing(false)
      setAnalysisStep(0)
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleAnalyze()
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 rounded-full bg-ai-glow/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
        >
          <Sparkles className="w-12 h-12 text-ai-glow" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-6 font-sans tracking-tight">Analyzing your business...</h2>
        <div className="max-w-md w-full space-y-3">
          {ANALYSIS_STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= analysisStep ? 1 : 0.2, x: 0 }}
              transition={{ delay: s.delay * 0.2, duration: 0.4 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${i < analysisStep ? 'bg-success text-white' : i === analysisStep ? 'bg-ai-glow/20 border-2 border-ai-glow' : 'bg-border'}`}>
                {i < analysisStep && <Check className="w-3 h-3" />}
                {i === analysisStep && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-ai-glow" />}
              </div>
              <span className={i <= analysisStep ? 'text-foreground font-medium' : 'text-text-muted'}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface md:bg-background flex flex-col items-center pt-20 px-4 sm:px-6">

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-10">
        <div className="flex justify-between mb-2">
          {['Business', 'Audience', 'Brand'].map((item, i) => (
            <span key={item} className={`text-xs font-semibold ${step >= i + 1 ? 'text-primary' : 'text-text-muted'}`}>
              Step {i + 1}: {item}
            </span>
          ))}
        </div>
        <div className="h-2 bg-border rounded-full w-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: `${((step - 1) / 3) * 100}%` }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="w-full max-w-2xl mb-4 p-4 rounded-lg border border-error/30 bg-error/10 flex items-center gap-3 text-sm text-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Card */}
      <Card className="w-full max-w-2xl border-0 md:border md:shadow-xl bg-surface overflow-hidden relative">
        <CardContent className="p-8 md:p-12">
          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                    <Building />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">What&apos;s your business?</h2>
                  <p className="text-text-secondary">Let&apos;s start with the basics to tailor your workspace.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Business Name <span className="text-error">*</span></label>
                    <Input
                      placeholder="e.g. Sharma Bakery"
                      className="h-12 text-lg"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Industry <span className="text-error">*</span></label>
                    <select
                      className="w-full h-12 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="">Select your industry...</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Website URL <span className="text-text-muted text-xs font-normal">(optional — helps with deeper analysis)</span></label>
                    <Input
                      placeholder="https://yourwebsite.com"
                      className="h-12"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary">
                    <Users />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Who are your customers?</h2>
                  <p className="text-text-secondary">This helps the AI generate correctly targeted content.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Target Audience</label>
                    <Input
                      placeholder="e.g. Health-conscious families in Mumbai"
                      className="h-12"
                      autoFocus
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">City / Location <span className="text-text-muted text-xs font-normal">(optional)</span></label>
                    <Input
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="h-12"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Tone of Voice</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {TONES.map((t) => (
                        <div
                          key={t}
                          onClick={() => setTone(t)}
                          className={`flex items-center justify-center h-10 border rounded-md cursor-pointer transition-colors text-sm ${tone === t ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-surface text-text-secondary'}`}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div>
                  <div className="w-12 h-12 bg-ai-glow/10 rounded-xl flex items-center justify-center mb-6 text-ai-glow">
                    <Palette />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Your brand identity</h2>
                  <p className="text-text-secondary">These colors will be applied to your templates automatically.</p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold block">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent"
                        />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-sm uppercase" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold block">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent"
                        />
                        <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="font-mono text-sm uppercase" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1 block">Key Products / Services <span className="text-text-muted text-xs font-normal">(optional)</span></label>
                    <textarea
                      placeholder="e.g. Custom cakes, pastries, gift hampers, corporate orders..."
                      className="w-full h-24 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={products}
                      onChange={(e) => setProducts(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-10 flex justify-between items-center border-t border-border pt-6">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="gap-2"
                disabled={step === 1 && (!name.trim() || !industry)}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <GlowButton glowColor="ai" onClick={handleNext} className="gap-2 px-8">
                <Sparkles className="w-4 h-4" /> Analyze Business
              </GlowButton>
            )}
          </div>
        </CardContent>
      </Card>

    </main>
  )
}
