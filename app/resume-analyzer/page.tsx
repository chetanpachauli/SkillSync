"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Briefcase, 
  Code, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  ArrowLeft,
  GraduationCap,
  ListTodo,
  TrendingUp,
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Type definitions for the Gemini AI Resume analysis result
interface AnalysisData {
  atsScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  improvements: string[];
  recommendedRoles: string[];
  keywordsToAdd: string[];
  experienceEvaluation: string;
  educationEvaluation: string;
  projectEvaluation: string;
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  // Handle analysis trigger
  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 150);

    try {
      // Wait for progress to hit 100
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploading(false);
      setAnalyzing(true);

      // AI Analysis stages
      const stages = [
        "Reading PDF text structure...",
        "Cleaning extracted text...",
        "Matching skills with industry benchmarks...",
        "Generating ATS Score and recommendations...",
        "Structuring final response...",
      ];

      let currentStageIndex = 0;
      setAnalysisStage(stages[0]);

      const stageInterval = setInterval(() => {
        currentStageIndex++;
        if (currentStageIndex < stages.length) {
          setAnalysisStage(stages[currentStageIndex]);
        } else {
          clearInterval(stageInterval);
        }
      }, 2000);

      // Call Next.js API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      clearInterval(stageInterval);

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to analyze resume.");
      }

      setResult(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
      setAnalysisStage("");
    }
  };

  // Reset page
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  // Circular Score Indicator Component
  const CircularProgress = ({ score }: { score: number }) => {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let strokeColor = "stroke-rose-500 dark:stroke-rose-400";
    let textColor = "text-rose-600 dark:text-rose-400 font-extrabold";
    let statusText = "Action Needed";
    let statusBg = "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400";

    if (score >= 80) {
      strokeColor = "stroke-emerald-500 dark:stroke-emerald-400";
      textColor = "text-emerald-600 dark:text-emerald-400 font-extrabold";
      statusText = "Excellent";
      statusBg = "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
    } else if (score >= 60) {
      strokeColor = "stroke-amber-500 dark:stroke-amber-400";
      textColor = "text-amber-600 dark:text-amber-400 font-extrabold";
      statusText = "Good (Can Improve)";
      statusBg = "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400";
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              className="stroke-zinc-100 dark:stroke-zinc-800"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <motion.circle
              className={strokeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-4xl ${textColor}`}>{score}</span>
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">ATS Score</span>
          </div>
        </div>
        <span className={`mt-4 px-3 py-1 text-xs font-semibold rounded-full ${statusBg}`}>
          {statusText}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Optimization
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            Resume <span className="text-green-700 dark:text-green-400">ATS Analyzer</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            Upload your resume to receive an instantaneous review, check your ATS compatibility score, discover missing skills, and get critical recommendations.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 flex items-start gap-3 max-w-3xl mx-auto"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">
              <p className="font-bold">Analysis Error</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300">
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Form & Upload View */}
        {!result && !analyzing && !uploading && (
          <div className="w-full max-w-xl mx-auto px-4 space-y-6">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 md:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 shadow-sm bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 ${
                isDragActive 
                  ? "border-green-600 bg-green-500/5 scale-[0.99]" 
                  : "border-zinc-300 dark:border-zinc-800 hover:border-green-500/60"
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-4 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                </p>
                <p className="text-sm text-zinc-500">
                  or <span className="text-green-700 dark:text-green-400 font-semibold hover:underline">browse files</span> from your computer
                </p>
              </div>
              <p className="text-xs text-zinc-400">
                Only PDF documents are supported (Max size: 5MB)
              </p>
            </div>

            {/* Selected File Card */}
            {file && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end w-full sm:w-auto gap-3">
                  <button 
                    onClick={() => setFile(null)} 
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAnalyze} 
                    className="bg-green-700 hover:bg-green-600 active:scale-95 text-white text-xs md:text-sm font-bold px-5 py-2 rounded-xl transition duration-150 flex items-center gap-2 shadow-sm shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Resume
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Loading Progress State */}
        {(uploading || analyzing) && (
          <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-green-700 dark:text-green-400 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {uploading ? "Uploading Resume..." : "Analyzing with AI..."}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
                  {uploading ? `Progress: ${uploadProgress}%` : analysisStage}
                </p>
              </div>
            </div>

            {/* Simulated progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-green-700 dark:bg-green-500 h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: uploading ? `${uploadProgress}%` : "95%" }}
                transition={{ duration: uploading ? 0.2 : 10 }}
              />
            </div>
            <p className="text-xs text-zinc-400">
              This process may take up to 20 seconds. Please do not close or refresh this tab.
            </p>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Analyzed Resume:</span>
                <span className="text-sm font-extrabold text-zinc-700 dark:text-zinc-200">{file?.name}</span>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-green-700/10 hover:bg-green-700/20 text-green-700 dark:text-green-400 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Analyze Another Resume
              </button>
            </div>

            {/* Score & Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ATS Gauge Card */}
              <div className="lg:col-span-1 flex flex-col justify-between">
                <CircularProgress score={result.atsScore} />
              </div>

              {/* Profile Summary Card */}
              <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-green-700 dark:text-green-400" />
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">AI Profile Assessment</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {result.summary}
                  </p>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-6">
                  <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Recommended Career Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedRoles.map((role, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Strengths and Weaknesses Comparer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Key Resume Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements Card */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Areas to Improve</h3>
                </div>
                <ul className="space-y-3">
                  {result.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills & Keywords Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Missing Skills */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Missing Core Skills</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  These missing skills were identified based on the roles you qualify for. Consider adding experience or projects involving them:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length > 0 ? (
                    result.missingSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                        + {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">No major missing skills identified! Great job!</span>
                  )}
                </div>
              </div>

              {/* Keywords to Add */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Industry Keywords to Add</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Integrate these industry-specific terms naturally into your work experience statements to trigger ATS search queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.keywordsToAdd.length > 0 ? (
                    result.keywordsToAdd.map((keyword, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-semibold">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Keywords coverage is already excellent!</span>
                  )}
                </div>
              </div>

            </div>

            {/* Deep Dive Resume Section Evaluations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 px-1">Deep Dive Sections Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Experience Eval */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-green-700 dark:text-green-400" />
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Experience Evaluation</h4>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {result.experienceEvaluation}
                    </p>
                  </div>
                </div>

                {/* Projects Eval */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="w-5 h-5 text-green-700 dark:text-green-400" />
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Projects Evaluation</h4>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {result.projectEvaluation}
                    </p>
                  </div>
                </div>

                {/* Education Eval */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-green-700 dark:text-green-400" />
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Education Evaluation</h4>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {result.educationEvaluation}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
