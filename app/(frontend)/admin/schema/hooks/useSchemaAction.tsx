"use client"

import { useCallback } from "react"
import { deleteSchema } from "@frontend/admin/schema/utils/api"
import { toast } from "react-toastify"
import { useRefreshSchema } from "@frontend/admin/schema/hooks/useRefreshSchema"

export const useSchemaActions = () => {
  const { refreshSchemas } = useRefreshSchema()

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

