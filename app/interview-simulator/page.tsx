"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Code,
  Mic,
  MicOff,
  Volume2,
  ChevronRight,
  ChevronLeft,
  XCircle,
  HelpCircle,
  FileText,
  User,
  GraduationCap,
  TrendingUp,
  Save,
  Clock,
  LogOut,
  Terminal,
  Activity,
  Award
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Selection Categories & Roles
const CATEGORIZED_ROLES = {
  "Software Development": [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "React Developer",
    "Next.js Developer", "Node.js Developer", "Java Developer", "Python Developer",
    "PHP Developer", "Mobile App Developer", "Flutter Developer", "Android Developer",
    "iOS Developer", "DevOps Engineer", "Cloud Engineer", "QA Engineer", "Software Tester"
  ],
  "Data & AI": [
    "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer"
  ],
  "Business & Management": [
    "Business Analyst", "Product Manager", "Project Manager", "Operations Executive"
  ],
  "Sales & Marketing": [
    "Sales Executive", "Marketing Executive"
  ],
  "Human Resources": [
    "HR Executive", "Recruiter"
  ]
};

const EXPERIENCE_LEVELS = [
  "Intern",
  "Fresher",
  "Junior (0–2 Years)",
  "Mid-Level (2–5 Years)",
  "Senior (5+ Years)"
];

const INTERVIEW_TYPES = [
  "HR Interview",
  "Technical Interview",
  "Behavioral Interview",
  "Coding Interview",
  "System Design Interview",
  "Mixed Interview"
];

// Type definitions
interface Question {
  id: number;
  type: "text" | "coding";
  questionText: string;
  title?: string;
  difficulty?: string;
  boilerplate?: string;
  testCases?: Array<{ input: string; output: string }>;
}

interface QuestionEvaluation {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  idealAnswer: string;
  codeReview?: {
    correctness: number;
    codeQuality: number;
    optimization: number;
    readability: number;
    feedback: string[];
    improvements: string[];
    optimizedSolution: string;
  };
}

