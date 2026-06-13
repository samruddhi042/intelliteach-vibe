import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentClassCard } from "@/components/dashboard/RecentClassCard";
import { EngagementGauge } from "@/components/dashboard/EngagementGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, TrendingUp, Clock, ArrowRight, Radio, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardSummary, useRecentClasses } from "@/hooks/useApi";

const weeklyEngagement = [
  { day: "Mon", engagement: 72 }, { day: "Tue", engagement: 68 },
  { day: "Wed", engagement: 75 }, { day: "Thu", engagement: 82 },
  { day: "Fri", engagement: 78 }, { day: "Sat", engagement: 0 },
  { day: "Sun", engagement: 0 },
];

function StatCardSkeleton() {
  return (
    <Card variant="stat">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: recentClasses, isLoading: classesLoading } = useRecentClasses();

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back, Professor">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : summaryError ? (
            <div className="col-span-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Failed to load stats. Make sure the backend is running on{" "}
              {import.meta.env.VITE_API_URL || "http://localhost:8000"}.
            </div>
          ) : (
            <>
              <StatCard title="Active Students" value={summary?.active_students ?? 0} icon={<Users className="h-6 w-6" />} iconColor="primary" />
              <StatCard title="Avg. Engagement" value={`${summary?.avg_engagement ?? 0}%`} icon={<TrendingUp className="h-6 w-6" />} iconColor="success" />
              <StatCard title="Classes This Week" value={summary?.classes_this_week ?? 0} icon={<Clock className="h-6 w-6" />} iconColor="warning" />
              <StatCard title="Avg. Mastery" value={`${summary?.avg_mastery ?? 0}%`} icon={<GraduationCap className="h-6 w-6" />} iconColor="success" />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Live Class CTA */}
          <Card className="lg:col-span-2 gradient-hero text-primary-foreground overflow-hidden relative">
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-primary-foreground/80">No active class</span>
                </div>
                <h3 className="text-2xl font-bold">Start a Live Class</h3>
                <p className="text-primary-foreground/70 max-w-md">
                  Monitor student engagement in real-time and receive AI-powered intervention suggestions.
                </p>
                <Button
                  variant="secondary"
                  className="mt-2 gap-2 bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                  onClick={() => navigate("/live-class")}
                >
                  <Radio className="h-4 w-4" />
                  Go Live
                </Button>
              </div>
              <div className="hidden md:block">
                <EngagementGauge value={0} size="md" animate={false} />
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/20" />
          </Card>

          {/* Weekly Engagement */}
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyEngagement}>
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(230, 65%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(230, 65%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 15%, 90%)", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="engagement" stroke="hsl(230, 65%, 50%)" strokeWidth={2} fill="url(#engagementGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Classes */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Classes</CardTitle>
            <Button variant="ghost" className="gap-1 text-sm text-muted-foreground">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {classesLoading ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : recentClasses && recentClasses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {recentClasses.slice(0, 6).map((cls) => (
                  <RecentClassCard
                    key={cls.id}
                    subject={cls.subject}
                    topic={cls.topic}
                    date={cls.date}
                    duration={cls.duration}
                    students={cls.students}
                    engagement={cls.engagement}
                    onClick={() => navigate("/recordings")}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No recent classes found. Start your first live class!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
