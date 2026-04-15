"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    const res = await fetch("/api/userExist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const { user } = await res.json();
    if (user) {
      setError("User already exists.");
      return;
    }

    const registerRes = await fetch("/api/userRegister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (registerRes.ok) {
      router.push("/Login");
    } else {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 px-6 py-12 text-white">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl">
        <div className="flex items-center mb-6 space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <MoveLeft />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            Register on SkillSync
          </h1>
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 mt-1 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-1 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                className="w-full px-4 py-2 mt-1 rounded bg-gray-800 text-white focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white rounded-lg font-semibold"
          >
            Register
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/Login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
