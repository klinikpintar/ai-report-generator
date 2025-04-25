import React from "react";

interface UserFormProps {
  formData: {
    fullName: string;
    email: string;
    status: string;
    role: string;
  };
  errors: { [key: string]: string | undefined };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
}

const UserFormEdit: React.FC<UserFormProps> = ({
  formData,
  errors,
  handleChange,
  handleSubmit,
  handleCancel,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4 rounded-2xl">
      <div>
        <label className="block font-semibold mb-2" htmlFor="fullName">Nama Lengkap</label>
        <input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border rounded-md px-4 py-2 text-base"
        />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-2" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded-md px-4 py-2 text-base"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:space-x-6">
      <div className="w-full md:w-1/2 mb-4 md:mb-0">
        <p className="font-semibold mb-2">Status Akun</p>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="status"
              value="Aktif"
              checked={formData.status === "Aktif"}
              onChange={handleChange}
            />
            <span>Aktif</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="status"
              value="Nonaktif"
              checked={formData.status === "Nonaktif"}
              onChange={handleChange}
            />
            <span>Nonaktif</span>
          </label>
        </div>
        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
      </div>

      <div className="w-full md:w-1/2">
        <p className="font-semibold mb-2">Role</p>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="role"
              value="ADMIN"
              checked={formData.role === "ADMIN"}
              onChange={handleChange}
            />
            <span>Admin</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="role"
              value="BUSINESS_ANALYST"
              checked={formData.role === "BUSINESS_ANALYST"}
              onChange={handleChange}
            />
            <span>Business Analyst</span>
          </label>
        </div>
        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
      </div>
    </div>

      <div className="flex justify-center space-x-4 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="border-2 border-blue-400 text-blue-500 rounded-full px-6 py-2 font-semibold"
        >
          Batal
        </button>
        <button
          type="submit"
          className="bg-blue-400 text-white rounded-full px-6 py-2 font-semibold"
        >
          Simpan
        </button>
      </div>
    </form>

  );
};

export default UserFormEdit;
