"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ProgressBar from "@/components/Progressbar";
import ResumePreview from "@/components/ResumePreview";
import MultiStepForm from "@/components/MultisectorForm";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DomToImage from "dom-to-image";

const steps = ["Personal", "Education", "Experience", "Skills", "Socials"];

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const resumeRef = useRef(); // 🔵 Ref to capture resume preview
 

const handleDownload = () => {
  const node = resumeRef.current;

 DomToImage.toPng(node)
    .then((dataUrl) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");
    })
    .catch((error) => {
      console.error("Error generating PDF", error);
    });
};


  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row border-2">
      {/* Left Section - Logo + ProgressBar */}
      <div
        style={{ backgroundColor: "#212d59" }}
        className="flex flex-col md:flex-col items-center md:items-center p-4 gap-4 w-full md:w-[200px]"
      >
        <div className="p-2">
          <Image
            alt="logo of SkillSync"
            width={36}
            height={36}
            src="/images/c-square.png"
            className="dark:invert"
          />
        </div>
        <div className="w-full">
          <ProgressBar steps={steps} step={step} />
        </div>
      </div>

      {/* Middle Form Section */}
      <div className="flex-grow">
        <MultiStepForm
          step={step}
          setStep={setStep}
          steps={steps}
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Right Resume Preview */}
      <div className="md:w-1/2 md:flex  flex-col justify-start items-center bg-white dark:bg-zinc-900 ]"> 
     <div
  ref={resumeRef}
  className="resume-print-safe md:mt-[20px] p-4 rounded-md shadow-md w-full max-w-[794px]"
>
  <ResumePreview data={formData} />
</div>


<Button onClick={handleDownload} className="bg-green-600 mt-4">
  Download
</Button>
</div>
    </main>
  );
}
