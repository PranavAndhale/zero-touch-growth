import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.ComponentProps<'div'> {
  size?: number
  disabled?: boolean
}

// Yellow spinner — matches landing page accent color rgb(255,223,0)
export function Spinner({ size = 16, disabled, className, ...props }: SpinnerProps) {
  if (disabled) return null

  const sizePx = `${size}px`
  const barWidth = `${(size * 0.2).toFixed(2)}px`
  const barHeight = `${(size * 0.075).toFixed(2)}px`

  return (
    <div className={cn('relative', className)} style={{ width: sizePx, height: sizePx }} {...props}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 flex justify-center"
          style={{
            transform: `rotate(${i * 45}deg)`,
            opacity: 0.2 + i * 0.1,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgb(255, 223, 0)',
              width: barWidth,
              height: barHeight,
              borderRadius: '9999px',
              animation: `spin 0.8s linear infinite`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes spin {
          0%   { opacity: 1; }
          100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  )
}

// Simpler CSS-only version (use this one — no jsx style required)
export function YellowSpinner({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size * 0.06)}px solid rgba(255,223,0,0.15)`,
        borderTopColor: 'rgb(255,223,0)',
        borderRadius: '50%',
        animation: 'mp-spin 0.75s linear infinite',
      }}
    />
  )
}
