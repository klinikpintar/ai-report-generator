// modules/schema/sections/schema-table-section.tsx
"use client";

import { useState, useEffect } from "react";
import { ServiceFilter, PlatformFilter, SchemaTable } from "@/modules/schema/module-elements";
import { fetchPlatforms, fetchSchemas, fetchServices } from "@/modules/schema/utils/api";
import { Platform, Schema, Service } from "@/modules/schema/types";

export const SchemaTableSection = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [allSchemas, allServices, allPlatforms] = await Promise.all([
          fetchSchemas(),
          fetchServices(),
          fetchPlatforms(),
        ]);
        setSchemas(allSchemas);
        setServices(allServices);
        setPlatforms(allPlatforms);
      } catch {
        setError("Failed to load initial data");
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
        setError("Failed to fetch filtered schemas");
      } finally {
        setLoading(false);
      }
    };

    if (services.length > 0 && platforms.length > 0) {
      fetchFilteredSchemas();
    }
  }, [selectedServices, selectedPlatforms, services, platforms]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
      <SchemaTable schemas={schemas} currentPage={1} lastPage={10} />
    </>
  );
};
