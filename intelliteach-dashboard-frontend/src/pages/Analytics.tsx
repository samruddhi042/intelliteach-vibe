import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users } from "lucide-react";

const engagementOverTime = [
  { time: "0:00", engagement: 85 },
  { time: "5:00", engagement: 82 },
  { time: "10:00", engagement: 78 },
  { time: "15:00", engagement: 72 },
  { time: "20:00", engagement: 45 },
  { time: "25:00", engagement: 68 },
  { time: "30:00", engagement: 75 },
  { time: "35:00", engagement: 80 },
  { time: "40:00", engagement: 76 },
  { time: "45:00", engagement: 78 },
];

const interventionData = [
  { name: "Before", confusion: 58 },
  { name: "After", confusion: 22 },
];

const participationData = [
  { name: "Active", value: 45, color: "hsl(152, 55%, 45%)" },
  { name: "Moderate", value: 35, color: "hsl(40, 95%, 55%)" },
  { name: "Passive", value: 20, color: "hsl(0, 72%, 55%)" },
];

const insightCards = [
  {
    title: "Most Confusing Concept Today",
    value: "Newton's Second Law",
    subtitle: "F = ma relationship",
    icon: AlertTriangle,
    color: "warning",
  },
  {
    title: "Intervention Success Rate",
    value: "87%",
    subtitle: "+12% vs last week",
    icon: CheckCircle,
    color: "success",
  },
  {
    title: "Average Mastery Improvement",
    value: "+18%",
    subtitle: "Across all concepts",
    icon: TrendingUp,
    color: "primary",
  },
];

export default function Analytics() {
  return (
    <AppLayout title="Engagement Analytics" subtitle="Post-class insights and trends">
      <div className="space-y-6">
        {/* Insight Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {insightCards.map((card, index) => (
            <Card key={index} variant="elevated" className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                  <div
                    className={`rounded-xl p-3 ${
                      card.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : card.color === "success"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement Over Time */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Engagement Over Class Duration</CardTitle>
                <Badge variant="secondary">Today's Class</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementOverTime}>
                    <defs>
                      <linearGradient id="engagementLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(230, 65%, 50%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(230, 65%, 50%)" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                    <XAxis
                      dataKey="time"
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
                      formatter={(value: number) => [`${value}%`, "Engagement"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(230, 65%, 50%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(230, 65%, 50%)", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "hsl(230, 65%, 50%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Confusion spike detected at 20:00 - Intervention triggered</span>
              </div>
            </CardContent>
          </Card>

          {/* Intervention Effectiveness */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Confusion: Before vs After Intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interventionData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                    <XAxis
                      dataKey="name"
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
                      }}
                      formatter={(value: number) => [`${value}%`, "Confusion Level"]}
                    />
                    <Bar dataKey="confusion" radius={[8, 8, 0, 0]}>
                      <Cell fill="hsl(0, 72%, 55%)" />
                      <Cell fill="hsl(152, 55%, 45%)" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">62% reduction in confusion</span>
              </div>
            </CardContent>
          </Card>

          {/* Participation Distribution */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Participation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 15%, 90%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Students"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
