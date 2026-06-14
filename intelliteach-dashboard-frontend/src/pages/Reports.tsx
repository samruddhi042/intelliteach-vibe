import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Printer,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

const reports = [
  {
    id: 1,
    title: "Engagement Summary Report",
    description: "Weekly overview of student engagement metrics across all classes",
    type: "engagement",
    lastGenerated: "Jan 6, 2026",
    icon: BarChart3,
  },
  {
    id: 2,
    title: "Mastery Progress Report",
    description: "Student mastery levels by concept with improvement tracking",
    type: "mastery",
    lastGenerated: "Jan 5, 2026",
    icon: TrendingUp,
  },
  {
    id: 3,
    title: "Intervention Effectiveness",
    description: "Analysis of AI-suggested interventions and their impact",
    type: "intervention",
    lastGenerated: "Jan 4, 2026",
    icon: Users,
  },
  {
    id: 4,
    title: "Class Performance Overview",
    description: "Comprehensive performance metrics for each class section",
    type: "performance",
    lastGenerated: "Jan 3, 2026",
    icon: FileText,
  },
];

const institutionMetrics = [
  { label: "Total Students", value: "1,247" },
  { label: "Active Teachers", value: "48" },
  { label: "Classes This Week", value: "156" },
  { label: "Avg. Engagement", value: "74%" },
];

export default function Reports() {
  const handleDownload = (title: string) => {
    toast.success(`Downloading ${title}`, {
      description: "Your report will be ready in a moment.",
    });
  };

  const handleEmail = (title: string) => {
    toast.success(`Report scheduled for email`, {
      description: `${title} will be sent to your email.`,
    });
  };

  return (
    <AppLayout title="Reports" subtitle="Generate and export insights">
      <div className="space-y-6">
        {/* Institution Overview */}
        <Card variant="elevated" className="gradient-hero text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-xl text-primary-foreground">Institution Overview</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Quick metrics for your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {institutionMetrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p className="text-sm text-primary-foreground/70">{metric.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <report.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Last generated: {report.lastGenerated}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDownload(report.title)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleEmail(report.title)}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Report Builder */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Custom Report Builder</CardTitle>
                <CardDescription>Create tailored reports with specific metrics</CardDescription>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-2">
                Build Custom Reports
              </h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Select specific metrics, date ranges, and classes to create
                personalized reports tailored to your needs.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                <Printer className="h-4 w-4 mr-2" />
                Build Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
