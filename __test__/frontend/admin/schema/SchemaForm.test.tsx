import { render, screen, waitFor } from "@testing-library/react";
import SchemaForm from "@frontend/admin/schema/components/SchemaForm";

describe("SchemaForm", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Should fetches and sets services correctly", async () => {
    const mockServices = [
      { id: "1", name: "Service A", platformCode: "A1" },
      { id: "2", name: "Service B", platformCode: "B2" },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockServices),
      } as Response)
    ) as jest.Mock;

    render(
      <SchemaForm
        showFileInput={false}
        fileInputRef={{ current: null }}
        formData={{
          name: "",
          description: "",
          schemaText: "",
          serviceId: "",
        }}
        handleSubmit={jest.fn()}
        handleChange={jest.fn()}
        handleFileChange={jest.fn()}
        onClose={jest.fn()}
        clearForm={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Service A")).toBeInTheDocument();
      expect(screen.getByText("Service B")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/service");
  });

  it("Should handles fetch error gracefully", async () => {
    global.fetch = jest.fn(() => Promise.reject("API Error")) as jest.Mock;

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(
      <SchemaForm
        showFileInput={false}
        fileInputRef={{ current: null }}
        formData={{
          name: "",
          description: "",
          schemaText: "",
          serviceId: "",
        }}
        handleSubmit={jest.fn()}
        handleChange={jest.fn()}
        handleFileChange={jest.fn()}
        onClose={jest.fn()}
        clearForm={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch services:",
        "API Error"
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
