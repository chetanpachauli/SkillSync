"use client";

import { Sparkles, FileText, ScrollText, Bot, Compass, MessageCircleCode, MoveRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Intro = () => {
  return (
    <section className="w-full min-h-screen py-20 px-6 md:px-24 bg-[#fdfbf6] dark:bg-zinc-900 flex flex-col justify-center items-center text-center space-y-10">
      {/* Welcome Text */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
          Welcome to <span className="text-green-700 dark:text-green-400">SkillSync</span>
        </h1>
        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300">
          Let’s get you one step closer to landing your dream tech job. Our smart tools help you prepare confidently and grow professionally.
        </p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-10 text-left">
        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <Sparkles className="text-green-700 dark:text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Interview Simulator</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Real-time speech transcription, interactive coding challenges, and deep AI evaluation reports.
          </p>
          <Link href="/interview">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>

        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <FileText className="text-green-700 dark:text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Resume Analyzer</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload your PDF resume for an instant AI-driven ATS audit, missing keyword detection, and role suggestions.
          </p>
          <Link href="/resume-analyzer">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>

        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <ScrollText className="text-green-700 dark:text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Resume Builder</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload your resume and let our AI identify strengths, weaknesses, and optimization tips.
          </p>
          <Link href="/Resume_Builder">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>

        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <Bot className="text-green-700 dark:text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Chat Assistant</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Practice with a conversational AI that answers your interview questions and provides instant guidance.
          </p>
          <Link href="/Aiprep">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>

        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <Compass className="text-green-700 dark:text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Career Roadmap</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Follow a structured AI-generated learning path tailored to your target role and skill level.
          </p>
          <Link href="/roadmap">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>

        <div className="flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
          <MessageCircleCode className="text-green-700 dark:text-green-400 " size={28} />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Tech Q&A Assistant</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Ask DSA/System Design questions anytime — get concise answers and code breakdowns.
          </p>
          <Link href="/tech">
          <Button className="w-full">
            <MoveRight width={26}/>
          </Button>
          </Link>
        </div>
      </div>

      {/* Call To Action */}
      <div className="pt-10">
        <Link href="/">
          <Button className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2">
             <ArrowLeft size={16} />Home
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Intro;
