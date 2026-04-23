"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Interview = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">AI Interview Preparation</h1>
      <p className="text-zinc-600 dark:text-zinc-300 text-center max-w-2xl">
        Prepare for your next tech interview with our AI-powered mock interviews. Get personalized feedback and improve your skills.
      </p>
      <Link href="/Aiprep">
        <Button className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-full">
          Start Interview Prep
        </Button>
      </Link>
    </div>
  );
};

export default Interview;