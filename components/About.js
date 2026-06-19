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
        <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
          About <span className="text-blue-600">SkillSync</span>
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          Your AI-powered companion for career growth and interview success
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <BrainCircuit size={48} className="text-blue-600" />
          <h3 className="text-xl font-semibold">AI-Powered Learning</h3>
          <p className="text-zinc-600 dark:text-zinc-300">
            Advanced artificial intelligence helps you learn and practice with personalized feedback
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <Target size={48} className="text-green-600" />
          <h3 className="text-xl font-semibold">Goal-Oriented</h3>
          <p className="text-zinc-600 dark:text-zinc-300">
            Focused approach to help you achieve specific career goals and land your dream job
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <Eye size={48} className="text-purple-600" />
          <h3 className="text-xl font-semibold">Expert Insights</h3>
          <p className="text-zinc-600 dark:text-zinc-300">
            Industry-relevant content and interview questions from real tech professionals
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-8 max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
          What Makes Us Different
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="flex items-start space-x-4">
            <Sparkles className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Interview Simulator</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Real-time voice interactions, dynamic coding questions, and automated grading for a full mock interview experience
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <FileText className="text-green-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Resume Analyzer</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Upload your PDF resume and get an instant ATS score, missing keyword detection, and role-specific recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <SearchCheck className="text-purple-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">Skill Assessment</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Identify your strengths and areas for improvement with comprehensive skill analysis
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <BrainCircuit className="text-orange-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">24/7 Availability</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Practice and learn anytime, anywhere with our always-available AI assistant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Ready to Transform Your Career?
        </h3>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
          Join thousands of professionals who have accelerated their careers with SkillSync
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/interview">
            <Button size="lg" className="w-full sm:w-auto">
              Start Practicing
            </Button>
          </Link>
          <Link href="/resume-analyzer">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Analyze Resume
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
