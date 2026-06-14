import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Clock,
  BookOpen,
  Send,
  Play,
  CheckCircle2,
  HelpCircle,
  FileText,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const generatedQuestions = [
  {
    id: 1,
    text: "A 5 kg object is accelerated at 3 m/s². What is the net force acting on the object?",
    type: "MCQ",
    difficulty: "Easy",
    concept: "Newton's Second Law",
    estimatedTime: "2 min",
  },
  {
    id: 2,
    text: "Explain why a heavier truck requires more force to accelerate at the same rate as a lighter car.",
    type: "Short Answer",
    difficulty: "Medium",
    concept: "Mass and Acceleration",
    estimatedTime: "4 min",
  },
  {
    id: 3,
    text: "A rocket expels gas at high velocity. Using Newton's Third Law, explain how this propels the rocket forward.",
    type: "Conceptual",
    difficulty: "Medium",
    concept: "Newton's Third Law",
    estimatedTime: "5 min",
  },
  {
    id: 4,
    text: "A 1000 kg car brakes from 20 m/s to rest in 4 seconds. Calculate the braking force and the work done by friction.",
    type: "Application",
    difficulty: "Hard",
    concept: "Force and Work",
    estimatedTime: "6 min",
  },
  {
    id: 5,
    text: "Two blocks of masses 2 kg and 3 kg are connected by a string over a frictionless pulley. Find the acceleration of the system.",
    type: "Application",
    difficulty: "Hard",
    concept: "Connected Objects",
    estimatedTime: "7 min",
  },
];

const difficultyColors = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

const typeIcons = {
  MCQ: HelpCircle,
  "Short Answer": FileText,
  Conceptual: Lightbulb,
  Application: CheckCircle2,
};

export default function Questions() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Questions generated successfully!");
    }, 2000);
  };

  const handleAssignHomework = (id: number) => {
    toast.success("Question assigned as homework", {
      description: "Students will receive this in their next assignment.",
    });
  };

  const handleUseLive = (id: number) => {
    toast.success("Question added to live class", {
      description: "You can now present this to students.",
    });
  };

  return (
    <AppLayout title="Question Generator" subtitle="AI-powered question generation from class content">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Generate Questions</CardTitle>
            <CardDescription>Create questions from class content and mastery gaps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics-10a">Physics 10A</SelectItem>
                  <SelectItem value="physics-10b">Physics 10B</SelectItem>
                  <SelectItem value="math-9a">Mathematics 9A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newtons-laws">Newton's Laws of Motion</SelectItem>
                  <SelectItem value="work-energy">Work and Energy</SelectItem>
                  <SelectItem value="momentum">Momentum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {["MCQ", "Short Answer", "Conceptual", "Application"].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="gradient"
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Questions</h3>
            <Badge variant="secondary">{generatedQuestions.length} questions</Badge>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((question, index) => {
              const TypeIcon = typeIcons[question.type as keyof typeof typeIcons];
              return (
                <Card
                  key={question.id}
                  variant="elevated"
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-2.5">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm text-foreground leading-relaxed">
                          {question.text}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors]}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {question.concept}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {question.estimatedTime}
                          </Badge>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleAssignHomework(question.id)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            Assign as Homework
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleUseLive(question.id)}
                          >
                            <Play className="h-3.5 w-3.5" />
                            Use in Live Class
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
