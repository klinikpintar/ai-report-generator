import React, { useState } from "react";
import FormInput from "@frontend/components/form-input";
import ButtonSubmit from "@frontend/components/button-submit";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface UserFormProps {
    formData: {
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
        role: string;
    };
    errors: {
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        role?: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
    formData,
    errors,
    handleChange,
    handleSubmit,
    handleCancel,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className="max-h-[60vh] overflow-y-auto">
            <form className="md:pr-10 pl-10 pb-10 pt-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <FormInput
                        label="Nama Lengkap"
                        name="fullName"
                        value={formData.fullName}
                        placeholder="Masukkan nama lengkap"
                        required
                        onChange={handleChange}
                        error={errors.fullName}
                    />
                    
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        placeholder="Masukkan email"
                        required
                        onChange={handleChange}
                        error={errors.email}
                    />
                    
                    <div className="relative">
                        <FormInput
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            placeholder="Masukkan password"
                            required
                            onChange={handleChange}
                            error={errors.password}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={toggleShowPassword}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="w-8 h-6" />
                            ) : (
                                <EyeIcon className="w-8 h-6" />
                            )}
                        </button>
                    </div>
                    
                    <div className="relative">
                        <FormInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            placeholder="Konfirmasi password"
                            required
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={toggleShowConfirmPassword}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon className="w-8 h-6" />
                            ) : (
                                <EyeIcon className="w-8 h-6" />
                            )}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <fieldset>
                            <legend className="text-[14.74px] font-semibold text-gray-900 float-left pr-16">
                                Role
                            </legend>
                            <div className="flex gap-6 pl-16">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ADMIN"
                                        checked={formData.role === "ADMIN"}
                                        onChange={handleChange}
                                        className="mr-2"
                                        aria-label="Admin"
                                    /> Admin
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="BUSINESS_ANALYST"
                                        checked={formData.role === "BUSINESS_ANALYST"}
                                        onChange={handleChange}
                                        className="mr-2"
                                        aria-label="Business Analyst"
                                    /> Business Analyst
                                </label>
                            </div>
                        </fieldset>
                        {errors.role && (
                            <p className="text-sm text-red-500" role="alert">{errors.role}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <ButtonSubmit
                        variant="secondary"
                        type="button"
                        onClick={handleCancel}
                    >
                        Batal
                    </ButtonSubmit>
                    <ButtonSubmit type="submit">
                        Simpan
                    </ButtonSubmit>
                </div>
            </form>
        </div>
    );
};

export default UserForm;