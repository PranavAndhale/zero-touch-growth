import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface GlowButtonProps extends ButtonProps {
  glowColor?: "primary" | "ai" | "success" | "sunset"
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor = "primary", children, ...props }, ref) => {
    
    const glowClasses = {
      primary: "gradient-primary",
      ai: "gradient-ai",
      success: "gradient-success",
      sunset: "gradient-sunset",
    }
    
    return (
      <div className="relative group inline-block">
        <div 
          className={cn(
            "absolute -inset-0.5 rounded-lg opacity-70 blur-md group-hover:opacity-100 transition duration-500",
            glowClasses[glowColor]
          )}
        />
        <Button
          ref={ref}
          className={cn("relative z-10 w-full border-0", glowClasses[glowColor], className)}
          {...props}
        >
          {children}
        </Button>
      </div>
    )
  }
)
GlowButton.displayName = "GlowButton"
