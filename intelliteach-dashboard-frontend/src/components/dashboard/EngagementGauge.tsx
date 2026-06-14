import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface EngagementGaugeProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

const sizeClasses = {
  sm: { container: "w-24 h-24", text: "text-lg", label: "text-xs" },
  md: { container: "w-40 h-40", text: "text-3xl", label: "text-sm" },
  lg: { container: "w-56 h-56", text: "text-4xl", label: "text-base" },
};

export function EngagementGauge({
  value,
  size = "md",
  showLabel = true,
  animate = true,
}: EngagementGaugeProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  const getColor = (val: number) => {
    if (val >= 70) return { stroke: "stroke-engaged", text: "text-engaged", bg: "bg-engaged" };
    if (val >= 40) return { stroke: "stroke-neutral", text: "text-neutral", bg: "bg-neutral" };
    return { stroke: "stroke-confused", text: "text-confused", bg: "bg-confused" };
  };

  const getStatus = (val: number) => {
    if (val >= 70) return "Engaged";
    if (val >= 40) return "Neutral";
    return "Confused";
  };

  const colors = getColor(displayValue);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("relative", sizeClasses[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(colors.stroke, "transition-all duration-300")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizeClasses[size].text, colors.text)}>
            {displayValue}%
          </span>
          {showLabel && (
            <span className={cn("font-medium text-muted-foreground", sizeClasses[size].label)}>
              {getStatus(displayValue)}
            </span>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-engaged" />
          <span className="text-muted-foreground">Engaged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral" />
          <span className="text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-confused" />
          <span className="text-muted-foreground">Confused</span>
        </div>
      </div>
    </div>
  );
}
