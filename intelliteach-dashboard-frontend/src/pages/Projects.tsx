import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FolderPlus,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Upload,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Renewable Energy Solutions",
    subject: "Physics",
    team: ["AS", "BK", "CM", "DP"],
    deadline: "Jan 20, 2026",
    progress: 65,
    tasks: { completed: 5, total: 8 },
    status: "in_progress",
  },
  {
    id: 2,
    title: "Chemical Reactions in Daily Life",
    subject: "Chemistry",
    team: ["EF", "GH", "IJ"],
    deadline: "Jan 25, 2026",
    progress: 40,
    tasks: { completed: 3, total: 7 },
    status: "in_progress",
  },
  {
    id: 3,
    title: "Mathematical Modeling",
    subject: "Mathematics",
    team: ["KL", "MN", "OP", "QR"],
    deadline: "Jan 15, 2026",
    progress: 100,
    tasks: { completed: 6, total: 6 },
    status: "completed",
  },
];

const softSkillsData = [
  { skill: "Team Collaboration", score: 85, trend: "+5%" },
  { skill: "Communication", score: 78, trend: "+3%" },
  { skill: "Problem Solving", score: 82, trend: "+8%" },
  { skill: "Time Management", score: 70, trend: "-2%" },
];

const milestones = [
  { title: "Research Phase", completed: true },
  { title: "Data Collection", completed: true },
  { title: "Analysis", completed: true },
  { title: "Prototype Building", completed: false },
  { title: "Presentation Prep", completed: false },
  { title: "Final Submission", completed: false },
];

export default function Projects() {
  return (
    <AppLayout title="Project-Based Learning" subtitle="Manage team projects and track soft skills">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {projects.filter((p) => p.status === "in_progress").length} Active Projects
            </Badge>
            <Badge variant="outline" className="text-sm">
              {projects.filter((p) => p.status === "completed").length} Completed
            </Badge>
          </div>
          <Button variant="gradient" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Create Project
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Project Cards */}
          <div className="lg:col-span-2 space-y-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                variant={project.status === "completed" ? "success" : "elevated"}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{project.subject}</Badge>
                        {project.status === "completed" && (
                          <Badge className="bg-success gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                    </div>
                    <div className="flex -space-x-2">
                      {project.team.map((member) => (
                        <Avatar key={member} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {member}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {project.tasks.completed}/{project.tasks.total} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.team.length} members
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.deadline}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Milestones */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Project Milestones</CardTitle>
                <CardDescription>Renewable Energy Solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        milestone.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Soft Skills */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Soft Skill Analytics</CardTitle>
                <CardDescription>Team performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {softSkillsData.map((item) => (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.score}</span>
                        <span
                          className={`text-xs ${
                            item.trend.startsWith("+")
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {item.trend}
                        </span>
                      </div>
                    </div>
                    <Progress value={item.score} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Artifact
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View Peer Feedback
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Star className="h-4 w-4" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
