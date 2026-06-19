"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, ChevronRight, ArrowLeft } from "lucide-react";

const Resume = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-12">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            Resume <span className="text-green-700 dark:text-green-400">Workspace</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            Choose whether to build a professionally tailored resume from scratch or run an ATS optimization scan on your current resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
          
          {/* Card 1: Resume Builder */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-green-600/40 transition-all duration-300 flex flex-col justify-between text-left group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  Resume Builder
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Generate a professional resume step-by-step using our interactive builder and download a print-ready PDF.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/Resume_Builder">
                <Button className="w-full bg-green-800 hover:bg-green-700 text-white rounded-xl py-5 font-semibold flex items-center justify-center gap-2">
                  Build Your Resume
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: ATS Resume Analyzer */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-green-600/40 transition-all duration-300 flex flex-col justify-between text-left group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                  ATS Resume Analyzer
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Upload your existing PDF resume to scan for ATS scoring, missing keywords, and detailed improvements.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link href="/resume-analyzer">
                <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl py-5 font-semibold flex items-center justify-center gap-2">
                  Analyze Resume
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Resume;