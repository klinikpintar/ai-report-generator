"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "./services/feAuthService";
import { useUser } from "@/app/(frontend)/login/context/userContext";
import FormInput from "@frontend/components/form-input";
import { toast } from "react-toastify";
import Navbar from "@frontend/components/navbar";
import PasswordInput from "@frontend/components/password-input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { setEmailContext, setNameContext } = useUser();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blokir multiple submissions instan
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    try {
      const { success } = await FeAuthService.login(email, password);

      if (success) {
        const data = await FeAuthService.getUser();
        const user = data.data.user;
        setEmailContext(user.email);
        setNameContext(user.name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", user.name);
        toast.success("Login successful! Redirecting...");

        // Redirect based on user role
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Navbar />
      <div className="max-w-2xl p-8">
        {/* Judul */}
        <h2 className="font-bold text-center text-blue-6 text-[32px]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-base text-[18px]">
          Selamat Datang di AI Report Generator by
        </p>
        <p className="text-center text-base mb-3 text-[18px]">Klinik Pintar</p>

        {/* Form */}
        <form onSubmit={handleSubmit} method="post" className="space-y-4">
          <FormInput
            label="Email"
            name="email"
            type="text"
            value={email}
            placeholder="Masukkan email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={password}
            placeholder="Masukkan password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className={`w-full mt-4 font-semibold text-18 py-3 px-6 rounded-[50px] ${
              loading ? "bg-blue-6/80 cursor-not-allowed" : "bg-blue-6"
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
