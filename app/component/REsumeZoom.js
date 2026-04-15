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
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      
      <div className="flex flex-col items-center justify-center bg-white dark:bg-black bg-opacity-80 backdrop-blur-md p-4 md:p-0 min-h-screen md:h-screen">
        <div
          style={{ borderColor: "#212d59" }}
          className="w-full h-full md:min-h-4/5 md:max-w-xl md:mx-5 bg-white text-black sm:mt-6 md:mt-2  border-2 border-solid font-sans overflow-hidden relative shadow-lg rounded-md"
        >
          <div className="flex flex-col items-center w-full">
            <div className="w-2/3 border-[20px]" style={{ borderColor: "#212d59" }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="col-span-2 space-y-6">
              <h1 className="md:text-base font-bold uppercase text-[#212d59] border-b border-black pb-1">
                {data.name}
              </h1>

              <section>
                <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                  Summary
                </h2>
                <p className="text-xs text-gray-800 dark:text-gray-300 leading-relaxed">
                  {data.summary}
                </p>
              </section>

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

            <div className="flex flex-col gap-4">
              {data.photo ? (
                <div className="w-full h-48 relative border shadow-md rounded-md overflow-hidden">
                  <Image src={data.photo} alt="Profile Photo" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-600 rounded-md border">
                  No Image
                </div>
              )}

              <section>
                <h2 className="text-xs font-semibold uppercase border-b border-black pb-1 mb-1 text-[#212d59]">
                  Contact
                </h2>
                <p className="text-xs"><strong>Address:</strong> {data.address}</p>
                <p className="text-xs"><strong>Phone:</strong> {data.phone}</p>
                <p className="text-xs"><strong>Email:</strong> {data.email}</p>
              </section>

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

          <Button
            onClick={handleZoomout}
            className="absolute top-4 right-4 rounded-full z-50 bg-blue-700 text-white hover:bg-blue-800"
          >
            <ZoomOutIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Resume_Zoom;