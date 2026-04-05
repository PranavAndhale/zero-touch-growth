"use client"

import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrambleTextPlugin)

// ── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: number
  artist: string
  album: string
  category: string
  label: string
  year: string
  image: string
}

interface Config {
  timeZone?: string
  timeUpdateInterval?: number
  idleDelay?: number
  debounceDelay?: number
}

interface Location {
  latitude?: string
  longitude?: string
  display?: boolean
}

interface SocialLinks {
  dashboard?: string
  onboard?: string
  github?: string
}

// ── Time Display ─────────────────────────────────────────────────────────────

const TimeDisplay = ({ config = {} as Config }) => {
  const [time, setTime] = useState({ hours: '', minutes: '', dayPeriod: '' })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: config.timeZone ?? 'Asia/Kolkata',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
      const parts = formatter.formatToParts(now)
      setTime({
        hours: parts.find(p => p.type === 'hour')?.value ?? '',
        minutes: parts.find(p => p.type === 'minute')?.value ?? '',
        dayPeriod: parts.find(p => p.type === 'dayPeriod')?.value ?? '',
      })
    }

    updateTime()
    const id = setInterval(updateTime, config.timeUpdateInterval ?? 1000)
    return () => clearInterval(id)
  }, [config.timeZone, config.timeUpdateInterval])

  return (
    <time className="mp-corner-item mp-bottom-right" id="current-time">
      {time.hours}<span className="mp-time-blink">:</span>{time.minutes} {time.dayPeriod} IST
    </time>
  )
}

// ── Project Item ──────────────────────────────────────────────────────────────

interface ProjectItemProps {
  project: Project
  index: number
  onMouseEnter: (index: number, imageUrl: string) => void
  onMouseLeave: () => void
  isActive: boolean
  isIdle: boolean
}

const ProjectItem = forwardRef<HTMLLIElement, ProjectItemProps>(
  ({ project, index, onMouseEnter, onMouseLeave, isActive, isIdle }, ref) => {
    const textRefs = {
      artist:   useRef<HTMLSpanElement>(null),
      album:    useRef<HTMLSpanElement>(null),
      category: useRef<HTMLSpanElement>(null),
      label:    useRef<HTMLSpanElement>(null),
      year:     useRef<HTMLSpanElement>(null),
    }

    useEffect(() => {
      const keys = ['artist', 'album', 'category', 'label', 'year'] as const
      if (isActive) {
        keys.forEach(key => {
          const el = textRefs[key].current
          if (!el) return
          gsap.killTweensOf(el)
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text: project[key],
              chars: 'qwerty1337h@ck3r',
              revealDelay: 0.3,
              speed: 0.4,
            },
          })
        })
      } else {
        keys.forEach(key => {
          const el = textRefs[key].current
          if (!el) return
          gsap.killTweensOf(el)
          el.textContent = project[key]
        })
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, project])

    return (
      <li
        ref={ref}
        className={`mp-project-item${isActive ? ' active' : ''}${isIdle ? ' idle' : ''}`}
        onMouseEnter={() => onMouseEnter(index, project.image)}
        onMouseLeave={onMouseLeave}
      >
        <span ref={textRefs.artist}   className="mp-project-data mp-artist">{project.artist}</span>
        <span ref={textRefs.album}    className="mp-project-data mp-album">{project.album}</span>
        <span ref={textRefs.category} className="mp-project-data mp-category">{project.category}</span>
        <span ref={textRefs.label}    className="mp-project-data mp-label">{project.label}</span>
        <span ref={textRefs.year}     className="mp-project-data mp-year">{project.year}</span>
      </li>
    )
  }
)
ProjectItem.displayName = 'ProjectItem'

// ── Main Component ────────────────────────────────────────────────────────────

interface MusicPortfolioProps {
  PROJECTS_DATA?: Project[]
  LOCATION?: Location
  CONFIG?: Config
  SOCIAL_LINKS?: SocialLinks
}

