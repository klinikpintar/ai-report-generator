"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "./services/feAuthService";
import { useUser } from "@/app/(frontend)/login/context/userContext";
import FormInput from "@frontend/components/form-input";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { setEmailContext } = useUser();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isSubmitting = useRef(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blokir multiple submissions instan
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    try {
      const { success } = await FeAuthService.login(email, password);

      if (success) {
        setEmailContext(email);
        localStorage.setItem("userEmail", email);
        toast.success("Login successful! Redirecting...");

        // Delay sebentar untuk pengguna melihat toast
        setTimeout(() => {
          router.push("/");
        }, 500);
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
          <div className="relative">
            <FormInput
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Masukkan password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleShowPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-6 h-6" />
              ) : (
                <EyeIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full mt-4 font-semibold text-18 py-3 px-6 rounded-[50px] ${loading ? "bg-blue-6/80 cursor-not-allowed" : "bg-blue-6"
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