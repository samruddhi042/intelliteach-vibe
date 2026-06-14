import { cn } from "@/lib/utils";

interface ConceptMastery {
  concept: string;
  mastery: number;
}

interface MasteryHeatmapProps {
  data: ConceptMastery[];
}

const getMasteryColor = (mastery: number) => {
  if (mastery >= 80) return "bg-success text-success-foreground";
  if (mastery >= 60) return "bg-success/60 text-foreground";
  if (mastery >= 40) return "bg-warning/60 text-foreground";
  if (mastery >= 20) return "bg-warning text-warning-foreground";
  return "bg-destructive/70 text-destructive-foreground";
};

export function MasteryHeatmap({ data }: MasteryHeatmapProps) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.concept}
          className="flex items-center gap-3 group"
        >
          <span className="text-sm text-muted-foreground w-40 truncate">
            {item.concept}
          </span>
          <div className="flex-1 h-8 rounded-lg bg-muted overflow-hidden relative">
            <div
              className={cn(
                "h-full transition-all duration-500 flex items-center justify-end pr-3",
                getMasteryColor(item.mastery)
              )}
              style={{ width: `${item.mastery}%` }}
            >
              <span className="text-xs font-semibold">{item.mastery}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
