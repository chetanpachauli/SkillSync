"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Terminal, Video, Play, ArrowLeft } from "lucide-react";

const Interview = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Live AI Simulation
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            AI Interview <span className="text-green-700 dark:text-green-400">Simulator</span>
          </h1>
          <p className="text-zinc-650 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Practice conceptual tech interviews with interactive real-time voice recognition and live DSA coding environments. Review custom dashboards showing strengths, ideal answers, and hiring recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/interview-simulator">
            <Button className="bg-green-800 hover:bg-green-700 text-white px-8 py-6 rounded-xl font-bold flex items-center gap-2 shadow-sm transition active:scale-95">
              <Play className="w-5 h-5 fill-white" />
              Enter Simulator Workspace
            </Button>
          </Link>
          <Link href="/interview-simulator/history">
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 text-zinc-700 dark:text-zinc-200 px-6 py-6 rounded-xl font-bold">
              View History Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Interview;