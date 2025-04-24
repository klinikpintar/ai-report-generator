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
    <form onSubmit={handleSubmit}>
      <label>
        Nama Lengkap
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
      </label>
      {errors.fullName && <p>{errors.fullName}</p>}

      <label>
        Email
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      {errors.email && <p>{errors.email}</p>}

      <label>
        <input
          type="radio"
          name="status"
          value="Aktif"
          checked={formData.status === "Aktif"}
          onChange={handleChange}
        />
        Aktif
      </label>
      <label>
        <input
          type="radio"
          name="status"
          value="Nonaktif"
          checked={formData.status === "Nonaktif"}
          onChange={handleChange}
        />
        Nonaktif
      </label>
      {errors.status && <p>{errors.status}</p>}

      <label>
        <input
          type="radio"
          name="role"
          value="ADMIN"
          checked={formData.role === "ADMIN"}
          onChange={handleChange}
        />
        Admin
      </label>
      <label>
        <input
          type="radio"
          name="role"
          value="BUSINESS_ANALYST"
          checked={formData.role === "BUSINESS_ANALYST"}
          onChange={handleChange}
        />
        Business Analyst
      </label>
      {errors.role && <p>{errors.role}</p>}

      <button type="submit">Simpan</button>
      <button type="button" onClick={handleCancel}>Batal</button>
    </form>
  );
};

export default UserFormEdit;
