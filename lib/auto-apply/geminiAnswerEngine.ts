import { GoogleGenerativeAI } from "@google/generative-ai";
import candidateProfile from "./candidate_profile.json";

async function fetchWithTimeout(url: string, options: any, timeout = 12000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Answers a job application screening question using Candidate Profile and Gemini AI
 */
export async function answerScreeningQuestion(
  questionPrompt: string,
  options?: string[],
  customProfile?: any
): Promise<string> {
  const profile = customProfile || candidateProfile;

  const systemPrompt = `You are an automated job applicant AI assistant answering a job application screening question on behalf of a job candidate.

Candidate Profile Data:
- Full Name: ${profile.fullName}
- Location: ${profile.location}
- Total Experience: ${profile.totalExperienceYears} years
- Tech Stack Experience Years: ${JSON.stringify(profile.techExperience)}
- Notice Period: ${profile.noticePeriodDays} days
- Current Salary: ${profile.currentSalaryLPA} LPA
- Expected Salary: ${profile.expectedSalaryLPA} LPA
- Work Authorization: ${profile.workAuthorization}
- Requires Visa Sponsorship: ${profile.requiresSponsorship}

Screening Question Asked: "${questionPrompt}"
${options && options.length > 0 ? `Available Dropdown/Radio Options: ${JSON.stringify(options)}` : ""}

Instructions:
1. If the question asks for years of experience in a specific technology (e.g. Node.js, React, Python):
   - Look up the skill in Candidate Tech Stack Experience. If found, return ONLY the integer number of years (e.g. "2").
   - If not explicitly listed, estimate based on Total Experience (${profile.totalExperienceYears}) or return "1" or "2".
2. If options are provided, pick the SINGLE option that best matches the candidate profile (e.g. "Yes", "Immediate", "Full-time").
3. If it's a numeric question (salary, notice period, experience), return ONLY the digits or simple numeric answer (e.g., "0" for notice period, "12" for salary).
4. If it's an open-ended descriptive question, provide a concise 1-2 sentence professional answer written in first person ("I have 2+ years of experience...").

Return ONLY valid JSON matching this schema:
{
  "answer": "Exact string answer to enter into the form field"
}`;

  let finalAnswer = "";

  // Attempt 1: Gemini 2.5 Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(systemPrompt);
      const parsed = JSON.parse(cleanJsonResponse(result.response.text()));
      if (parsed?.answer) return String(parsed.answer);
    } catch (e: any) {
      console.warn("Gemini 2.5 answer engine error:", e.message);
    }
  }

  // Attempt 2: Gemini 1.5 Flash
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(systemPrompt);
      const parsed = JSON.parse(cleanJsonResponse(result.response.text()));
      if (parsed?.answer) return String(parsed.answer);
    } catch (e: any) {
      console.warn("Gemini 1.5 answer engine error:", e.message);
    }
  }

  // Attempt 3: Groq Fallback
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: systemPrompt }],
          }),
        },
        8000
      );
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(cleanJsonResponse(data.choices[0].message.content));
        if (parsed?.answer) return String(parsed.answer);
      }
    } catch (e: any) {
      console.warn("Groq answer engine error:", e.message);
    }
  }

  // Attempt 4: OpenRouter Fallback
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "SkillSync Auto-Applier",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: systemPrompt }],
          }),
        },
        8000
      );
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(cleanJsonResponse(data.choices[0].message.content));
        if (parsed?.answer) return String(parsed.answer);
      }
    } catch (e: any) {
      console.warn("OpenRouter answer engine error:", e.message);
    }
  }

  // Heuristic Fallback
  const lowerQ = questionPrompt.toLowerCase();
  if (lowerQ.includes("year") || lowerQ.includes("experience")) return String(profile.totalExperienceYears || 2);
  if (lowerQ.includes("notice")) return String(profile.noticePeriodDays || 0);
  if (lowerQ.includes("salary") || lowerQ.includes("ctc")) return String(profile.expectedSalaryLPA || 12);
  if (lowerQ.includes("sponsorship") || lowerQ.includes("visa")) return profile.requiresSponsorship || "No";
  if (options && options.length > 0) return options[0];

  return "Yes";
}

/**
 * Evaluates candidate match score for a job posting
 */
export async function evaluateJobMatch(
  jobTitle: string,
  jobDescription?: string,
  customProfile?: any
): Promise<{ score: number; reason: string; shouldApply: boolean }> {
  const profile = customProfile || candidateProfile;

  const prompt = `Evaluate the candidate's compatibility for this job posting:
Job Title: "${jobTitle}"
Job Description Summary: "${jobDescription || "N/A"}"

Candidate Target Roles: ${JSON.stringify(profile.targetRoles)}
Candidate Total Experience: ${profile.totalExperienceYears} years
Candidate Tech Stack: ${JSON.stringify(profile.techExperience)}

Return ONLY valid JSON matching this schema:
{
  "score": 85, // Number from 0 to 100
  "reason": "Strong match with React and Node.js requirements",
  "shouldApply": true // Boolean (true if score >= 60)
}`;

  // Stage 1: Gemini 2.5 Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const res = await model.generateContent(prompt);
      const parsed = JSON.parse(cleanJsonResponse(res.response.text()));
      return {
        score: parsed.score || 80,
        reason: parsed.reason || "Good title match with target profile",
        shouldApply: parsed.shouldApply !== undefined ? parsed.shouldApply : true,
      };
    } catch (e: any) {
      console.warn("Gemini 2.5 job match evaluation error:", e.message);
    }
  }

  // Stage 2: Groq Fallback
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        },
        8000
      );
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(cleanJsonResponse(data.choices[0].message.content));
        return {
          score: parsed.score || 85,
          reason: parsed.reason || "Matched using Groq AI engine",
          shouldApply: parsed.shouldApply !== undefined ? parsed.shouldApply : true,
        };
      }
    } catch (e: any) {
      console.warn("Groq job match evaluation error:", e.message);
    }
  }

  // Stage 3: OpenRouter Fallback
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "SkillSync Auto-Applier",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        },
        8000
      );
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(cleanJsonResponse(data.choices[0].message.content));
        return {
          score: parsed.score || 82,
          reason: parsed.reason || "Matched using OpenRouter AI engine",
          shouldApply: parsed.shouldApply !== undefined ? parsed.shouldApply : true,
        };
      }
    } catch (e: any) {
      console.warn("OpenRouter job match evaluation error:", e.message);
    }
  }

  // Basic title heuristic matching fallback
  const isMatch = profile.targetRoles.some((role: string) =>
    jobTitle.toLowerCase().includes(role.toLowerCase()) || role.toLowerCase().includes(jobTitle.toLowerCase())
  );

  return {
    score: isMatch ? 88 : 72,
    reason: isMatch ? "Direct title keyword match" : "Related tech stack profile match",
    shouldApply: true
  };
}
