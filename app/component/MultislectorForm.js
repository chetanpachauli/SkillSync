"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, User, MapPin, Linkedin, GraduationCap, Briefcase,
  ScrollText, Wrench, Languages, Building2, Calendar, FileText,
  Github, Instagram, Image as ImageIcon
} from "lucide-react";
import Image from "next/image";

const steps = ["Personal", "Education", "Experience", "Skills", "Socials"];
const fields = {
  Personal: ["photo", "name", "email", "phone", "address", "summary"],
  Education: ["school", "degree", "year", "education"],
  Experience: ["company", "position", "duration", "experience"],
  Skills: ["skills", "tools", "languages"],
  Socials: ["linkedin", "github", "instagram"],
};
const labels = {
  photo: "Upload Profile Photo",
  name: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  address: "Address",
  summary: "Professional Summary",
  linkedin: "LinkedIn Profile",
  github: "GitHub Profile",
  instagram: "Instagram Handle",
  school: "School/College Name",
  degree: "Degree",
  year: "Year of Passing",
  education: "Educational Summary",
  company: "Company Name",
  position: "Job Title",
  duration: "Employment Duration",
  experience: "Experience Description",
  skills: "Skills",
  tools: "Tools/Technologies",
  languages: "Languages Known",
};
const icons = {
  photo: ImageIcon,
  name: User,
  email: Mail,
  phone: Phone,
  address: MapPin,
  summary: ScrollText,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  school: GraduationCap,
  degree: GraduationCap,
  year: Calendar,
  education: FileText,
  company: Building2,
  position: Briefcase,
  duration: Calendar,
  experience: ScrollText,
  skills: Wrench,
  tools: Wrench,
  languages: Languages,
};

export default function MultiStepForm({ step, setStep, formData, setFormData }) {
  const stepDescription = useMemo(() => ({
    0: "Include your full name, contact details, and profile picture.",
    1: "Add your education background.",
    2: "Mention your work experience.",
    3: "Add skills, tools and languages.",
    4: "Add your social links.",
  }), []);

  useEffect(() => {
    localStorage.setItem("resume-data", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    localStorage.setItem("resume-data", JSON.stringify(updated));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const updated = { ...formData, photo: base64 };
      setFormData(updated);
      localStorage.setItem("resume-data", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const currentFields = fields[steps[step]];
    for (let field of currentFields) {
      if (!formData[field] || formData[field].trim() === "") {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-900 shadow-xl h-full space-y-8 border border-zinc-300 dark:border-zinc-700">

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm z-10 transition-all duration-300
              ${i === step
                ? "bg-blue-600 text-white"
                : i < step
                ? "bg-green-600 text-white"
                : "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-white"}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300
                ${i < step ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Heading */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white">
          <span className="text-blue-500">Step {step + 1} of {steps.length}</span>: {steps[step]}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">{stepDescription[step]}</p>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields[steps[step]].map((field) => {
          const Icon = icons[field];
          const isTextarea = ["education", "experience", "skills", "tools", "languages", "summary"].includes(field);

          if (field === "photo") {
            return (
              <div key={field} className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                  <Icon className="inline-block mr-2" />
                  {labels[field]} <span className="text-red-500">*</span>
                </label>
                <div className="p-4 border-2 border-dashed rounded-lg flex flex-col md:flex-row gap-4 items-center dark:border-zinc-600">
                  {formData.photo ? (
                    <Image
                      src={formData.photo}
                      alt="Profile Preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-full border border-zinc-400 dark:border-zinc-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Upload a recent headshot for your resume.
                    </p>
                    <input
                     suppressHydrationWarning
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input file:rounded-md file:border-0 file:py-2 file:px-4 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-zinc-700 dark:hover:file:bg-zinc-600"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={field} className={`relative ${isTextarea ? "md:col-span-2" : ""}`}>
              <label htmlFor={field} className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
                {labels[field]} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-3 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                {isTextarea ? (
                  <textarea
                    id={field}
                    name={field}
                    rows={4}
                    aria-label={labels[field]}
                    aria-required="true"
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    id={field}
                    name={field}
                    type="text"
                    aria-label={labels[field]}
                    aria-required="true"
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600"
          disabled={step === 0}
        >
          Back
        </Button>

        {step === steps.length - 1 ? (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert("Resume data saved! Now preview/export.")}
          >
            Finish
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (validateStep()) {
                setStep((prev) => Math.min(steps.length - 1, prev + 1));
              } else {
                alert("Please fill all required fields for this step.");
              }
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
