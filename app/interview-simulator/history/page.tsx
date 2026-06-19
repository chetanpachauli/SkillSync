"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  User,
  GraduationCap,
  Code
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Type definitions matching MongoDB Schema
interface InterviewRecord {
  _id: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  hiringRecommendation: string;
  createdAt: string;
  questions: Array<{
    questionText: string;
    userAnswer: string;
    isSkipped: boolean;
    evaluation?: {
      technicalScore: number;
      communicationScore: number;
      confidenceScore: number;
      problemSolvingScore: number;
      strengths: string[];
      weaknesses: string[];
      improvements: string[];
      idealAnswer: string;
    };
    codeDetails?: {
      language: string;
      codeSubmitted: string;
      codeReview?: {
        correctness: number;
        codeQuality: number;
        optimization: number;
        readability: number;
        feedback: string[];
        improvements: string[];
        optimizedSolution: string;
      };
    };
  }>;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Expandable active report state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (status !== "authenticated" || !session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/interview/history?email=${encodeURIComponent(session.user.email)}`);
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to load history.");
        }
        setHistory(json.history || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header section */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/interview-simulator">
            <button className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500 hover:text-zinc-850">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Interview History</h1>
            <p className="text-xs md:text-sm text-zinc-400">Review your past simulated interview performances, score breakdowns, and career critiques.</p>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="text-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-t-green-700 border-zinc-200 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-zinc-400">Loading interview records...</p>
          </div>
        )}

        {/* NOT AUTHENTICATED STATE */}
        {!loading && status !== "authenticated" && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full w-fit mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Sign In Required</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              You must be logged in to sync and view your mock interview history. Guest reports are temporary and only visible immediately after completion.
            </p>
            <Link href="/Login">
              <button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition mt-2">
                Sign In / Register
              </button>
            </Link>
          </div>
        )}

        {/* EMPTY HISTORY STATE */}
        {!loading && status === "authenticated" && history.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-full w-fit mx-auto">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">No Records Found</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              You haven&apos;t completed any simulated interviews yet. Start one now to view your progress analytics!
            </p>
            <Link href="/interview-simulator">
              <button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition mt-2">
                Start Mock Simulator
              </button>
            </Link>
          </div>
        )}

        {/* HISTORY LIST */}
        {!loading && status === "authenticated" && history.length > 0 && (
          <div className="space-y-4">
            {history.map((record) => {
              const isExpanded = expandedId === record._id;
              const formattedDate = new Date(record.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              });

              return (
                <div 
                  key={record._id} 
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Summary Card Header */}
                  <div 
                    onClick={() => toggleExpand(record._id)}
                    className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850/40 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100">{record.role}</h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate} • {record.experienceLevel} • {record.interviewType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      
                      {/* Overall Score Badge */}
                      <div className="text-center pr-3 border-r border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Score</span>
                        <span className="text-lg font-black text-green-700">{record.overallScore}/100</span>
                      </div>

                      {/* Recommendation Badge */}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        record.hiringRecommendation === "Strong Hire" ? "bg-emerald-500/10 text-emerald-600" :
                        record.hiringRecommendation === "Hire" ? "bg-blue-500/10 text-blue-600" :
                        record.hiringRecommendation === "Borderline" ? "bg-amber-500/10 text-amber-600" :
                        "bg-rose-500/10 text-rose-600"
                      }`}>
                        {record.hiringRecommendation}
                      </span>

                      {/* Expand Chevron */}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}

                    </div>
                  </div>

                  {/* Expanded Report Area */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
                      >
                        <div className="p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/20">
                          
                          {/* Summary Details */}
                          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-sm leading-relaxed">
                            <p className="font-bold text-zinc-500 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-green-700" />
                              AI Executive Summary
                            </p>
                            <p className="text-zinc-600 dark:text-zinc-350">{record.summary}</p>
                          </div>

                          {/* Scores Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-center">
                              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Technical Ability</span>
                              <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{record.technicalScore}/100</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-center">
                              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Communication</span>
                              <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{record.communicationScore}/100</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-center">
                              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Confidence</span>
                              <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{record.confidenceScore}/100</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-center">
                              <span className="text-[10px] font-bold text-zinc-400 block uppercase">Problem Solving</span>
                              <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{record.problemSolvingScore}/100</span>
                            </div>
                          </div>

                          {/* Strengths & Improvements */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
                              <p className="font-bold text-emerald-600 mb-2 flex items-center gap-1 text-xs uppercase tracking-wider">
                                <CheckCircle2 className="w-4 h-4" />
                                Key Strengths
                              </p>
                              <ul className="space-y-1.5 text-xs text-zinc-500">
                                {record.strengths.map((str, idx) => <li key={idx}>• {str}</li>)}
                              </ul>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
                              <p className="font-bold text-amber-600 mb-2 flex items-center gap-1 text-xs uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4" />
                                Areas to Improve
                              </p>
                              <ul className="space-y-1.5 text-xs text-zinc-500">
                                {record.improvements.map((imp, idx) => <li key={idx}>• {imp}</li>)}
                              </ul>
                            </div>
                          </div>

                          {/* Question breakdowns */}
                          <div className="space-y-3 pt-3">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Detailed Question Log</p>
                            
                            {record.questions.map((q, idx) => {
                              const evalData = q.evaluation;
                              if (!evalData) return null;

                              return (
                                <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3">
                                  <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                                    <p className="text-xs font-bold text-zinc-500">Question {idx + 1}: {q.questionText}</p>
                                  </div>

                                  {q.codeDetails ? (
                                    // Coding log
                                    <div className="space-y-2 text-xs">
                                      <p className="font-bold text-zinc-400">Language: <span className="text-zinc-650">{q.codeDetails.language}</span></p>
                                      <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-32">
                                        {q.codeDetails.codeSubmitted}
                                      </pre>
                                      {q.codeDetails.codeReview && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                                          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                                            <p className="font-bold text-zinc-400 mb-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-0.5">Feedback</p>
                                            {q.codeDetails.codeReview.feedback?.map((f, i) => <p key={i}>• {f}</p>)}
                                          </div>
                                          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                                            <p className="font-bold text-zinc-400 mb-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-0.5">Optimizations</p>
                                            {q.codeDetails.codeReview.improvements?.map((f, i) => <p key={i}>• {f}</p>)}
                                          </div>
                                        </div>
                                      )}
                                      {q.codeDetails.codeReview?.optimizedSolution && (
                                        <div>
                                          <p className="font-bold text-zinc-400 mb-1">AI Optimized Solution</p>
                                          <pre className="p-3 bg-zinc-950 text-indigo-400 font-mono text-xs rounded-xl overflow-x-auto max-h-32">
                                            {q.codeDetails.codeReview.optimizedSolution}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Conceptual log
                                    <div className="space-y-2 text-xs">
                                      <p className="font-semibold text-zinc-500">
                                        Answer: <span className="italic text-zinc-600 dark:text-zinc-350">&quot;{q.userAnswer || "[No answer]"}&quot;</span>
                                      </p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                                          <p className="font-bold text-zinc-400 mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-0.5">Strengths</p>
                                          {evalData.strengths?.map((s, i) => <p key={i}>• {s}</p>)}
                                        </div>
                                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                                          <p className="font-bold text-zinc-400 mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-0.5">Critique & Fixes</p>
                                          {evalData.improvements?.map((s, i) => <p key={i}>• {s}</p>)}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
