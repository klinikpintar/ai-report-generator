import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { SchemaTable } from "@/modules/schema/module-elements";
import { dummySchemas } from "@/modules/schema/constant";


describe("Schema Table", () => {
  beforeEach(() => {
    render(<SchemaTable schemas={dummySchemas} />)
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

