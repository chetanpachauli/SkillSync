  "use client";
  import {
    User,
    GraduationCap,
    Briefcase,
    Wrench,
    Linkedin
  } from "lucide-react";

  const stepIcons = {
    Personal: User,
    Education: GraduationCap,
    Experience: Briefcase,
    Skills: Wrench,
    Socials: Linkedin
  };

  export default function ProgressBar({ steps, step }) {
    return (
      <div className="flex flex-row md:flex-col  items-center gap-4 w-full">
        {steps.map((label, i) => {
          const Icon = stepIcons[label];
          const active = i <= step;

          return (
            <div
              key={i}
              className="flex flex-col items-center md:flex-1 text-xs text-center"
            >
              <div
                className={`rounded-full p-2 transition-all duration-300 ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-1 ${
                  active
                    ? "text-blue-600 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
