import fs from "fs";
import path from "path";

export interface ApplicationLog {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  platform: "LinkedIn" | "Indeed";
  appliedAt: string;
  status: "Applied" | "Dry-Run" | "Skipped" | "Failed";
  matchScore: number;
  aiAnswersCount: number;
  jobUrl?: string;
  reason?: string;
}

const LOGS_FILE_PATH = path.join(process.cwd(), "logs", "applications.json");

// In-memory fallback if file system write fails
let inMemoryLogs: ApplicationLog[] = [
  {
    id: "log-1",
    jobTitle: "Senior React Developer",
    companyName: "TechCorp Solutions",
    location: "Remote (India)",
    platform: "LinkedIn",
    appliedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: "Applied",
    matchScore: 92,
    aiAnswersCount: 3,
    jobUrl: "https://linkedin.com/jobs/view/101"
  },
  {
    id: "log-2",
    jobTitle: "Full Stack Software Engineer",
    companyName: "Innovate Labs",
    location: "Bangalore",
    platform: "Indeed",
    appliedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: "Applied",
    matchScore: 88,
    aiAnswersCount: 2,
    jobUrl: "https://indeed.com/viewjob?jk=202"
  },
  {
    id: "log-3",
    jobTitle: "Node.js Backend Developer",
    companyName: "CloudScale Systems",
    location: "Remote",
    platform: "LinkedIn",
    appliedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    status: "Dry-Run",
    matchScore: 85,
    aiAnswersCount: 4,
    jobUrl: "https://linkedin.com/jobs/view/103"
  }
];

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  try {
    fs.mkdirSync(dirname, { recursive: true });
  } catch (err) {
    console.warn("Could not create logs directory:", err);
  }
}

export function getLogs(): ApplicationLog[] {
  try {
    ensureDirectoryExists(LOGS_FILE_PATH);
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading logs file, returning memory logs:", err);
  }
  return inMemoryLogs;
}

export function addLog(logItem: Omit<ApplicationLog, "id" | "appliedAt">): ApplicationLog {
  const newLog: ApplicationLog = {
    ...logItem,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    appliedAt: new Date().toISOString()
  };

  try {
    const currentLogs = getLogs();
    const updatedLogs = [newLog, ...currentLogs];
    
    ensureDirectoryExists(LOGS_FILE_PATH);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(updatedLogs, null, 2), "utf-8");
    inMemoryLogs = updatedLogs;
  } catch (err) {
    console.warn("Error writing log file, updating in-memory logs:", err);
    inMemoryLogs = [newLog, ...inMemoryLogs];
  }

  return newLog;
}

export function getTodayCount(): number {
  const logs = getLogs();
  const todayStr = new Date().toISOString().split("T")[0];
  
  return logs.filter(log => {
    return (log.status === "Applied" || log.status === "Dry-Run") && log.appliedAt.startsWith(todayStr);
  }).length;
}

export function clearLogs(): void {
  inMemoryLogs = [];
  try {
    ensureDirectoryExists(LOGS_FILE_PATH);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.warn("Error clearing log file:", err);
  }
}
