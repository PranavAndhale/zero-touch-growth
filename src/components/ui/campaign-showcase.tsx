"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

// --- Custom Text Scramble Hook (replaces GSAP ScrambleTextPlugin) ---
function useScrambleText(text: string, isActive: boolean) {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }
    
    let interval: ReturnType<typeof setInterval>;
    let iteration = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*1234567890";
    
    interval = setInterval(() => {
      setDisplayText((t) => 
        t.split("").map((letter, index) => {
          if(index < iteration) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if(iteration >= text.length) {
        clearInterval(interval);
      }
      
      // Speed of scramble transition
      iteration += 1 / 3;
    }, 30);
    
    return () => clearInterval(interval);
  }, [isActive, text]);

  return displayText;
}

// --- Individual Item Component ---
const CampaignItem = ({ project, index, onMouseEnter, onMouseLeave, isActive, isIdle }: any) => {
  const itemRef = useRef<HTMLLIElement>(null);
  
  const scBusiness = useScrambleText(project.business, isActive);
  const scCampaign = useScrambleText(project.campaign, isActive);
  const scFormat = useScrambleText(project.format, isActive);
  const scRoi = useScrambleText(project.roi, isActive);
  const scStatus = useScrambleText(project.status, isActive);

  return (
    <li 
      ref={itemRef}
      className={`group/item flex items-center justify-between border-t border-border py-6 px-4 md:px-8 transition-all duration-300 font-mono text-sm tracking-widest cursor-pointer ${isActive ? 'bg-surface/80 shadow-md scale-[1.01] z-20' : 'hover:bg-surface/50'} ${isIdle ? 'opacity-30' : 'opacity-100'}`}
      onMouseEnter={() => onMouseEnter(index, project.image)}
      onMouseLeave={onMouseLeave}
    >
      <span className={`flex-1 font-bold ${isActive ? 'text-primary' : 'text-text-secondary group-hover/item:text-foreground'}`}>
        {scBusiness}
      </span>
      <span className={`flex-1 hidden md:block font-bold ${isActive ? 'text-foreground' : 'text-text-secondary group-hover/item:text-foreground'}`}>
        {scCampaign}
      </span>
      <span className={`w-32 hidden lg:block font-bold ${isActive ? 'text-foreground' : 'text-text-secondary group-hover/item:text-foreground'}`}>
        {scFormat}
      </span>
      <span className={`w-32 hidden sm:block font-bold ${isActive ? 'text-success' : 'text-text-secondary group-hover/item:text-foreground'}`}>
        {scRoi}
      </span>
      <span className={`w-24 text-right font-bold ${isActive ? 'text-ai-glow' : 'text-text-secondary group-hover/item:text-foreground'}`}>
        {scStatus}
      </span>
    </li>
  );
};

// --- Main Showcase Component ---
export function CampaignShowcase() {
  const PROJECTS_DATA = [
    {
      id: 1,
      business: "SHARMA BAKERY",
      campaign: "DIWALI HAMPERS",
      format: "CAROUSEL",
      roi: "4.2X ROAS",
      status: "LIVE",
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 2,
      business: "FITZONE GYM",
      campaign: "SUMMER SHRED",
      format: "VIDEO AD",
      roi: "3.8X ROAS",
      status: "LIVE",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 3,
      business: "PRIYA'S BOUTIQUE",
      campaign: "WEDDING WEAR",
      format: "SINGLE IMAGE",
      roi: "6.1X ROAS",
      status: "PAUSED",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 4,
      business: "TECHFIX REPAIRS",
      campaign: "SCREEN WEEKEND",
      format: "CAROUSEL",
      roi: "5.5X ROAS",
      status: "LIVE",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const CONFIG = { idleDelay: 3000 };

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isIdle, setIsIdle] = useState(true);
  
  const backgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const projectItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Preload images
  useEffect(() => {
    PROJECTS_DATA.forEach(p => {
      if (p.image) {
        const img = new Image();
        img.src = p.image;
      }
    });
  }, []);

  // Idle Animation logic
  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    projectItemsRef.current.forEach((item, index) => {
      if (!item) return;
      tl.to(item, { opacity: 0.2, duration: 0.1, ease: "power2.inOut" }, index * 0.05);
      tl.to(item, { opacity: 1, duration: 0.1, ease: "power2.inOut" }, (PROJECTS_DATA.length * 0.025) + index * 0.05);
    });
    idleAnimationRef.current = tl;
  }, [PROJECTS_DATA.length]);

  const stopIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      idleAnimationRef.current = null;
      projectItemsRef.current.forEach(item => {
        if (item) gsap.set(item, { opacity: 1 });
      });
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (activeIndex === -1) {
        setIsIdle(true);
        startIdleAnimation();
      }
    }, CONFIG.idleDelay);
  }, [activeIndex, startIdleAnimation, CONFIG.idleDelay]);

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const handleProjectMouseEnter = useCallback((index: number, imageUrl: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    stopIdleAnimation();
    stopIdleTimer();
    setIsIdle(false);
    
    if (activeIndex === index) return;
    setActiveIndex(index);
    
    if (imageUrl && backgroundRef.current) {
      const bg = backgroundRef.current;
      bg.style.transition = "none";
      bg.style.transform = "scale(1.1)";
      bg.style.backgroundImage = `url(${imageUrl})`;
      bg.style.opacity = "0.4"; // Keep it slightly subtle to not wash out text
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bg.style.transition = "opacity 0.6s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          bg.style.transform = "scale(1.0)";
        });
      });
    }
  }, [activeIndex, stopIdleAnimation, stopIdleTimer]);

  const handleProjectMouseLeave = useCallback(() => {
    // We let activeIndex stay so the background remains until container off-hover
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveIndex(-1);
    
    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = "0";
    }
    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
      stopIdleAnimation();
    };
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation]);

  return (
    <section className="relative w-full py-24 min-h-[600px] flex flex-col justify-center bg-black overflow-hidden border-y border-border/50">
      
      {/* Dynamic Background Image */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-0 mix-blend-screen"
        style={{ filter: "grayscale(20%)" }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

      <main 
        ref={containerRef}
        className="w-full max-w-5xl mx-auto z-10 relative px-6"
        onMouseLeave={handleContainerMouseLeave}
      >
        <div className="mb-10 pl-4 border-l-2 border-primary">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-2">Featured AI Campaigns</h2>
          <p className="text-text-secondary max-w-xl">Zero-Touch Growth OS autonomously designs, deploys, and scales thousands of ad creatives weekly. Hover to preview active deployments.</p>
        </div>

        <ul className="flex flex-col w-full m-0 p-0 border-b border-border/80" role="list">
          {/* Header Row */}
          <li className="flex items-center justify-between py-4 px-4 md:px-8 text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
             <span className="flex-1">Business</span>
             <span className="flex-1 hidden md:block">Campaign</span>
             <span className="w-32 hidden lg:block">Format</span>
             <span className="w-32 hidden sm:block text-success/80">Target ROI</span>
             <span className="w-24 text-right">Status</span>
          </li>

          {PROJECTS_DATA.map((project, index) => (
            <CampaignItem
              key={project.id}
              project={project}
              index={index}
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              isActive={activeIndex === index}
              isIdle={isIdle}
              ref={(el: HTMLLIElement | null) => { projectItemsRef.current[index] = el; }}
            />
          ))}
        </ul>
      </main>
    </section>
  );
}
