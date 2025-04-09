import React, { useState, useEffect } from "react";
import Modal from "@frontend/components/Modal";
import { CircleMinus } from "lucide-react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

interface Service {
  id: string;
  name: string;
  db: string;
}

const CreateServiceModal = ({ isVisible, onClose }: Props) => {
  const platforms = ["PostgreSQL", "MySQL", "MongoDB"];
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({ name: "", platform: "" });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/service");
        const data = await response.json();
        setServices(
          data.map((item: any) => ({
            id: item.id,
            name: item.name,
            db: item.platformCode,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/service", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setServices(services.filter((service) => service.id !== id));
      } else {
        console.error("Failed to delete service:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = services.some(
      (service) => service.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Service with the same name already exists!");
      return;
    }

    try {
      const response = await fetch("/api/service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uuidv4(),
          name: formData.name,
          platformCode: formData.platform,
        }),
      });

      if (response.ok) {
        const newService = await response.json();

        setServices([
          ...services,
          {
            id: newService.id,
            name: newService.name,
            db: newService.platformCode,
          },
        ]);
        setFormData({ name: "", platform: "" });
        onClose();
      } else {
        console.error("Failed to submit service:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting service:", error);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      isForm={true}
      title="Daftar Service Klinik Pintar"
      subtitle="Berikut adalah service yang sudah terdaftar di sistem AI Report Generator:"
    >
      <div className="px-10 pt-10">
        <ul className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
          {services.map((item) => (
            <li
              key={item.id}
              className="flex items-center py-2 px-4 gap-4 hover:bg-gray-100"
            >
              <span className="text-gray-700 flex-1">{item.name}</span>
              <span className="text-gray-700 min-w-[100px] text-right">
                {item.db}
              </span>
              <button
                data-testid="delete-service-button"
                className="text-red-500 hover:text-red-700 ml-auto flex items-center justify-center w-10"
                onClick={() => handleDelete(item.id)}
              >
                <CircleMinus size={30} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form className="px-10 pb-10 pt-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 mb-4 grid-cols-2">
          <div className="col-span-2">
            <label
              htmlFor="name"
              className="block mb-2 text-[14.74px] font-semibold text-gray-900"
            >
              Masukkan Nama Service
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-white border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="Masukkan nama service"
              required
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="platform"
              className="block mb-2 text-[14.74px] font-semibold text-gray-900"
            >
              Platform Service
            </label>
            <select
              id="platform"
              name="platform"
              data-testid="platform-select"
              value={formData.platform}
              onChange={handleChange}
              className="bg-[#00B0EB] text-white text-[16.44px] font-bold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
              required
            >
              <option
                value=""
                className="bg-white text-[16.44px] font-bold"
                disabled
              >
                Pilih Platform
              </option>
              {platforms.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
                >
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-center items-center pt-5">
          <button
            type="button"
            className="flex-1 text-[#00B0EB] text-[18px] font-bold inline-flex items-center mr-2 ml-5 bg-white hover:text-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
            onClick={() => {
              onClose();
              setFormData({ name: "", platform: "" });
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 text-white text-[18px] font-bold inline-flex items-center mr-5 ml-2 bg-[#00B0EB] hover:bg-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
          >
            Tambah
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateServiceModal;
