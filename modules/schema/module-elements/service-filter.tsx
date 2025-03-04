"use client"

import { useState, useEffect } from "react"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import { dummyServices } from "../constant"
import type { Service } from "../types"

export const ServiceFilter = () => {
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  useEffect(() => {
    setServices(dummyServices)
  }, [])

  return (
    <div className="flex justify-end gap-2">
      <FilterDropdown<Service>
        items={services}
        buttonText="Filter by Services"
        displayProperty="name"
        onSelectionChange={setSelectedServices}
      />
    </div>
  )
}

