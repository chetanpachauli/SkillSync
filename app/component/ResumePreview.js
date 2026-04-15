"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomInIcon } from "lucide-react";
import Image from "next/image";
import Resume_Zoom from "./REsumeZoom";

export default function ResumePreview({ data }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
    <div
  style={{ borderColor: "#212d59" }}
  className="md:w-[360px] md:h-[500px] h-full w-full overflow-hidden mx-auto bg-white text-black border-2 border-solid font-sans relative shadow-2xl rounded-md scale-[0.9]"
>

        {/* Top Strip */}
        <div className="flex flex-col items-center w-full">
          <div className="w-2/3 border-[20px]" style={{ borderColor: "#212d59" }}></div>
        </div>

        {/* Resume Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2">
          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-6">
            {/* Name */}
            <h1 className="md:text-base font-bold uppercase text-[#212d59] border-b border-black pb-1">
              {data.name}
            </h1>

            {/* Summary */}
            <section>
              <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                Summary
              </h2>
              <p className="text-xs text-gray-800 dark:text-gray-300 leading-relaxed">
                {data.summary}
              </p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                Experience
              </h2>
              {data.company && <p className="text-xs font-semibold">{data.company}</p>}
              {(data.position || data.duration) && (
                <p className="text-xs italic text-gray-700">
                  {data.position}
                  {data.position && data.duration ? " | " : ""}
                  {data.duration}
                </p>
              )}
              <p className="text-xs text-gray-800 whitespace-pre-line mt-1">
                {data.experience}
              </p>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                Education & Training
              </h2>
              <p className="text-xs font-semibold italic">{data.degree}</p>
              <p className="text-xs text-gray-700">
                {data.school} – {data.year}
              </p>
              <p className="text-xs text-gray-700 mt-1">{data.education}</p>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-4">
            {/* Photo */}
            {data.photo ? (
              <div className="w-full h-48 relative border shadow-md rounded-md overflow-hidden">
                <Image src={data.photo} alt="Profile Photo" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-600 rounded-md border">
                No Image
              </div>
            )}

            {/* Contact */}
            <section>
              <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                Contact
              </h2>
              <p className="text-xs"><strong>Address:</strong> {data.address}</p>
              <p className="text-xs"><strong>Phone:</strong> {data.phone}</p>
              <p className="text-xs"><strong>Email:</strong> {data.email}</p>
            </section>

            {/* Socials */}
            {(data.linkedin || data.github || data.instagram) && (
              <section>
                <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                  Socials
                </h2>
                <ul className="text-xs space-y-1">
                  {data.linkedin && (
                    <li>
                      <strong>LinkedIn:</strong>{" "}
                      <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {data.linkedin}
                      </a>
                    </li>
                  )}
                  {data.github && (
                    <li>
                      <strong>GitHub:</strong>{" "}
                      <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {data.github}
                      </a>
                    </li>
                  )}
                  {data.instagram && (
                    <li>
                      <strong>Instagram:</strong>{" "}
                      <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {data.instagram}
                      </a>
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Skills, Tools, Languages */}
            <section>
              <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                Skills
              </h2>
              <ul className="text-xs list-disc list-inside space-y-1">
                {data.skills?.split("\n").map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>

              {data.tools && (
                <>
                  <h2 className="text-xs font-semibold uppercase border-b border-black pt-4 pb-1 mb-1 text-[#212d59]">
                    Tools
                  </h2>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {data.tools.split("\n").map((tool, i) => (
                      <li key={i}>{tool}</li>
                    ))}
                  </ul>
                </>
              )}

              {data.languages && (
                <>
                  <h2 className="text-xs font-semibold uppercase border-b border-black pt-4 pb-1 mb-1 text-[#212d59]">
                    Languages
                  </h2>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {data.languages.split("\n").map((lang, i) => (
                      <li key={i}>{lang}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        </div>

        {/* Zoom Button */}
        <Button
          onClick={() => setIsZoomed(true)}
          className="rounded-full absolute bottom-3 left-3 p-2"
        >
          <ZoomInIcon width={40} />
        </Button>
      </div>

      {/* Zoomed Preview */}
      {isZoomed && <Resume_Zoom data={data} setIsZoomed={setIsZoomed} />}
    </>
  );
}
