"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/images/Career.svg",
  "/images/Chat bot.svg",
  "/images/Job offers.svg",
  "/images/Research paper.svg",
  "/images/Resume-pana.svg",
];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []); // ← FIXED: Empty dependency array

  return (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[450px] relative overflow-hidden rounded-xl ">
      {images.map((src, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
            current === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <Image
            src={src}
            alt={`Slide ${index + 1}`}
            fill
            className="object-contain transition-transform duration-1000"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageSlider;
