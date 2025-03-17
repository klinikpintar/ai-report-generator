// modules/schema/sections/schema-table-section.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ServiceFilter,
  PlatformFilter,
  SchemaTable,
} from "@/modules/schema/module-elements";
import {
  fetchPlatforms,
  fetchSchemas,
  fetchServices,
} from "@/modules/schema/utils/api";
import { Platform, Schema, Service } from "@/modules/schema/types";
import { Button } from "@/components/ui/button";
import AddSchemaModal from "@/app/components/AddSchemaModal";
import { toast } from "react-toastify";

export const SchemaTableSection = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const searchParam = useSearchParams();
  const currentPage = parseInt(searchParam.get("page") || "1", 10);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [allSchemas, allServices, allPlatforms] = await Promise.all([
          fetchSchemas(),
          fetchServices(),
          fetchPlatforms(),
        ]);
        setSchemas(allSchemas);
        setServices(allServices);
        setPlatforms(allPlatforms);
      } catch {
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchFilteredSchemas = async () => {
      try {
        setLoading(true);
        const params = {
          serviceIds: selectedServices.map((service) => service.id),
          platformCodes: selectedPlatforms.map((platform) => platform.id),
        };
        const filteredSchemas = await fetchSchemas(params);
        setSchemas(filteredSchemas);
      } catch {
        toast.error("Failed to fetch filtered schemas");
      } finally {
        setLoading(false);
      }
    };

    if (services.length > 0 && platforms.length > 0) {
      fetchFilteredSchemas();
    }
  }, [selectedServices, selectedPlatforms, services, platforms]);

  return (
    <>
      <div className="flex justify-end gap-x-4">
        <ServiceFilter
          services={services}
          selectedServices={selectedServices}
          onSelectionChange={setSelectedServices}
        />
        <PlatformFilter
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onSelectionChange={setSelectedPlatforms}
        />
      </div>
      <SchemaTable
        schemas={schemas}
        currentPage={currentPage}
        lastPage={1}
        isLoading={isLoading}
      />

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowAddModal(true)}
          className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90"
        >
          Tambah Skema
        </Button>
      </div>

      {showAddModal && (
        <AddSchemaModal
          isVisible={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};
