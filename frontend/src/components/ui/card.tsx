import * as React from "react"
import { cn } from "@/lib/utils"

// Card Component - The main wrapper for the card
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// CardHeader - For the top part of the card, usually includes the title
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 border-b border-zinc-200", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

// CardTitle - Used for the card's title, we use bold text for emphasis
const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-tight text-zinc-900", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

// CardDescription - Short description text, often below the title
const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-zinc-600 mt-2", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

// CardContent - The main content area of the card, for text or other elements
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 text-base text-zinc-700", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

// CardFooter - Typically used for action buttons or additional content at the bottom
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-6 border-t border-zinc-200", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// Export all card components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
