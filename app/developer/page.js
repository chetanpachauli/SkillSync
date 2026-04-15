"use client";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck, Laptop, Code2, Linkedin,
  Github, Instagram, HomeIcon
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../components/modeToggle";

const skills = [
  "HTML", "CSS", "JavaScript", "React", "Next.js", "Node.js",
  "Tailwind CSS", "MongoDB", "Express.js", "Git", "three js ", "REST APIs"
];

const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sameer-negi",
    icon: <Linkedin className="w-5 h-5" />,
  },
  {
    name: "GitHub",
    url: "https://github.com/Sameer1311",
    icon: <Github className="w-5 h-5" />,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/negisameer_106",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    name: "Portfolio",
    url: "https://negisameer.live/",
    icon: <Laptop className="w-5 h-5" />,
  }
];

const Developer = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-10 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            👨‍💻 About Me
          </h1>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Link href="/">
                <HomeIcon className="w-5 h-5" />
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Introduction */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Hello! {"I'm"} <span className="font-semibold text-primary">Sameer Negi</span>, a passionate Full-Stack Developer who loves building modern, efficient, and user-friendly web applications. I thrive in solving complex problems and designing elegant, scalable solutions.
        </p>

        {/* Skills & What I Do Section */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Laptop className="text-primary w-6 h-6 animate-pulse" />
              What I Do
            </h2>
            <p className="text-muted-foreground dark:text-white leading-relaxed">
              I specialize in creating full-stack applications using modern technologies like <strong className="dark:text-gray-500">React</strong>, <strong className="dark:text-gray-500">Next.js</strong>, and <strong className="dark:text-gray-500">Node.js</strong>. I’m driven by performance, accessibility, and clean UI/UX design to deliver polished experiences.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Code2 className="text-primary w-6 h-6 animate-pulse" />
              My Tech Stack
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 ">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 hover:bg-primary hover:text-background rounded-xl bg-muted text-sm font-medium shadow-sm hover:scale-[1.02] transition-transform">
                  <BadgeCheck className="text-green-500 w-4 h-4 " />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center mt-16">
          <h3 className="text-xl font-semibold mb-4">📱 Connect with Me</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-muted hover:bg-primary hover:text-background px-5 py-2 rounded-full text-sm font-medium transition-all"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          Built with ❤️ using React, Next.js, and Tailwind CSS.
        </div>
      </div>
    </div>
  );
};

export default Developer;
