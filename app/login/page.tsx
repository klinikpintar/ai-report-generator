"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "../services/feAuthService";
import Image from "next/image";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const authService = new FeAuthService();
    const { success, message } = await authService.login(email, password);

    if (success) {
      router.push("/");
    } else {
      setError("Login failed. Please check your credentials.");
      setEmail("");
      setPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Logo */}
      <div className="absolute top-[38px] left-[104px] h-auto">
        <Image src="/images/logo.png" alt="Klinik Pintar" width={175} height={52} />
      </div>

      <div className="w-full max-w-lg bg-white p-8">
        {/* Judul */}
        <h2 className="text-2xl font-bold text-center text-blue-600 text-4xl">
          Sign in to your account
        </h2>
        <p className="mt-4 text-center text-lg">
          Selamat Datang di AI Report Generator by
        </p>
        <p className="text-center text-lg mb-4">Klinik Pintar</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border-2 border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border-2 border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-magenta-900 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className={`w-full mt-6 font-semibold text-lg py-3 px-6 rounded-50px ${loading ? 'bg-blue-400' : 'bg-blue-600'} text-white`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;