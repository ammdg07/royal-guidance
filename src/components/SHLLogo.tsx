import { cn } from "@/lib/utils";

interface SHLLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function SHLLogo({ className, size = "md", showText = true }: SHLLogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Mark */}
      <div className={cn("relative", sizes[size])}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-primary opacity-30 blur-md animate-pulse" />
        
        {/* Main logo container */}
        <div className="relative w-full h-full rounded-xl bg-secondary border border-primary/50 flex items-center justify-center overflow-hidden glow-green-subtle">
          {/* Inner design - stylized Arabic calligraphy inspired shape */}
          <svg
            viewBox="0 0 40 40"
            className="w-3/4 h-3/4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crown/Official symbol */}
            <path
              d="M20 5L25 12H30L28 18L35 25L28 25L25 35H15L12 25L5 25L12 18L10 12H15L20 5Z"
              className="fill-primary stroke-primary"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Inner accent */}
            <circle
              cx="20"
              cy="20"
              r="5"
              className="fill-accent"
            />
          </svg>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-glow-green", textSizes[size])}>
            <span className="text-primary">S</span>
            <span className="text-accent">H</span>
            <span className="text-primary">L</span>
          </span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground -mt-1">
              خدمات حكومية متميزة
            </span>
          )}
        </div>
      )}
    </div>
  );
}
