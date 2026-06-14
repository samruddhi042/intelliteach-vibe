import { AppLayout } from "@/components/layout/AppLayout";
import { MasteryHeatmap } from "@/components/dashboard/MasteryHeatmap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  Send,
} from "lucide-react";

const masteryData = [
  { concept: "Newton's First Law", mastery: 85 },
  { concept: "Newton's Second Law", mastery: 48 },
  { concept: "Newton's Third Law", mastery: 72 },
  { concept: "Friction Forces", mastery: 65 },
  { concept: "Free Body Diagrams", mastery: 58 },
  { concept: "Momentum", mastery: 42 },
  { concept: "Impulse", mastery: 35 },
  { concept: "Conservation Laws", mastery: 78 },
];

const homeworkAssignments = [
  {
    id: 1,
    title: "Newton's Laws Practice",
    focusAreas: ["Newton's Second Law", "Momentum"],
    questions: 6,
    estimatedTime: "15 min",
    currentMastery: 48,
    targetMastery: 65,
    status: "pending",
  },
  {
    id: 2,
    title: "Force Analysis",
    focusAreas: ["Free Body Diagrams", "Friction"],
    questions: 8,
    estimatedTime: "20 min",
    currentMastery: 58,
    targetMastery: 75,
    status: "in_progress",
  },
  {
    id: 3,
    title: "Momentum & Impulse",
    focusAreas: ["Momentum", "Impulse"],
    questions: 5,
    estimatedTime: "12 min",
    currentMastery: 35,
    targetMastery: 55,
    status: "completed",
  },
];

export default function Mastery() {
  return (
    <AppLayout title="Mastery & Homework" subtitle="Track student progress and assign adaptive work">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card variant="stat">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Class Mastery</p>
                <p className="text-2xl font-bold">62%</p>
              </div>
            </div>
          </Card>
          <Card variant="stat">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Improvement</p>
                <p className="text-2xl font-bold text-success">+12%</p>
              </div>
            </div>
          </Card>
          <Card variant="stat">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-warning/10 p-3">
                <BookOpen className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Homework</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </Card>
          <Card variant="stat">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-secondary/10 p-3">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concepts Mastered</p>
                <p className="text-2xl font-bold">18/32</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mastery Heatmap */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Student Mastery Heatmap</CardTitle>
              <CardDescription>Class average by concept</CardDescription>
            </CardHeader>
            <CardContent>
              <MasteryHeatmap data={masteryData} />
            </CardContent>
          </Card>

          {/* Personalized Homework */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Adaptive Homework</CardTitle>
                  <CardDescription>AI-generated based on mastery gaps</CardDescription>
                </div>
                <Button variant="gradient" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {homeworkAssignments.map((hw) => (
                <Card
                  key={hw.id}
                  variant={hw.status === "completed" ? "success" : "default"}
                  className="p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{hw.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hw.focusAreas.map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge
                      variant={
                        hw.status === "completed"
                          ? "default"
                          : hw.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }
                      className={hw.status === "completed" ? "bg-success" : ""}
                    >
                      {hw.status === "completed"
                        ? "Completed"
                        : hw.status === "in_progress"
                        ? "In Progress"
                        : "Pending"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{hw.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{hw.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      <span>{hw.currentMastery}% → {hw.targetMastery}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mastery Goal</span>
                      <span className="font-medium">{hw.targetMastery}%</span>
                    </div>
                    <Progress value={hw.currentMastery} className="h-2" />
                  </div>

                  {hw.status === "pending" && (
                    <Button variant="outline" className="w-full mt-3 gap-2">
                      <Send className="h-4 w-4" />
                      Assign to Class
                    </Button>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
