"use client";

import { useState } from "react";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, pass }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="border p-6 rounded-xl w-[300px] space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Private Access</h2>

        <input
          placeholder="Username"
          className="border p-2 w-full"
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="bg-black text-white p-2 w-full rounded">
          Login
        </button>
      </form>
    </div>
  );
}
