import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EngagementGauge } from "@/components/dashboard/EngagementGauge";
import { InterventionCard } from "@/components/dashboard/InterventionCard";
import { StudentSignalsCard } from "@/components/dashboard/StudentSignalsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Users,
  Clock,
  BookOpen,
  Play,
  Square,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function LiveClass() {
  const [isLive, setIsLive] = useState(true);
  const [engagementValue] = useState(42);

  const handleInterventionDone = () => {
    toast.success("Intervention marked as done", {
      description: "Great job addressing student confusion!",
    });
  };

  const handleStartStop = () => {
    setIsLive(!isLive);
    toast(isLive ? "Class ended" : "Class started", {
      description: isLive
        ? "Session recording saved"
        : "Real-time monitoring active",
    });
  };

  return (
    <AppLayout
      title="Live Class"
      subtitle="Real-time classroom intelligence"
    >
      <div className="space-y-6">
        {/* Class Header */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="gradient-hero p-6 text-primary-foreground">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {isLive && (
                    <Badge
                      variant="destructive"
                      className="gap-1.5 animate-pulse bg-destructive"
                    >
                      <span className="h-2 w-2 rounded-full bg-destructive-foreground" />
                      LIVE
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                    Physics
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold">Newton's Laws of Motion</h2>
                <p className="text-primary-foreground/70">
                  Chapter 3: Force and Acceleration
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>32 students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>23:45 elapsed</span>
                  </div>
                </div>
                <Button
                  variant={isLive ? "destructive" : "success"}
                  className="gap-2"
                  onClick={handleStartStop}
                >
                  {isLive ? (
                    <>
                      <Square className="h-4 w-4" />
                      End Class
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Class
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Engagement */}
          <div className="space-y-6">
            {/* Engagement Gauge */}
            <Card variant="elevated">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Live Engagement Index</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <EngagementGauge value={engagementValue} size="lg" />
              </CardContent>
            </Card>

            {/* Student Signals */}
            <StudentSignalsCard gotIt={18} confused={14} mcqAccuracy={52} />
          </div>

          {/* Center Column - Intervention */}
          <div className="lg:col-span-2 space-y-6">
            {/* Intervention Card */}
            <InterventionCard
              topic="Newton's Second Law"
              confusionLevel="high"
              suggestion="Re-explain using a worked example. Consider using the elevator problem to demonstrate F=ma in a relatable context."
              onMarkDone={handleInterventionDone}
            />

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Send Quick Poll</span>
                    <span className="text-xs text-muted-foreground">
                      Check understanding
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Pop Quiz</span>
                    <span className="text-xs text-muted-foreground">
                      3-question MCQ
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Share Resource</span>
                    <span className="text-xs text-muted-foreground">
                      Send materials
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Feed */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Live Class Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "23:42", event: "MCQ Response", detail: "18/32 answered correctly (56%)", type: "neutral" },
                    { time: "23:38", event: "Confusion Spike", detail: "Topic: Newton's Second Law", type: "warning" },
                    { time: "23:35", event: "Student Question", detail: "How does mass affect acceleration?", type: "info" },
                    { time: "23:30", event: "Engagement High", detail: "85% active participation", type: "success" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-lg bg-muted/50 p-3"
                    >
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.time}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.event}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.type === "success"
                            ? "default"
                            : item.type === "warning"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          item.type === "success"
                            ? "bg-success"
                            : item.type === "warning"
                            ? "bg-warning text-warning-foreground"
                            : ""
                        }
                      >
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
