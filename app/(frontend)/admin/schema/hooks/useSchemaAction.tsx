"use client"

import { useCallback } from "react"
import { deleteSchema } from "@frontend/admin/schema/utils/api"
import { toast } from "react-toastify"
import { useSchemaTable } from "@frontend/admin/schema/hooks/useSchemaTable"

export const useSchemaActions = () => {
  const { refreshSchemas } = useSchemaTable()

  const handleDeleteSchema = useCallback(
    async (schemaId: number) => {
      try {
        const response = await deleteSchema(schemaId)
        if (response.ok) {
          toast.success("Skema berhasil dihapus")
          await refreshSchemas()
          return true
        } else {
          throw new Error("Failed to delete schema")
        }
      } catch {
        toast.error("Gagal menghapus skema")
        return false
      }
    },
    [refreshSchemas],
  )

  return {
    handleDeleteSchema,
  }
}

