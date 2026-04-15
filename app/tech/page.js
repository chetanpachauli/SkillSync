"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ModeToggle } from "../components/modeToggle";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

const topics = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "Next.js",
];
const questionTypes = ["MCQ", "True/False"];

const TechQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [topic, setTopic] = useState("HTML");
  const [type, setType] = useState("MCQ");

  const fetchQuestions = async () => {
    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, type }),
    });
    const data = await res.json();
    setQuestions(data.questions || []);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
  };

  const handleAnswer = (choice) => {
    setSelected(choice);
    const correct = questions[currentQ]?.answer;
    if (choice === correct) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((c) => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  return (
    <div className="p-6 w-screen mx-auto space-y-6">
      <div className="flex items-center justify-around">
        <h1 className="text-3xl font-bold text-center">🧠 Tech Quiz</h1>
        <div className="flex space-x-5">
          <Button variant="outline" size="icon">
            <Link href="/">
              <HomeIcon className="h-5 w-5" />
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            {questionTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={fetchQuestions} className="w-full">
        Generate Questions
      </Button>

      {questions.length > 0 && !showResult && (
        <div className="space-y-4">
          <div className="text-lg font-medium">
            Q{currentQ + 1}: {questions[currentQ]?.question}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[currentQ]?.options?.map((opt, idx) => (
              <Button
                key={idx}
                variant={
                  selected === opt
                    ? opt === questions[currentQ]?.answer
                      ? "default"
                      : "destructive"
                    : "outline"
                }
                onClick={() => handleAnswer(opt)}
                disabled={!!selected}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showResult && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">🎉 Quiz Complete!</h2>
          <p className="text-lg">
            You scored {score} out of {questions.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default TechQuestionsPage;
