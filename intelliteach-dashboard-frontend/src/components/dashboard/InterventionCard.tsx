import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InterventionCardProps {
  topic: string;
  confusionLevel: "high" | "medium" | "low";
  suggestion: string;
  onMarkDone?: () => void;
  className?: string;
}

const levelConfig = {
  high: {
    icon: AlertTriangle,
    label: "High Confusion Detected",
    border: "border-l-destructive",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  medium: {
    icon: AlertTriangle,
    label: "Moderate Confusion",
    border: "border-l-warning",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  low: {
    icon: Lightbulb,
    label: "Minor Attention Needed",
    border: "border-l-neutral",
    iconBg: "bg-neutral/10",
    iconColor: "text-neutral",
  },
};

export function InterventionCard({
  topic,
  confusionLevel,
  suggestion,
  onMarkDone,
  className,
}: InterventionCardProps) {
  const config = levelConfig[confusionLevel];
  const Icon = config.icon;

  return (
    <Card
      variant="intervention"
      className={cn(
        "animate-scale-in border-l-4",
        config.border,
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", config.iconBg)}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <div>
              <span className={cn("text-sm font-semibold", config.iconColor)}>
                ⚠ {config.label}
              </span>
              <CardTitle className="mt-1 text-base">Topic: {topic}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Suggested Action:
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            "{suggestion}"
          </p>
        </div>
        <Button
          variant="success"
          className="w-full gap-2"
          onClick={onMarkDone}
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark Intervention Done
        </Button>
      </CardContent>
    </Card>
  );
}
