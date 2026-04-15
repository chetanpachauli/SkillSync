"use client";

import {
  BrainCircuit,
  FileText,
  SearchCheck,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const About = () => {
  return (
    <section
      id="about"
      className="w-full min-h-screen py-16 px-6 md:px-20 text-center space-y-16"
    >
      {/* Header */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h4 className="uppercase text-sm tracking-widest text-zinc-500 dark:text-zinc-400">
          About SkillSync
        </h4>
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-snug">
          Empowering Careers with AI-Driven Precision
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 text-base md:text-lg">
          SkillSync is an intelligent platform that helps you prepare for
          interviews, optimize your resume, and analyze job trends—all powered
          by AI. {"It's"} your personal tech career accelerator.
        </p>
      </div>

      {/* Core Features */}
      <div className="bg-green-700 dark:bg-green-800 text-white rounded-xl py-8 px-4 md:px-12 max-w-5xl mx-auto shadow-md">
        <div className="flex flex-col gap-y-8 gap-x-6 text-center">
          <div className="flex items-center justify-between ">
            <div className="flex flex-col items-center gap-2">
              <BrainCircuit size={32} />
              <p className="text-sm font-medium">AI-Powered</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SearchCheck size={32} />
              <p className="text-sm font-medium">Mock Interviews</p>
            </div>
          </div>
          <div className="flex items-center justify-evenly space-x-5 md:space-x-10">
            <div className="flex flex-col items-center gap-2">
              <FileText size={32} />
              <p className="text-sm font-medium">Resume maker</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles size={32} />
              <p className="text-sm font-medium">Personalized Feedback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl py-12 px-6 md:px-16 max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left text-zinc-700 dark:text-zinc-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
              <Eye size={20} />
              <span>Vision</span>
            </div>
            <p className="text-sm md:text-base">
              To redefine interview preparation by blending technology and
              psychology—ensuring every candidate walks in with confidence.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
              <Target size={20} />
              <span>Mission</span>
            </div>
            <p className="text-sm md:text-base">
              To build AI-powered tools that guide tech aspirants through resume
              enhancement, real-time interview simulations, and intelligent job
              readiness.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-6">
        <Link href="/Intro">
          <Button className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm">
            Explore SkillSync
          </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
