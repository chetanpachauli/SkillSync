"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ImageSlider from "../../components/ImageSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
  faLinkedinIn,
  faCloudflare,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Hero = () => {
  return (
    <section className="w-full min-h-[90vh] flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-10 transition-colors">
      {/* Left Content */}
      <div className="w-full flex flex-col items-center justify-center space-y-6">
        <h1 className="text-center text-4xl md:text-6xl font-bold text-zinc-800 dark:text-white leading-tight">
          Master Your <span className="text-blue-600 dark:text-blue-400">Tech Skills</span> <br />
          with <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ChetanAI</span>
        </h1>

        <p className="text-zinc-600 text-center dark:text-zinc-300 text-lg md:text-xl">
          Prepare for interviews, refine your resume, and unlock your career potential with AI-powered guidance.
        </p>

        <div className="flex space-x-4">
          <Link href="/Intro">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="#about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>

        <div className="flex w-full items-center justify-center mx-2 space-x-4 text-zinc-700 dark:text-white text-2xl">
          <Link href="https://www.linkedin.com/in/chetan-pachauli/" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon
              icon={faLinkedinIn}
              className="hover:scale-110 transition-transform hover:text-blue-600"
            />
          </Link>
          <Link href="https://github.com/chetanpachauli" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon
              icon={faGithub}
              className="hover:scale-110 transition-transform hover:text-black dark:hover:text-white"
            />
          </Link>
          <Link href="https://leetcode.com/u/ChetanPachauli" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/leetcode.svg"
              alt="LeetCode"
              width={23}
              height={23}
              className="hover:scale-110 transition-transform dark:invert hover:text-orange-500"
            />
          </Link>
        </div>
      </div>

      {/* Right Content (Image/3D/Illustration) */}
      <div className="w-full flex items-center justify-center mb-10 md:mb-0">
        <ImageSlider/>
      </div>
    </section>
  );
};

export default Hero;
