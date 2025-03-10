"use client";

import { useState } from "react";
import Image from "next/image";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div className = "flex items-center justify-center min-h-screen">
            {/* Logo */}
            <div className="absolute top-[38px] left-[104px] h-auto">
                <Image src="/images/logo.png" alt="Klinik Pintar" width={175} height={52} />
            </div>
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-lg bg-white p-8">
                    {/* Judul */}
                    <h2 className="text-2xl font-bold text-center text-blue-600 text-4xl">Sign in to your account</h2>
                    <p className="mt-4 text-center text-black text-lg">
                        Selamat Datang di AI Report Generator by
                    </p>
                    <p className="text-center text-black text-lg mb-4">
                        Klinik Pintar
                    </p>


                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-black font-semibold">Email</label>
                            <input
                                id = "email"
                                type="email"
                                className="w-full p-2 border-2 border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-black font-semibold">Password</label>
                            <input
                                id = "password"
                                type="password"
                                className="w-full p-2 border-2 border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 font-semibold text-lg bg-blue-600 text-white py-3 px-6 rounded-50px"
                        >
                            Login
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;