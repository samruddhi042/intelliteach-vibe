import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Search,
  Calendar,
  Clock,
  Users,
  FileText,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const recordings = [
  {
    id: 1,
    subject: "Physics",
    topic: "Newton's Laws of Motion",
    date: "Jan 6, 2026",
    duration: "45:32",
    students: 32,
    engagement: 78,
    hasTranscript: true,
  },
  {
    id: 2,
    subject: "Mathematics",
    topic: "Quadratic Equations",
    date: "Jan 5, 2026",
    duration: "50:18",
    students: 28,
    engagement: 65,
    hasTranscript: true,
  },
  {
    id: 3,
    subject: "Chemistry",
    topic: "Chemical Bonding",
    date: "Jan 4, 2026",
    duration: "40:45",
    students: 30,
    engagement: 82,
    hasTranscript: true,
  },
  {
    id: 4,
    subject: "Physics",
    topic: "Work and Energy",
    date: "Jan 3, 2026",
    duration: "48:22",
    students: 31,
    engagement: 71,
    hasTranscript: false,
  },
];

const transcriptSegments = [
  { time: "00:00", speaker: "Teacher", text: "Good morning everyone. Today we'll be discussing Newton's Laws of Motion.", keywords: ["Newton's Laws", "Motion"] },
  { time: "02:15", speaker: "Teacher", text: "The first law, also known as the law of inertia, states that an object at rest stays at rest.", keywords: ["law of inertia", "rest"] },
  { time: "05:30", speaker: "Student", text: "Professor, does this apply to objects in space as well?" },
  { time: "05:45", speaker: "Teacher", text: "Excellent question! Yes, in fact, space is the perfect example because there's minimal friction.", keywords: ["space", "friction"] },
  { time: "08:20", speaker: "Teacher", text: "Now let's move on to the second law. F equals m times a. Force equals mass times acceleration.", keywords: ["F=ma", "Force", "mass", "acceleration"] },
  { time: "12:45", speaker: "Teacher", text: "Let's work through an example. If a 10kg object experiences a force of 50N...", keywords: ["example", "10kg", "50N"] },
];

export default function Recordings() {
  const [selectedRecording, setSelectedRecording] = useState(recordings[0]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout title="Class Recordings" subtitle="Review and analyze past sessions">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recording List */}
        <Card variant="elevated" className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recordings</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recordings..."
                className="pl-9 bg-muted/50 border-0"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200",
                  selectedRecording.id === recording.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
                onClick={() => setSelectedRecording(recording)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {recording.subject}
                    </Badge>
                    <h4 className="font-medium text-sm">{recording.topic}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {recording.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recording.duration}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      selectedRecording.id === recording.id && "text-primary"
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recording Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Placeholder */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-sidebar to-sidebar/80 flex items-center justify-center relative">
              <Button
                size="lg"
                className="rounded-full h-16 w-16 bg-primary-foreground/20 hover:bg-primary-foreground/30 backdrop-blur-sm"
              >
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </Button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-primary-foreground/80 text-sm">
                <span>00:00</span>
                <div className="flex-1 mx-4 h-1 bg-primary-foreground/20 rounded-full">
                  <div className="w-0 h-full bg-primary-foreground rounded-full" />
                </div>
                <span>{selectedRecording.duration}</span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedRecording.topic}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecording.subject} • {selectedRecording.date}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRecording.students} students
                  </span>
                  <Badge
                    className={cn(
                      selectedRecording.engagement >= 70
                        ? "bg-success"
                        : selectedRecording.engagement >= 40
                        ? "bg-warning text-warning-foreground"
                        : "bg-destructive"
                    )}
                  >
                    {selectedRecording.engagement}% Engagement
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Transcript</CardTitle>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search concept / keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-0 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto space-y-4">
              {transcriptSegments.map((segment, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {segment.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        segment.speaker === "Teacher"
                          ? "text-primary"
                          : "text-secondary"
                      )}
                    >
                      {segment.speaker}
                    </span>
                    <p className="text-sm text-foreground mt-1">
                      {segment.text.split(" ").map((word, i) => {
                        const isKeyword = segment.keywords?.some((kw) =>
                          word.toLowerCase().includes(kw.toLowerCase())
                        );
                        return (
                          <span
                            key={i}
                            className={cn(isKeyword && "font-semibold text-primary")}
                          >
                            {word}{" "}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
