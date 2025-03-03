import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { SchemaTable } from "@/app/admin/sections/SchemaSection/elements";



describe("Schema Table", () => {
  beforeEach(() => {
    render(<SchemaTable />)
  })

  describe("Table Headers", () => {
    it("should render all table headers", () => {
      const headers = ["Nama Skema", "Platform", "Service", "File", "Aksi"]

      headers.forEach((header) => {
        const headerElement = screen.getByRole("columnheader", { name: header })
        expect(headerElement).toBeInTheDocument()
      })
    })
  })
})

