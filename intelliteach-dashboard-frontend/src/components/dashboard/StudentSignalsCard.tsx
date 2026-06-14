import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentSignalsCardProps {
  gotIt: number;
  confused: number;
  mcqAccuracy: number;
}

export function StudentSignalsCard({
  gotIt,
  confused,
  mcqAccuracy,
}: StudentSignalsCardProps) {
  const total = gotIt + confused;
  const gotItPercentage = total > 0 ? (gotIt / total) * 100 : 50;

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Student Signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Got It / Confused Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-success" />
              <span className="font-medium">Got it</span>
              <span className="text-muted-foreground">({gotIt})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">({confused})</span>
              <span className="font-medium">Confused</span>
              <ThumbsDown className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full bg-success transition-all duration-500"
              style={{ width: `${gotItPercentage}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-destructive transition-all duration-500"
              style={{ width: `${100 - gotItPercentage}%` }}
            />
          </div>
        </div>

        {/* MCQ Accuracy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Live MCQ Accuracy</span>
            </div>
            <span
              className={cn(
                "text-2xl font-bold",
                mcqAccuracy >= 70
                  ? "text-success"
                  : mcqAccuracy >= 40
                  ? "text-warning"
                  : "text-destructive"
              )}
            >
              {mcqAccuracy}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "absolute left-0 top-0 h-full transition-all duration-500 rounded-full",
                mcqAccuracy >= 70
                  ? "bg-success"
                  : mcqAccuracy >= 40
                  ? "bg-warning"
                  : "bg-destructive"
              )}
              style={{ width: `${mcqAccuracy}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
