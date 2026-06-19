"use client";

import { Sparkles, FileText, MessageCircleCode, BarChart3 } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="w-full py-16 px-6 md:px-20 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
          What SkillSync Offers
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
          Empower your job hunt with tools that matter. From personalized mock interviews to resume grading and AI tips — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-md">
          <Sparkles size={32} className="text-green-700 dark:text-green-400" />
          <h4 className="text-lg font-semibold">AI Interview Simulator</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Dynamic voice and coding tracks with real-time AI grading and detailed reports.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-md">
          <FileText size={32} className="text-green-700 dark:text-green-400" />
          <h4 className="text-lg font-semibold">AI Resume Analyzer</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload your PDF resume for an instant ATS score, keyword gaps, and improvement tips.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-md">
          <MessageCircleCode size={32} className="text-green-700 dark:text-green-400" />
          <h4 className="text-lg font-semibold">Tech Q&A Assistant</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Stuck on DSA or System Design? Get instant guidance from AI.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-md">
          <BarChart3 size={32} className="text-green-700 dark:text-green-400" />
          <h4 className="text-lg font-semibold">Job Fit Scoring</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Analyze how well your profile matches with your dream roles.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
