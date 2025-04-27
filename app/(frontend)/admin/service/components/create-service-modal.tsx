import React, { useState, useEffect } from "react";
import Modal from "@frontend/components/Modal";
import { CircleMinus } from "lucide-react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { ConfirmationDialog } from "@frontend/admin/schema/components/confirmation-dialog";
import FormInput from "@frontend/components/form-input";
import SelectInput from "@frontend/components/select-input";
import ButtonSubmit from "@frontend/components/button-submit";
import { eventBus, EVENTS } from "@frontend/common/utils/event-bus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

interface Service {
  id: string;
  name: string;
  platformCode: string;
}

const CreateServiceModal = ({ isVisible, onClose }: Props) => {
  const platforms = ["PostgreSQL", "MySQL", "MongoDB"];
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({ name: "", platform: "" });
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const openDeleteConfirmation = (id: string) => {
    setServiceToDelete(id);
    setShowConfirmationDialog(true);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/service");
        const data: Service[] = await response.json();
        setServices(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            platformCode: item.platformCode,
          }))
        );
      } catch (error) {
        toast.error(`Failed to fetch services: ${error}`);
      }
    };

    fetchServices();
  }, []);

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await fetch("/api/service", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: serviceToDelete }),
      });

      if (response.ok) {
        setServices(
          services.filter((service) => service.id !== serviceToDelete)
        );
        eventBus.publish(EVENTS.SERVICE_UPDATED); // Notify other components
        toast.success("Service successfully deleted");
      } else {
        toast.error(`Failed to delete service: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Error deleting service: ${error}`);
    } finally {
      setShowConfirmationDialog(false);
      setServiceToDelete(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
            platformCode: newService.platformCode,
          },
        ]);
        toast.success("Service successfully added");
        setFormData({ name: "", platform: "" });
        onClose();
        eventBus.publish(EVENTS.SERVICE_UPDATED); // Notify other components
      } else {
        toast.error(`Failed to submit service: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Error submitting service: ${error}`);
    }
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onClose={onClose}
        isForm={true}
        title="Daftar Service Klinik Pintar"
        subtitle="Berikut adalah service yang sudah terdaftar di sistem AI Report Generator:"
      >
        <div className="px-10 pt-10">
          <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
            {services.length > 0 ? (
              <ul>
                {services.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center py-2 px-4 gap-4 hover:bg-gray-100"
                  >
                    <span className="text-gray-700 flex-1">{item.name}</span>
                    <span className="text-gray-700 min-w-[100px] text-right">
                      {item.platformCode}
                    </span>
                    <button
                      data-testid="delete-service-button"
                      className="text-red-500 hover:text-red-700 ml-auto flex items-center justify-center w-10"
                      onClick={() => openDeleteConfirmation(item.id)}
                    >
                      <CircleMinus size={30} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 px-4 text-gray-500 text-center">
                Tidak ada service ditemukan
              </div>
            )}
          </div>
        </div>
        <form className="px-10 pb-10 pt-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4 grid-cols-2">
            <FormInput
              label="Nama Service"
              name="name"
              value={formData.name}
              placeholder="Masukkan nama service"
              required
              onChange={handleChange}
            />
            <div className="col-span-2">
              <SelectInput
                label="Platform Service"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                options={platforms.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </div>
          </div>
          <div className="flex justify-center items-center pt-5">
            <ButtonSubmit
              variant="secondary"
              className="mr-2 ml-5"
              onClick={(event) => {
                event.preventDefault(); // Mencegah validasi form
                onClose();
                setFormData({ name: "", platform: "" });
              }}
            >
              Batal
            </ButtonSubmit>

            <ButtonSubmit type="submit" className="mr-5 ml-2">
              Tambah
            </ButtonSubmit>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => {
          setShowConfirmationDialog(false);
          setServiceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Service"
        description="Apakah Anda yakin ingin menghapus service ini?"
      />
    </>
  );
};

export default CreateServiceModal;
