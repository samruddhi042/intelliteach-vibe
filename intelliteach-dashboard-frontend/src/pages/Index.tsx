import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentClassCard } from "@/components/dashboard/RecentClassCard";
import { EngagementGauge } from "@/components/dashboard/EngagementGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowRight,
  Radio,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const weeklyEngagement = [
  { day: "Mon", engagement: 72 },
  { day: "Tue", engagement: 68 },
  { day: "Wed", engagement: 75 },
  { day: "Thu", engagement: 82 },
  { day: "Fri", engagement: 78 },
  { day: "Sat", engagement: 0 },
  { day: "Sun", engagement: 0 },
];

const recentClasses = [
  {
    subject: "Physics",
    topic: "Newton's Laws of Motion",
    date: "Today",
    duration: "45 min",
    students: 32,
    engagement: 78,
  },
  {
    subject: "Mathematics",
    topic: "Quadratic Equations",
    date: "Yesterday",
    duration: "50 min",
    students: 28,
    engagement: 65,
  },
  {
    subject: "Chemistry",
    topic: "Chemical Bonding",
    date: "Jan 4",
    duration: "40 min",
    students: 30,
    engagement: 82,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back, Professor">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Students"
            value={156}
            change={12}
            changeLabel="vs last week"
            icon={<Users className="h-6 w-6" />}
            iconColor="primary"
          />
          <StatCard
            title="Avg. Engagement"
            value="76%"
            change={5}
            changeLabel="improvement"
            icon={<TrendingUp className="h-6 w-6" />}
            iconColor="success"
          />
          <StatCard
            title="Classes This Week"
            value={12}
            icon={<Clock className="h-6 w-6" />}
            iconColor="warning"
          />
          <StatCard
            title="Avg. Mastery"
            value="68%"
            change={8}
            changeLabel="vs last month"
            icon={<GraduationCap className="h-6 w-6" />}
            iconColor="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Live Class CTA */}
          <Card className="lg:col-span-2 gradient-hero text-primary-foreground overflow-hidden relative">
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-primary-foreground/80">
                    No active class
                  </span>
                </div>
                <h3 className="text-2xl font-bold">Start a Live Class</h3>
                <p className="text-primary-foreground/70 max-w-md">
                  Monitor student engagement in real-time and receive AI-powered
                  intervention suggestions.
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
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 15%, 90%)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(230, 65%, 50%)"
                      strokeWidth={2}
                      fill="url(#engagementGradient)"
                    />
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
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentClasses.map((cls, index) => (
                <RecentClassCard
                  key={index}
                  {...cls}
                  onClick={() => navigate("/recordings")}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