const MusicPortfolio = ({
  PROJECTS_DATA = [],
  LOCATION = {},
  CONFIG = {},
  SOCIAL_LINKS = {},
}: MusicPortfolioProps) => {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isIdle, setIsIdle] = useState(true)

  const backgroundRef   = useRef<HTMLDivElement>(null)
  const containerRef    = useRef<HTMLElement>(null)
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleAnimRef     = useRef<gsap.core.Timeline | null>(null)
  const debounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const projectItemsRef = useRef<(HTMLLIElement | null)[]>([])

  // Preload images
  useEffect(() => {
    PROJECTS_DATA.forEach(p => {
      if (p.image) {
        const img = new Image()
        img.src = p.image
      }
    })
  }, [PROJECTS_DATA])

  const stopIdleAnimation = useCallback(() => {
    if (idleAnimRef.current) {
      idleAnimRef.current.kill()
      idleAnimRef.current = null
      projectItemsRef.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 1 })
      })
    }
  }, [])

  const startIdleAnimation = useCallback(() => {
    if (idleAnimRef.current) return
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
    const len = PROJECTS_DATA.length
    projectItemsRef.current.forEach((el, i) => {
      if (!el) return
      tl.to(el, { opacity: 0.05, duration: 0.1, ease: 'power2.inOut' }, i * 0.05)
      tl.to(el, { opacity: 1,    duration: 0.1, ease: 'power2.inOut' }, len * 0.05 * 0.5 + i * 0.05)
    })
    idleAnimRef.current = tl
  }, [PROJECTS_DATA.length])

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (activeIndex === -1) {
        setIsIdle(true)
        startIdleAnimation()
      }
    }, CONFIG.idleDelay ?? 4000)
  }, [activeIndex, startIdleAnimation, CONFIG.idleDelay])

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  const handleProjectMouseEnter = useCallback((index: number, imageUrl: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    stopIdleAnimation()
    stopIdleTimer()
    setIsIdle(false)
    if (activeIndex === index) return
    setActiveIndex(index)
    const bg = backgroundRef.current
    if (imageUrl && bg) {
      bg.style.transition = 'none'
      bg.style.transform  = 'translate(-50%, -50%) scale(1.06)'
      bg.style.backgroundImage = `url(${imageUrl})`
      bg.style.opacity = '1'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bg.style.transition = 'opacity 0.6s ease, transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        bg.style.transform  = 'translate(-50%, -50%) scale(1.0)'
      }))
    }
  }, [activeIndex, stopIdleAnimation, stopIdleTimer])

  const handleProjectMouseLeave = useCallback(() => {
    debounceRef.current = setTimeout(() => {}, 50)
  }, [])

  const handleContainerMouseLeave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setActiveIndex(-1)
    const bg = backgroundRef.current
    if (bg) bg.style.opacity = '0'
    startIdleTimer()
  }, [startIdleTimer])

  useEffect(() => {
    startIdleTimer()
    return () => {
      stopIdleTimer()
      stopIdleAnimation()
    }
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation])

  const loc = LOCATION.display !== false && (LOCATION.latitude || LOCATION.longitude)
    ? `${LOCATION.latitude ?? '19.0760° N'}, ${LOCATION.longitude ?? '72.8777° E'}`
    : '19.0760° N, 72.8777° E'

  return (
    <>
      <div className="mp-root">
        <main
          ref={containerRef}
          className={`mp-portfolio-container${activeIndex !== -1 ? ' has-active' : ''}`}
          onMouseLeave={handleContainerMouseLeave}
        >
          <h1 className="sr-only">Zero-Touch Growth OS</h1>

          {/* Column headers */}
          <div className="mp-header-row">
            <span>Platform</span>
            <span>Module</span>
            <span>Category</span>
            <span>Powered By</span>
            <span>Status</span>
          </div>

          <ul className="mp-project-list" role="list">
            {PROJECTS_DATA.map((project, index) => (
              <ProjectItem
                key={project.id}
                project={project}
                index={index}
                onMouseEnter={handleProjectMouseEnter}
                onMouseLeave={handleProjectMouseLeave}
                isActive={activeIndex === index}
                isIdle={isIdle}
                ref={el => { projectItemsRef.current[index] = el }}
              />
            ))}
          </ul>
        </main>

        <div
          ref={backgroundRef}
          className="mp-background-image"
          role="img"
          aria-hidden="true"
        />

        <aside className="mp-corner-elements">
          <div className="mp-corner-item mp-top-left">
            <div className="mp-corner-square" aria-hidden="true" />
            <span className="mp-brand">Zero-Touch<span className="mp-brand-dot">.os</span></span>
          </div>

          <nav className="mp-corner-item mp-top-right">
            <a href={SOCIAL_LINKS.dashboard ?? '/dashboard'}>Dashboard</a>
            {' | '}
            <a href={SOCIAL_LINKS.onboard ?? '/onboard'}>Get Started</a>
            {' | '}
            <a href={SOCIAL_LINKS.github ?? 'https://github.com/PranavAndhale/zero-touch-growth'} target="_blank" rel="noopener">GitHub</a>
          </nav>

          <div className="mp-corner-item mp-bottom-left">{loc}</div>
          <TimeDisplay config={CONFIG} />
        </aside>
      </div>
    </>
  )
}

export default MusicPortfolio
