"use client"

import { useState, useEffect } from "react"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import type { Platform } from "../types"
import { dummyPlatforms } from "../constant"


export const PlatformFilter = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])

  useEffect(() => {
    setPlatforms(dummyPlatforms)
  }, [])

  return (
    <div className="flex justify-end">
      <FilterDropdown<Platform>
        items={platforms}
        buttonText="Filter by Platforms"
        displayProperty="name"
        onSelectionChange={setSelectedPlatforms}
      />
    </div>
  )
}

