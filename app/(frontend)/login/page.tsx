"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "./services/feAuthService";
import { useUser } from "@/app/(frontend)/login/context/userContext";
import FormInput from "@/components/ui/admin/form-input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { setEmailContext } = useUser();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { success } = await FeAuthService.login(email, password);
    setEmailContext(email);
    localStorage.setItem("userEmail", email);

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
      <div className="max-w-2xl bg-white p-8">
        {/* Judul */}
        <h2 className="font-bold text-center text-[#00B0EB] text-[32px]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-base text-[18px]">
          Selamat Datang di AI Report Generator by
        </p>
        <p className="text-center text-base mb-3 text-[18px]">Klinik Pintar</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-y-4">
          <FormInput
            label="Email"
            name="email"
            type="text"
            value={email}
            placeholder="Masukkan email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Password"
            name="password"
            type="text"
            value={password}
            placeholder="Masukkan password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

          {error && <p className="text-magenta-900 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className={`w-full mt-6 font-semibold text-18 py-3 px-6 rounded-[50px] ${
              loading ? "bg-[#00B0EB]/80" : "bg-[#00B0EB]"
            } text-white`}
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
