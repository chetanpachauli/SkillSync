"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  Sparkles,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Settings,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Building2,
  MapPin,
  Trash2,
  SlidersHorizontal,
  X,
  Bot
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ApplicationLog {
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

interface ApplierStatus {
  isRunning: boolean;
  currentPlatform: "LinkedIn" | "Indeed" | "Idle";
  currentJobTitle: string;
  currentCompany: string;
  dailyAppliedCount: number;
  dailyLimit: number;
  lastActionMessage: string;
  logs: ApplicationLog[];
}

interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRoles: string[];
  targetLocations: string[];
  totalExperienceYears: number;
  techExperience: Record<string, number>;
  noticePeriodDays: number;
  currentSalaryLPA: number;
  expectedSalaryLPA: number;
  dailyLimit: number;
  dryRun: boolean;
}

export default function AutoApplyDashboard() {
  const [status, setStatus] = useState<ApplierStatus>({
    isRunning: false,
    currentPlatform: "Idle",
    currentJobTitle: "",
    currentCompany: "",
    dailyAppliedCount: 0,
    dailyLimit: 15,
    lastActionMessage: "Engine Ready",
    logs: []
  });

  const [dryRun, setDryRun] = useState<boolean>(false);
  const [platformChoice, setPlatformChoice] = useState<"Both" | "LinkedIn" | "Indeed">("Both");
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Poll status & live logs
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/auto-apply/logs");
      const json = await res.json();
      if (json.success && json.status) {
        setStatus((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(json.status)) {
            return prev; // Prevents unnecessary React re-renders when data is unchanged
          }
          return json.status;
        });
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auto-apply/profile");
      const json = await res.json();
      if (json.success && json.profile) {
        setProfile((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(json.profile)) {
            return prev;
          }
          return json.profile;
        });
        setDryRun((prev) => {
          const newDryRun = json.profile.dryRun || false;
          return prev === newDryRun ? prev : newDryRun;
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!status.isRunning) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [status.isRunning]);

  // Trigger Start / Stop Auto-Applier
  const handleToggleEngine = async (action: "start" | "stop") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auto-apply/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          dryRun,
          platform: platformChoice,
          customProfile: profile
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to trigger auto-applier engine.");
      }

      if (json.status) {
        setStatus(json.status);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await fetch("/api/auto-apply/logs", { method: "DELETE" });
      fetchStatus();
    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const updated = { ...profile, dryRun };
      const res = await fetch("/api/auto-apply/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.profile);
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              Automated Job Engine (LinkedIn & Indeed)
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              AI Job <span className="text-blue-600 dark:text-blue-400">Auto-Applier</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Playwright browser automation with Gemini 2.5 Flash for answering custom screening questions based on your candidate profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Settings className="w-4 h-4 text-zinc-500" />
              Candidate Profile & Preferences
            </button>
          </div>
        </div>

        {/* Account Safety Banner */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Account Guardrail Active:</strong> Persistent local browser cookies • Max 15 jobs/day • Randomized human delays (20-45s)
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-blue-500/20 rounded-full font-bold">
            Local IP Residential Mode
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Control Bar & Options Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Action Buttons */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-4">
              {!status.isRunning ? (
                <button
                  onClick={() => handleToggleEngine("start")}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition duration-150 flex items-center gap-2.5 shadow-sm active:scale-95 text-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start Auto-Apply
                </button>
              ) : (
                <button
                  onClick={() => handleToggleEngine("stop")}
                  disabled={loading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3.5 rounded-2xl transition duration-150 flex items-center gap-2.5 shadow-sm active:scale-95 text-sm"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Stop Engine
                </button>
              )}

              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-500 px-2">Platform:</span>
                <select
                  value={platformChoice}
                  onChange={(e) => setPlatformChoice(e.target.value as any)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold px-3 py-1.5 focus:outline-none"
                >
                  <option value="Both">Both (LinkedIn & Indeed)</option>
                  <option value="LinkedIn">LinkedIn Only</option>
                  <option value="Indeed">Indeed Only</option>
                </select>
              </div>
            </div>

            {/* Dry-Run Toggle */}
            <div className="flex items-center justify-end gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Dry-Run Test Mode</p>
                <p className="text-[10px] text-zinc-400">Fill forms without final click</p>
              </div>
              <button
                onClick={() => setDryRun(!dryRun)}
                className={`w-12 h-6 rounded-full p-1 transition duration-200 ${dryRun ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-200 ${dryRun ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

          </div>

          {/* Live Action Status Box */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.isRunning ? "bg-blue-500 animate-ping" : "bg-zinc-400"}`} />
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Status</p>
                <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 mt-0.5">
                  {status.lastActionMessage}
                </p>
              </div>
            </div>

            {/* Daily Cap Progress */}
            <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-4">
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-400 block uppercase">Daily Cap Progress</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                  {status.dailyAppliedCount} / {status.dailyLimit} Jobs Today
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* APPLIED JOBS FEED TABLE & CARDS (The core user request) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Live Application Feed</h2>
              <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-semibold text-zinc-500">
                {status.logs.length} Total
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStatus}
                className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 rounded-xl transition text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              {status.logs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500/10 text-rose-600 rounded-xl transition text-xs flex items-center gap-1.5 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          {/* Table / List View */}
          {status.logs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full w-fit mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">No Applications Logged Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Click <strong>&quot;Start Auto-Apply&quot;</strong> above to search LinkedIn & Indeed and automatically apply to matching jobs.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-zinc-400 font-bold">
                    <tr>
                      <th className="py-3.5 px-6">Company & Job Title</th>
                      <th className="py-3.5 px-4">Platform</th>
                      <th className="py-3.5 px-4">AI Match</th>
                      <th className="py-3.5 px-4">AI Questions</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
                    {status.logs.map((log) => {
                      const dateObj = new Date(log.appliedAt);
                      const isValidDate = !isNaN(dateObj.getTime());
                      const formattedDate = isValidDate
                        ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "";
                      const formattedTime = isValidDate
                        ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                        : "";
                      const fullDateTimeStr = isValidDate ? `${formattedDate} • ${formattedTime}` : log.appliedAt;
                      
                      return (
                        <tr key={log.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors duration-150">
                          
                          {/* Company & Title */}
                          <td className="py-4 px-6">
                            <div className="space-y-0.5">
                              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{log.jobTitle}</p>
                              <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                                <span className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
                                  <Building2 className="w-3 h-3 text-zinc-400" />
                                  {log.companyName}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-zinc-400" />
                                  {log.location}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Platform Badge */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              log.platform === "LinkedIn" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                            }`}>
                              {log.platform}
                            </span>
                          </td>

                          {/* AI Match Score */}
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                              {log.matchScore}% Match
                            </span>
                          </td>

                          {/* AI Answers Count */}
                          <td className="py-4 px-4 text-zinc-500">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{log.aiAnswersCount}</span> questions answered
                          </td>

                          {/* Applied Date & Time */}
                          <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300 text-[11px] whitespace-nowrap font-medium">
                            {fullDateTimeStr}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              log.status === "Applied" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                              log.status === "Dry-Run" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                            }`}>
                              {log.status === "Applied" ? "✓ Applied" : log.status}
                            </span>
                          </td>

                          {/* Job Link */}
                          <td className="py-4 px-6 text-right">
                            {log.jobUrl && (
                              <a
                                href={log.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-xl inline-flex transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* PROFILE & PREFERENCES EDIT MODAL */}
      <AnimatePresence>
        {showProfileModal && profile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-green-700 dark:text-green-400" />
                  <h3 className="text-lg font-bold">Candidate Profile & Target Filters</h3>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Full Name</label>
                    <input
                      type="text"
                      value={profile.fullName || ""}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Target Roles (comma separated)</label>
                    <input
                      type="text"
                      value={profile.targetRoles.join(", ")}
                      onChange={(e) => setProfile({ ...profile, targetRoles: e.target.value.split(",").map(s => s.trim()) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Target Locations (comma separated)</label>
                    <input
                      type="text"
                      value={profile.targetLocations.join(", ")}
                      onChange={(e) => setProfile({ ...profile, targetLocations: e.target.value.split(",").map(s => s.trim()) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Total Experience (Years)</label>
                    <input
                      type="number"
                      value={profile.totalExperienceYears}
                      onChange={(e) => setProfile({ ...profile, totalExperienceYears: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Notice Period (Days)</label>
                    <input
                      type="number"
                      value={profile.noticePeriodDays}
                      onChange={(e) => setProfile({ ...profile, noticePeriodDays: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Daily Cap Limit</label>
                    <input
                      type="number"
                      value={profile.dailyLimit}
                      onChange={(e) => setProfile({ ...profile, dailyLimit: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Current Salary (LPA)</label>
                    <input
                      type="number"
                      value={profile.currentSalaryLPA}
                      onChange={(e) => setProfile({ ...profile, currentSalaryLPA: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-500">Expected Salary (LPA)</label>
                    <input
                      type="number"
                      value={profile.expectedSalaryLPA}
                      onChange={(e) => setProfile({ ...profile, expectedSalaryLPA: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition"
                  >
                    Save Preferences
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
