import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomOutIcon } from "lucide-react";
import Image from "next/image";

const Resume_Zoom = ({ data, setIsZoomed }) => {
  const handleZoomout = () => {
    setIsZoomed(false);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md overflow-y-auto p-4 md:p-8 flex justify-center items-start">
      <div className="relative w-full max-w-[820px] bg-white text-black p-8 md:p-12 rounded-xl shadow-2xl border border-zinc-200 font-serif text-left my-4">
        
        {/* Close Button */}
        <Button
          onClick={handleZoomout}
          className="absolute top-4 right-4 rounded-full z-50 bg-zinc-900 hover:bg-zinc-800 text-white border-none shadow-md"
          variant="default"
          size="icon"
        >
          <ZoomOutIcon size={18} />
        </Button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-zinc-900 mb-1">
              {data.name || "YOUR NAME"}
            </h1>
            
            {/* Contact details */}
            <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-zinc-600 mt-1">
              {data.email && <span>{data.email}</span>}
              {data.email && (data.phone || data.address) && <span className="text-zinc-400">•</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.phone && data.address && <span className="text-zinc-400">•</span>}
              {data.address && <span>{data.address}</span>}
            </div>
            
            {/* Socials / Professional links */}
            {(data.linkedin || data.github || data.instagram) && (
              <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-blue-800 mt-1">
                {data.linkedin && (
                  <a href={data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {data.linkedin.replace(/https?:\/\/(www\.)?/, "")}
                  </a>
                )}
                {data.linkedin && data.github && <span className="text-zinc-400">•</span>}
                {data.github && (
                  <a href={data.github.startsWith("http") ? data.github : `https://${data.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {data.github.replace(/https?:\/\/(www\.)?/, "")}
                  </a>
                )}
                {data.github && data.instagram && <span className="text-zinc-400">•</span>}
                {data.instagram && (
                  <a href={data.instagram.startsWith("http") ? data.instagram : `https://${data.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {data.instagram.replace(/https?:\/\/(www\.)?/, "")}
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Executive photo if present */}
          {data.photo && (
            <div className="w-24 h-28 relative border border-zinc-200 ml-4 rounded shadow-sm overflow-hidden shrink-0">
              <Image src={data.photo} alt="Profile Headshot" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Summary */}
        {data.summary && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2">
              Professional Summary
            </h2>
            <p className="text-xs md:text-sm text-zinc-700 leading-relaxed text-justify">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {(data.company || data.experience) && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2">
              Work Experience
            </h2>
            <div className="mb-3">
              <div className="flex justify-between items-baseline text-xs md:text-sm">
                <span className="font-bold text-zinc-900">{data.company || "Company Name"}</span>
                <span className="text-zinc-600 font-semibold">{data.duration || "Dates"}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs md:text-sm italic text-zinc-700 mb-1">
                <span>{data.position || "Position / Title"}</span>
              </div>
              {data.experience && (
                <ul className="list-disc list-inside text-xs md:text-sm text-zinc-700 space-y-1 pl-1">
                  {data.experience.split("\n").map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    return (
                      <li key={idx} className="leading-relaxed list-outside ml-4 pl-0.5">
                        {trimmed.replace(/^[•\-\*]\s*/, "")}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {(data.school || data.education) && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2">
              Education
            </h2>
            <div className="mb-2">
              <div className="flex justify-between items-baseline text-xs md:text-sm">
                <span className="font-bold text-zinc-900">{data.school || "School / University"}</span>
                <span className="text-zinc-600 font-semibold">{data.year || "Year"}</span>
              </div>
              <div className="text-xs md:text-sm italic text-zinc-700">
                {data.degree || "Degree / Program"}
              </div>
              {data.education && (
                <p className="text-xs md:text-sm text-zinc-655 mt-1 leading-relaxed text-justify">
                  {data.education}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Skills & Tools */}
        {(data.skills || data.tools || data.languages) && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2">
              Skills, Tools & Languages
            </h2>
            <div className="space-y-1.5 text-xs md:text-sm text-zinc-700">
              {data.skills && (
                <div>
                  <span className="font-bold text-zinc-900">Technical Skills: </span>
                  <span>{data.skills.split("\n").filter(s => s.trim()).join(", ")}</span>
                </div>
              )}
              {data.tools && (
                <div>
                  <span className="font-bold text-zinc-900">Developer Tools: </span>
                  <span>{data.tools.split("\n").filter(t => t.trim()).join(", ")}</span>
                </div>
              )}
              {data.languages && (
                <div>
                  <span className="font-bold text-zinc-900">Languages: </span>
                  <span>{data.languages.split("\n").filter(l => l.trim()).join(", ")}</span>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Resume_Zoom;