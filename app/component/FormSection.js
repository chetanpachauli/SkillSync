"use client";
import { useState } from "react";

const fields = [
  { label: "First Name", name: "firstName" },
  { label: "Surname", name: "surname" },
  { label: "City", name: "city" },
  { label: "Country", name: "country" },
  { label: "Pin Code", name: "pinCode" },
  { label: "Email", name: "email" },
  { label: "Phone", name: "phone" },
  { label: "Education", name: "education" },
  { label: "Experience", name: "experience" },
  { label: "Skills", name: "skills" },
];

export default function ResumeForm() {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("resume-data");
      return stored
        ? JSON.parse(stored)
        : Object.fromEntries(fields.map(({ name }) => [name, ""]));
    }
    return {};
  });

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    localStorage.setItem("resume-data", JSON.stringify(updated));
  };

  return (
    <form className="space-y-4 mx-2">
      {fields.map(({ label, name }) => (
        <div key={name}>
          <label
            htmlFor={name}
            className="block text-sm font-medium text-zinc-800 dark:text-white mb-1"
          >
            {label}
          </label>
          <textarea
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-zinc-700 dark:text-white"
            rows={name === "skills" || name === "experience" ? 5 : 1}
          />
        </div>
      ))}
    </form>
  );
}