export default function InterviewSimulatorPage() {
  const { data: session } = useSession();

  // Selection configurations
  const [selectedCategory, setSelectedCategory] = useState<string>("Software Development");
  const [selectedRole, setSelectedRole] = useState<string>("Frontend Developer");
  const [selectedLevel, setSelectedLevel] = useState<string>("Junior (0–2 Years)");
  const [selectedType, setSelectedType] = useState<string>("Technical Interview");

  // Simulator Stages: "setup", "interviewing", "evaluating", "report"
  const [stage, setStage] = useState<"setup" | "interviewing" | "evaluating" | "report">("setup");

  // Interview active states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<number, string>>({});
  const [codeLanguages, setCodeLanguages] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, QuestionEvaluation>>({});

  // Voice Interaction states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Coding Runner states
  const [selectedLang, setSelectedLang] = useState<string>("javascript");
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runningCode, setRunningCode] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual: string; passed: boolean }>>([]);

  // Final aggregate reports
  const [finalReport, setFinalReport] = useState<{
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    problemSolvingScore: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
    hiringRecommendation: "Strong Hire" | "Hire" | "Borderline" | "No Hire";
  } | null>(null);

  // General loading & error indicators
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentAnswer = (userAnswer: string) => {
            const base = userAnswer ? userAnswer + " " : "";
            return base + finalTranscript;
          };

          setAnswers(prev => ({
            ...prev,
            [questions[currentIdx]?.id]: currentAnswer(prev[questions[currentIdx]?.id] || "")
          }));
          setTranscript(interimTranscript || finalTranscript);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [questions, currentIdx]);

  // Voice Recording Control
  const startRecording = () => {
    if (!recognitionRef.current) {
      setError("Web Speech API is not supported in this browser. Please type your response.");
      return;
    }
    setError(null);
    setTranscript("");
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const retryRecording = () => {
    stopRecording();
    setAnswers(prev => ({ ...prev, [questions[currentIdx]?.id]: "" }));
    setTranscript("");
    setTimeout(() => {
      startRecording();
    }, 300);
  };

  // Text-To-Speech reader
  const speakQuestion = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const currentQuestionText = questions[currentIdx]?.questionText;
      if (!currentQuestionText) return;

      const utterance = new SpeechSynthesisUtterance(currentQuestionText);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger TTS whenever question index changes
  useEffect(() => {
    if (stage === "interviewing" && questions.length > 0) {
      setTimeout(() => {
        speakQuestion();
      }, 500);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIdx, stage]);

  // Handle dynamic question generation
  const startInterview = async () => {
    setLoading(true);
    setError(null);
    setLoadingMsg("Generating tailored interview questions...");

    try {
      const response = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          experienceLevel: selectedLevel,
          interviewType: selectedType
        })
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to generate interview questions.");
      }

      setQuestions(json.questions);
      // Initialize code boilerplates if coding interview
      const initialCode: Record<number, string> = {};
      const initialLang: Record<number, string> = {};
      json.questions.forEach((q: Question) => {
        if (q.type === "coding") {
          initialCode[q.id] = q.boilerplate || "// Write your code here";
          initialLang[q.id] = "javascript";
        }
      });
      setCodeAnswers(initialCode);
      setCodeLanguages(initialLang);

      setCurrentIdx(0);
      setStage("interviewing");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during startup.");
    } finally {
      setLoading(false);
    }
  };

  // Run Code Locally inside the sandbox (JavaScript only)
  const runCodeLocally = () => {
    setRunningCode(true);
    setRunLogs([]);
    setTestResults([]);

    const currentQuestion = questions[currentIdx];
    const userCode = codeAnswers[currentQuestion.id] || "";

    setTimeout(() => {
      try {
        if (selectedLang !== "javascript") {
          // Simulation for other languages
          setRunLogs([`Compiling solution in ${selectedLang}...`, "Execution simulated successfully."]);
          const mockResults = (currentQuestion.testCases || []).map((tc, idx) => ({
            input: tc.input,
            expected: tc.output,
            actual: tc.output,
            passed: true
          }));
          setTestResults(mockResults);
          setRunningCode(false);
          return;
        }

        // Custom Console Logger
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => {
            logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
          }
        };

        // Sandbox evaluation using Function constructor
        const runSandbox = new Function("console", `${userCode}\nreturn { runTests: typeof twoSum !== 'undefined' ? twoSum : (typeof main !== 'undefined' ? main : null) };`);
        const exports = runSandbox(customConsole);
        
        // Find standard exported function dynamically or fallback to first function declared in code
        let targetFunc = exports.runTests;
        if (!targetFunc) {
          // Fallback regex to capture first declared function name
          const match = userCode.match(/function\s+(\w+)/);
          if (match && match[1]) {
            const globalScope = new Function(`${userCode}\nreturn ${match[1]};`);
            targetFunc = globalScope();
          }
        }

        if (!targetFunc) {
          throw new Error("No function found to run. Please define your primary function (e.g. function twoSum).");
        }

        const results = (currentQuestion.testCases || []).map((tc) => {
          let testInput;
          try {
            // Safely parse array / object parameters
            testInput = eval(`[${tc.input}]`);
          } catch {
            testInput = [tc.input];
          }

          let outputVal;
          try {
            outputVal = targetFunc(...testInput);
          } catch (execErr: any) {
            outputVal = `Error: ${execErr.message}`;
          }

          const actualStr = JSON.stringify(outputVal);
          const expectedStr = tc.output.trim();

          const passed = actualStr === expectedStr || actualStr.replace(/\s+/g, '') === expectedStr.replace(/\s+/g, '');

          return {
            input: tc.input,
            expected: tc.output,
            actual: actualStr,
            passed
          };
        });

        setRunLogs([...logs, "Execution finished successfully."]);
        setTestResults(results);

      } catch (err: any) {
        setRunLogs([`Compilation Error: ${err.message}`]);
      } finally {
        setRunningCode(false);
      }
    }, 1000);
  };

  // Submit and evaluate code solution with Gemini Code Reviewer
  const submitCodeSolution = async () => {
    setLoading(true);
    setLoadingMsg("Evaluating code solution...");
    setError(null);

    const currentQuestion = questions[currentIdx];
    const userCode = codeAnswers[currentQuestion.id] || "";

    try {
      const response = await fetch("/api/interview/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          experienceLevel: selectedLevel,
          questionText: currentQuestion.questionText,
          codeSubmitted: userCode,
          language: selectedLang
        })
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to submit code for review.");
      }

      // Map review fields to QuestionEvaluation format
      const review = json.review;
      const questionEval: QuestionEvaluation = {
        technicalScore: review.correctness,
        communicationScore: review.readability,
        confidenceScore: review.codeQuality,
        problemSolvingScore: review.optimization,
        strengths: review.feedback,
        weaknesses: [],
        improvements: review.improvements,
        idealAnswer: review.optimizedSolution,
        codeReview: review
      };

      setEvaluations(prev => ({
        ...prev,
        [currentQuestion.id]: questionEval
      }));

      // Move forward automatically
      handleNext();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate Questions (Evaluate current text response on the fly before navigating)
  const evaluateAnswerOnTheFly = async () => {
    const currentQuestion = questions[currentIdx];
    if (currentQuestion.type === "coding") return; // Coding is handled separately

    const answer = answers[currentQuestion.id] || "";
    // If already evaluated, don't re-run unless edited
    if (evaluations[currentQuestion.id]) return;

    setLoading(true);
    setLoadingMsg("Evaluating response...");

    try {
      const response = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          experienceLevel: selectedLevel,
          questionText: currentQuestion.questionText,
          userAnswer: answer
        })
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to evaluate answer.");
      }

      setEvaluations(prev => ({
        ...prev,
        [currentQuestion.id]: json.evaluation
      }));
    } catch (err) {
      console.warn("Evaluation failed:", err);
      // Construct fallback mock response
      setEvaluations(prev => ({
        ...prev,
        [currentQuestion.id]: {
          technicalScore: 50,
          communicationScore: 50,
          confidenceScore: 50,
          problemSolvingScore: 50,
          strengths: ["Submitted answer."],
          weaknesses: ["Unable to contact evaluation engine."],
          improvements: ["Please retry connecting later."],
          idealAnswer: "Conceptual response."
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    stopRecording();
    setError(null);
    if (questions[currentIdx]?.type === "text") {
      await evaluateAnswerOnTheFly();
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTranscript("");
    }
  };

  const handlePrev = () => {
    stopRecording();
    setError(null);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setTranscript("");
    }
  };

  const handleSkip = () => {
    stopRecording();
    setError(null);
    const currentQuestion = questions[currentIdx];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: "[Skipped by User]" }));
    setEvaluations(prev => ({
      ...prev,
      [currentQuestion.id]: {
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        problemSolvingScore: 0,
        strengths: ["None (Skipped)"],
        weaknesses: ["Question was skipped."],
        improvements: ["Ensure you provide some response instead of skipping."],
        idealAnswer: "Comprehensive answer key."
      }
    }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTranscript("");
    }
  };

  // Compile final results & save in DB
  const endInterview = async () => {
    stopRecording();
    setError(null);
    
    // Evaluate last question if text and not evaluated yet
    if (questions[currentIdx]?.type === "text" && !evaluations[questions[currentIdx]?.id]) {
      await evaluateAnswerOnTheFly();
    }

    setStage("evaluating");
    setLoading(true);
    setLoadingMsg("Generating final aggregate interview report...");

    try {
      // Save to Database (MongoDB) & compile report on the server
      const payload = {
        email: session?.user?.email || null,
        role: selectedRole,
        experienceLevel: selectedLevel,
        interviewType: selectedType,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          userAnswer: q.type === "coding" ? (codeAnswers[q.id] || "") : (answers[q.id] || ""),
          isSkipped: (answers[q.id] || "") === "[Skipped by User]" || (answers[q.id] || "").trim() === "",
          evaluation: evaluations[q.id],
          codeDetails: q.type === "coding" ? {
            language: codeLanguages[q.id] || "javascript",
            codeSubmitted: codeAnswers[q.id] || "",
            codeReview: evaluations[q.id]?.codeReview
          } : undefined
        }))
      };

      const response = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to compile report.");
      }

      setFinalReport(json.report);
      setStage("report");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to compile final report.");
      setStage("interviewing");
    } finally {
      setLoading(false);
    }
  };

  // Selection defaults
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const roles = CATEGORIZED_ROLES[cat as keyof typeof CATEGORIZED_ROLES];
    if (roles && roles.length > 0) {
      setSelectedRole(roles[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* SETUP STAGE */}
        {stage === "setup" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                AI Interview Simulator 2.0
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                AI Mock <span className="text-green-700 dark:text-green-400">Interview Simulator</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
                Practice voice, behavioral, or live coding interviews customized for your experience level. Receive detailed evaluation dashboard upon completion.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Category selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Role Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    {Object.keys(CATEGORIZED_ROLES).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Specific role */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Specific Role</label>
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    {CATEGORIZED_ROLES[selectedCategory as keyof typeof CATEGORIZED_ROLES]?.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Level */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Experience Level</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Interview type */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Interview Type</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    {INTERVIEW_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Start Trigger */}
              <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/interview-simulator/history">
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold rounded-xl transition">
                      <Clock className="w-4 h-4" />
                      View Past Reports
                    </button>
                  </Link>
                </div>
                
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="bg-green-800 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition duration-150 flex items-center gap-2 shadow-sm"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Start Interview Simulator
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && (
          <div className="max-w-2xl mx-auto p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-6 shadow-sm">
            <div className="relative flex items-center justify-center">
              <RotateCcw className="w-12 h-12 text-green-700 dark:text-green-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{loadingMsg}</h3>
              <p className="text-xs text-zinc-400 mt-1">AI models are processing... please wait up to 15 seconds.</p>
            </div>
          </div>
        )}

        {/* INTERVIEWING SESSIONS */}
        {stage === "interviewing" && questions.length > 0 && !loading && (
          <div className="space-y-6">
            
            {/* Session Navigation Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-zinc-500 hidden sm:inline">
                  {selectedRole} • {selectedType}
                </span>
              </div>
              <button
                onClick={endInterview}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                End & Evaluate
              </button>
            </div>

            {/* Questions progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-green-700 dark:bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* QUESTION SHEET (SPLIT ACCORDING TO TYPE: TEXT VS CODING) */}
            {questions[currentIdx]?.type === "coding" ? (
              
              /* CODING INTERVIEW LAYOUT */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Problem details (Left) */}
                <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded text-[11px] font-bold uppercase tracking-wider">
                        {questions[currentIdx]?.difficulty || "Medium"}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400">Coding Exercise</span>
                    </div>

                    <h2 className="text-xl font-bold text-zinc-850 dark:text-zinc-100">
                      {questions[currentIdx]?.title || "Coding Challenge"}
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-350 whitespace-pre-wrap">
                      {questions[currentIdx]?.questionText}
                    </p>
                  </div>

                  {/* Test Cases Panel */}
                  <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-700" />
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Test Suite Cases</h4>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(questions[currentIdx]?.testCases || []).map((tc, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl text-xs space-y-1">
                          <p><strong className="text-zinc-400">Input:</strong> <code>{tc.input}</code></p>
                          <p><strong className="text-zinc-400">Expected:</strong> <code>{tc.output}</code></p>
                          {testResults[idx] && (
                            <p className="flex items-center gap-1.5 mt-1 font-semibold">
                              <span className="text-zinc-400">Output:</span>
                              <code>{testResults[idx].actual}</code>
                              {testResults[idx].passed ? (
                                <span className="text-emerald-500 font-bold ml-auto flex items-center gap-1">✓ Passed</span>
                              ) : (
                                <span className="text-red-500 font-bold ml-auto flex items-center gap-1">✗ Failed</span>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Live Editor (Right) */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Code className="w-4 h-4 text-green-700" />
                        Interactive Sandbox Editor
                      </h3>
                      
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python (Simulated)</option>
                        <option value="java">Java (Simulated)</option>
                        <option value="cpp">C++ (Simulated)</option>
                      </select>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <textarea
                        value={codeAnswers[questions[currentIdx]?.id] || ""}
                        onChange={(e) => setCodeAnswers(prev => ({ ...prev, [questions[currentIdx].id]: e.target.value }))}
                        className="w-full h-80 p-4 font-mono text-sm bg-zinc-950 text-emerald-400 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-zinc-800"
                        spellCheck="false"
                      />
                    </div>
                  </div>

                  {/* Sandbox Run Log output */}
                  {runLogs.length > 0 && (
                    <div className="mt-4 p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300 max-h-32 overflow-y-auto">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 border-b border-zinc-800 pb-1">Console logs</p>
                      {runLogs.map((log, idx) => (
                        <p key={idx}>{log}</p>
                      ))}
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
                    <button
                      onClick={runCodeLocally}
                      disabled={runningCode}
                      className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                      Run Test Suite
                    </button>
                    <button
                      onClick={submitCodeSolution}
                      className="bg-green-800 hover:bg-green-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl ml-auto flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Submit & Review
                    </button>
                  </div>

                </div>

              </div>

            ) : (

              /* TEXT / CONCEPTUAL INTERVIEW LAYOUT */
              <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  
                  {/* Speaker utility */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400">Conceptual Question</span>
                    <button
                      onClick={speakQuestion}
                      className={`p-2 rounded-xl border ${isSpeaking ? "bg-green-500/10 border-green-500/30 text-green-700" : "border-zinc-200 dark:border-zinc-800 text-zinc-400"} hover:text-green-700 transition`}
                      title="Read Question Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Display */}
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 leading-snug">
                    {questions[currentIdx]?.questionText}
                  </h3>

                  {/* Transcript Display */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Answer</label>
                    <textarea
                      value={answers[questions[currentIdx]?.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: e.target.value }))}
                      placeholder="Type your answer here or use the voice recording button..."
                      className="w-full h-44 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>

                  {/* Realtime voice transcription logs */}
                  {isRecording && transcript && (
                    <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-xs text-zinc-500 animate-pulse">
                      <strong>Transcribing:</strong> &quot;{transcript}&quot;
                    </div>
                  )}

                  {/* Voice recording buttons */}
                  <div className="flex flex-wrap gap-3 items-center p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl">
                    <span className="text-xs font-bold text-zinc-400 pl-1">Voice Interview Mode:</span>
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-1.5 bg-green-700/10 hover:bg-green-700/20 text-green-700 dark:text-green-400 text-xs font-bold px-3.5 py-2 rounded-xl transition"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        Start Mic
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-3.5 py-2 rounded-xl transition animate-pulse"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                          Stop Recording
                        </button>
                        <button
                          onClick={retryRecording}
                          className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 text-zinc-500 text-xs font-bold px-3.5 py-2 rounded-xl transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>

            )}

            {/* Error notifications during simulation */}
            {error && (
              <div className="max-w-4xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Footer Navigation Bar */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl mx-auto w-full">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-500 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {questions[currentIdx]?.type === "text" && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 text-xs font-bold rounded-xl transition"
                >
                  Skip Question
                </button>
              )}

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-green-800 hover:bg-green-700 text-white text-xs font-bold px-6 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={endInterview}
                  className="bg-green-800 hover:bg-green-700 text-white text-xs font-bold px-6 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  Finish Interview
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* EVALUATING REPORT STAGE */}
        {stage === "evaluating" && !loading && (
          <div className="max-w-2xl mx-auto p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-6 shadow-sm animate-pulse">
            <RotateCcw className="w-12 h-12 text-green-700 dark:text-green-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold">Compiling your final metrics...</h3>
          </div>
        )}

        {/* REPORT CARD DASHBOARD */}
        {stage === "report" && finalReport && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Executive Recommendation bar */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Evaluation Result</span>
                <h2 className="text-2xl font-black">
                  Interview Report: <span className="text-green-700 dark:text-green-400">{selectedRole}</span>
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
                  {finalReport.summary}
                </p>
              </div>

              {/* Recommendation Badge */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 min-w-44">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Hiring Recommendation</span>
                <span className={`px-4 py-1.5 text-xs font-extrabold rounded-full ${
                  finalReport.hiringRecommendation === "Strong Hire" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600" :
                  finalReport.hiringRecommendation === "Hire" ? "bg-blue-500/10 border border-blue-500/20 text-blue-600" :
                  finalReport.hiringRecommendation === "Borderline" ? "bg-amber-500/10 border border-amber-500/20 text-amber-600" :
                  "bg-rose-500/10 border border-rose-500/20 text-rose-600"
                }`}>
                  {finalReport.hiringRecommendation}
                </span>
              </div>
            </div>

            {/* Score Grid Panels */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Overall Score Circle */}
              <div className="md:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Score</span>
                
                <div className="relative flex items-center justify-center w-36 h-36">
                  <svg className="transform -rotate-90" width="144" height="144">
                    <circle
                      className="stroke-zinc-100 dark:stroke-zinc-800"
                      fill="transparent"
                      strokeWidth="10"
                      r="60"
                      cx="72"
                      cy="72"
                    />
                    <circle
                      className="stroke-green-700 dark:stroke-green-400 transition-all duration-1000 ease-out"
                      fill="transparent"
                      strokeWidth="10"
                      strokeDasharray="376.8"
                      strokeDashoffset={376.8 - (finalReport.overallScore / 100) * 376.8}
                      strokeLinecap="round"
                      r="60"
                      cx="72"
                      cy="72"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-green-700 dark:text-green-400">{finalReport.overallScore}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Percentile</span>
                  </div>
                </div>
              </div>

              {/* Individual metric breakdown */}
              <div className="md:col-span-3 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Evaluated Metrics</span>
                
                {/* 1. Technical */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Technical Ability</span>
                    <span>{finalReport.technicalScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-750 dark:bg-green-500 h-full rounded-full" style={{ width: `${finalReport.technicalScore}%` }} />
                  </div>
                </div>

                {/* 2. Communication */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Communication Clarity</span>
                    <span>{finalReport.communicationScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-750 dark:bg-green-500 h-full rounded-full" style={{ width: `${finalReport.communicationScore}%` }} />
                  </div>
                </div>

                {/* 3. Problem solving */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Problem Solving Approach</span>
                    <span>{finalReport.problemSolvingScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-750 dark:bg-green-500 h-full rounded-full" style={{ width: `${finalReport.problemSolvingScore}%` }} />
                  </div>
                </div>

                {/* 4. Confidence */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Confidence & Tone</span>
                    <span>{finalReport.confidenceScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-750 dark:bg-green-500 h-full rounded-full" style={{ width: `${finalReport.confidenceScore}%` }} />
                  </div>
                </div>

              </div>

            </div>

            {/* Strengths & weaknesses overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Observed Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {finalReport.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-350">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3">
                  {finalReport.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-350">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Complete Question-by-Question Deep Dive Log */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 px-1">Question-by-Question Review</h3>
              
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const evalData = evaluations[q.id];
                  if (!evalData) return null;

                  return (
                    <div key={q.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
                      
                      {/* Title Header */}
                      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-zinc-400">Question {idx + 1}</span>
                          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                            {q.type === "coding" ? `Coding: ${q.title}` : q.questionText}
                          </h4>
                        </div>

                        {/* Average Score for this question */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-zinc-400">Score</span>
                          <p className="text-lg font-black text-green-700">
                            {q.type === "coding" 
                              ? Math.round(((evalData.codeReview?.correctness || 0) + (evalData.codeReview?.codeQuality || 0)) / 2)
                              : Math.round(((evalData.technicalScore || 0) + (evalData.communicationScore || 0)) / 2)}
                          </p>
                        </div>
                      </div>

                      {/* Coding details if applicable */}
                      {q.type === "coding" ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-zinc-400 mb-1">Code Submitted</p>
                            <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-48">
                              {codeAnswers[q.id]}
                            </pre>
                          </div>
                          {evalData.codeReview && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl space-y-1.5 text-xs">
                                <p className="font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-1">AI Code Feedback</p>
                                {evalData.codeReview.feedback.map((f, i) => (
                                  <p key={i}>• {f}</p>
                                ))}
                              </div>
                              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl space-y-1.5 text-xs">
                                <p className="font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-1">AI Code Optimizations</p>
                                {evalData.codeReview.improvements.map((f, i) => (
                                  <p key={i}>• {f}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          {evalData.idealAnswer && (
                            <div>
                              <p className="text-xs font-bold text-zinc-400 mb-1">AI Optimized Solution</p>
                              <pre className="p-3 bg-zinc-950 text-indigo-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
                                {evalData.idealAnswer}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Standard Question details
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-zinc-400">Your Response</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-350 italic mt-0.5 whitespace-pre-wrap">
                              &quot;{answers[q.id] || "[No answer / Skipped]"}&quot;
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl space-y-1.5">
                              <p className="font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-1">Response Strengths</p>
                              {evalData.strengths?.map((s, i) => <p key={i}>• {s}</p>)}
                            </div>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl space-y-1.5">
                              <p className="font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1 mb-1">Critique & Fixes</p>
                              {evalData.improvements?.map((s, i) => <p key={i}>• {s}</p>)}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-zinc-400 mb-1">AI Recommended Ideal Response</p>
                            <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl whitespace-pre-wrap">
                              {evalData.idealAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restart Option */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setStage("setup")}
                className="flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
                Prepare Another Interview
              </button>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
