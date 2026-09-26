"use client";

import {
  BrainCircuit,
  FileText,
  SearchCheck,
  Sparkles,
  Target,
  Eye,
  Bot,
  Compass,
  ScrollText,
  Send,
  Code2,
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
          Your AI-powered companion for career growth, job automation, and interview success
        </p>
      </div>

      {/* Features Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <BrainCircuit size={48} className="text-blue-600" />
          <h3 className="text-xl font-semibold">AI-Powered Learning</h3>
          <p className="text-zinc-600 dark:text-zinc-300">
            Advanced artificial intelligence helps you learn and practice with personalized feedback
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800">
          <Send size={48} className="text-emerald-500" />
          <h3 className="text-xl font-semibold">Smart Job Automation</h3>
          <p className="text-zinc-600 dark:text-zinc-300">
            Automate job searching and applying on LinkedIn & Indeed with AI-assisted answers
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

      {/* Key Features (8 Cards Symmetrical Grid) */}
      <div className="space-y-8 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
          What Makes Us Different
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="flex items-start space-x-4">
            <Send className="text-emerald-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Job Auto-Applier</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Automates your job search on LinkedIn & Indeed with Playwright & Gemini AI screening question resolution
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Sparkles className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Interview Simulator</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Real-time voice interactions, dynamic coding questions, and automated grading for full mock interviews
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <FileText className="text-green-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Resume Analyzer</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Upload your PDF resume and get instant ATS score, missing keyword detection, and recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <ScrollText className="text-orange-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">Resume Builder</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Step-by-step builder with live preview and PDF download for a polished professional resume
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Bot className="text-purple-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">AI Chat Assistant</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Conversational AI that answers interview questions and provides instant guidance on demand
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Compass className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">Career Roadmap</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                AI-generated learning paths tailored to your target role, skill level, and career goals
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <SearchCheck className="text-teal-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">Tech Q&A Quiz</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Generate MCQs and True/False quizzes on any tech topic to test your knowledge
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Code2 className="text-indigo-500 mt-1 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold">Developer Showcase</h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                Dedicated developer portfolio highlighting tech stack experience badges and social links
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
          <Link href="/auto-apply">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Auto Apply Jobs
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
