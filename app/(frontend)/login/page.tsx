"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "./services/feAuthService";
import { useUser } from "@/app/(frontend)/login/context/userContext";
import FormInput from "@frontend/components/form-input";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { setEmailContext } = useUser();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blokir multiple submissions instan
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setLoading(true);
    setError("");

    try {
      const { success } = await FeAuthService.login(email, password);

      if (success) {
        setEmailContext(email);
        localStorage.setItem("userEmail", email);
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Delay sebentar untuk pengguna melihat toast
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={password}
            placeholder="Masukkan password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-600 text-sm font-semibold text-center">
              {error}
            </p>
          )}

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