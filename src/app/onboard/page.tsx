"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Building, Users, Palette, ArrowRight, Check } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setIsAnalyzing(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 4000)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
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
        <h2 className="text-3xl font-bold mb-4 font-sans tracking-tight">Analyzing your business...</h2>
        <div className="max-w-md w-full space-y-4 text-text-secondary font-mono text-sm max-h-40 overflow-hidden">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>Scanning website architecture...</motion.p>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}>Analyzing industry trends data...</motion.p>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}}>Generating bespoke content pillars...</motion.p>
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
                  <h2 className="text-3xl font-bold mb-2">What's your business?</h2>
                  <p className="text-text-secondary">Let's start with the basics to tailor your workspace.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-semibold mb-1block">Business Name</label>
                    <Input placeholder="e.g. Sharma Bakery" className="h-12 text-lg" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Website (Optional)</label>
                    <Input placeholder="https://" className="h-12" />
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
                    <Input placeholder="e.g. Health-conscious millennials" className="h-12" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Tone of Voice</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {['Professional', 'Friendly', 'Playful', 'Authoritative'].map((t, i) => (
                         <div key={t} className={`flex items-center justify-center h-10 border rounded-md cursor-pointer transition-colors ${i===1 ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-surface text-text-secondary'}`}>
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
                  <p className="text-text-secondary">We'll apply these colors to your templates automatically.</p>
                </div>
                
                <div className="space-y-6 pt-4">
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold block">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#10B981] shadow-inner" />
                        <Input value="#10B981" readOnly className="font-mono text-sm uppercase" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold block">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A2E] shadow-inner" />
                        <Input value="#1A1A2E" readOnly className="font-mono text-sm uppercase" />
                      </div>
                    </div>
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
               <Button onClick={handleNext} className="gap-2">
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
