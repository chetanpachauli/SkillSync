"use client";

import { Github, Linkedin, Mail, Heart, BookText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full py-10 px-6 md:px-20 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Logo & Tagline */}
        <div className="flex items-center space-x-3 group relative">
          <Image
            alt="logo of skillSync"
            width={36}
            height={36}
            src="/images/c-square.png"
            className="dark:invert"
          />
          <p className="text-sm">
            Your AI-driven companion for smarter career growth. Interview
            better. Build stronger resumes. Get hired faster.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-zinc-800 dark:text-white">
            Quick Links
          </h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/#about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/resume" className="hover:underline">
                Resume Analyzer
              </Link>
            </li>
            <li>
              <Link href="/interview" className="hover:underline">
                Mock Interview
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social + Contact */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-zinc-800 dark:text-white">
            Connect
          </h4>
          <div className="flex justify-center md:justify-start gap-4 text-zinc-600 dark:text-zinc-400">
            <Link href="mailto:chetanpachauli@gmail.com" aria-label="Email">
              <Mail size={20} />
            </Link>
            <Link
              href="https://github.com/chetanpachauli"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github size={20} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/chetan-pachauli"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 text-xs text-center text-zinc-500 dark:text-zinc-400 border-t mt-10 border-zinc-200 dark:border-zinc-700">
        © {new Date().getFullYear()} SkillSync. Made with{" "}
        <Heart size={14} className="inline text-red-500" /> by Chetan Pachauli.
      </div>
    </footer>
  );
};

export default Footer;
