"use client"

import React from "react"

// ── Types ────────────────────────────────────────────────────────────────────

interface GlassEffectProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
  href?: string
  target?: string
  as?: "button" | "div" | "a"
}

// ── SVG Filter (render once at page level) ───────────────────────────────────

export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <defs>
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
)

// ── Glass Effect Wrapper ─────────────────────────────────────────────────────

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  onClick,
  disabled,
  href,
  target = "_self",
  as = "div",
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow: "0 6px 6px rgba(0,0,0,0.25), 0 0 20px rgba(0,0,0,0.15)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  }

  const inner = (
    <div
      className={`relative flex font-semibold overflow-hidden cursor-pointer transition-all duration-500 ${className}`}
      style={glassStyle}
      onClick={disabled ? undefined : onClick}
    >
      {/* Blur layer */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ backdropFilter: "blur(4px)", filter: "url(#glass-distortion)", isolation: "isolate" }}
      />
      {/* Tint */}
      <div className="absolute inset-0 z-10 rounded-[inherit]" style={{ background: "rgba(255,255,255,0.08)" }} />
      {/* Inner highlight border */}
      <div
        className="absolute inset-0 z-20 rounded-[inherit] overflow-hidden"
        style={{ boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.25), inset -1px -1px 1px rgba(255,255,255,0.1)" }}
      />
      {/* Content */}
      <div className="relative z-30 w-full">{children}</div>
    </div>
  )

  if (href) {
    return <a href={href} target={target} rel="noopener noreferrer">{inner}</a>
  }
  if (as === "button") {
    return (
      <button onClick={disabled ? undefined : onClick} disabled={disabled} className="block w-full" type="button">
        {inner}
      </button>
    )
  }
  return inner
}

// ── Glass Button (standalone, ready-to-use) ───────────────────────────────────

export const GlassButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  href?: string
  style?: React.CSSProperties
}> = ({ children, onClick, disabled, className = "", href, style }) => (
  <GlassEffect
    href={href}
    onClick={onClick}
    disabled={disabled}
    as="button"
    className={`rounded-2xl px-6 py-3 hover:scale-[1.02] active:scale-[0.98] ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    style={style}
  >
    <div
      className="transition-all duration-500 flex items-center justify-center gap-2"
      style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" }}
    >
      {children}
    </div>
  </GlassEffect>
)
