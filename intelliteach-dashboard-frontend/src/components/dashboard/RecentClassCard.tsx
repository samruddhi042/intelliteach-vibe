import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecentClassCardProps {
  subject: string;
  topic: string;
  date: string;
  duration: string;
  students: number;
  engagement: number;
  onClick?: () => void;
}

export function RecentClassCard({
  subject,
  topic,
  date,
  duration,
  students,
  engagement,
  onClick,
}: RecentClassCardProps) {
  return (
    <Card
      variant="default"
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {subject}
              </span>
            </div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {topic}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{students}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                engagement >= 70
                  ? "bg-success/10 text-success"
                  : engagement >= 40
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <TrendingUp className="h-3 w-3" />
              {engagement}%
            </div>
            <span className="text-[10px] text-muted-foreground">Engagement</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
