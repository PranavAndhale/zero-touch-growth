"use client"

import React, { useState } from "react"

interface TextStaggerHoverProps {
  text: string
  className?: string
  charClassName?: string
  staggerMs?: number
  as?: keyof React.JSX.IntrinsicElements
  style?: React.CSSProperties
}

export function TextStaggerHover({
  text,
  className = "",
  charClassName = "",
  staggerMs = 30,
  as: Tag = "span",
  style,
}: TextStaggerHoverProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Tag
      className={`inline-block cursor-default ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-all ${charClassName}`}
          style={{
            transitionDelay: hovered ? `${i * staggerMs}ms` : `${(text.length - 1 - i) * staggerMs * 0.4}ms`,
            transitionDuration: hovered ? "300ms" : "200ms",
            transitionTimingFunction: hovered
              ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "cubic-bezier(0.4, 0, 0.2, 1)",
            transform: hovered ? "translateY(-4px)" : "translateY(0px)",
            opacity: hovered ? 1 : 0.85,
            color: hovered ? "rgb(255, 223, 0)" : undefined,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  )
}
