"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Resume = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Resume Builder</h1>
      <p className="text-zinc-600 dark:text-zinc-300 text-center max-w-2xl">
        Create a professional resume with our AI-assisted tools. Optimize your resume for better job opportunities.
      </p>
      <Link href="/Resume_Builder">
        <Button className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-full">
          Build Your Resume
        </Button>
      </Link>
    </div>
  );
};

export default Resume;