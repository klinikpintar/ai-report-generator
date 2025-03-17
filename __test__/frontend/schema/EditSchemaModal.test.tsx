import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditSchemaModal from "@/app/components/EditSchemaModal";
import { SchemaTable } from "@/modules/schema/module-elements";
import mockAxios from "axios";

jest.mock("axios");

describe("Edit Schema Modal Test", () => {
  const mockSchemas = [
    {
      id: 1,
      name: "Schema A",
      description: "Schema A description",
      schemaText: "Schema A text",
      createdAt: new Date(),
      modifiedAt: new Date(),
      service: {
        id: 1,
        name: "Service A",
        createdAt: new Date(),
        modifiedAt: new Date(),
        platform: {
          id: 1,
          name: "Platform A",
          img_url: "https://via.placeholder.com/150",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      },
    },
    {
      id: 2,
      name: "Schema B",
      description: "Schema B description",
      schemaText: "Schema B text",
      createdAt: new Date(),
      modifiedAt: new Date(),
      service: {
        id: 2,
        name: "Service B",
        createdAt: new Date(),
        modifiedAt: new Date(),
        platform: {
          id: 2,
          name: "Platform B",
          img_url: "https://via.placeholder.com/150",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      },
    },
  ];

  beforeAll(() => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: mockSchemas });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should not appear when first rendered", () => {
    render(<EditSchemaModal isVisible={false} onClose={() => {}} />);

    expect(screen.getByText("Edit Skema Database")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("Should appear when user click 'Edit'", async () => {
    render(<SchemaTable schemas={mockSchemas} />);

    const editButton = await screen.findAllByRole("button", { name: "Edit" });
    fireEvent.click(editButton[0]);

    expect(screen.getByText("Edit Skema Database")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<EditSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("Should be a edit button for each entry", async () => {
    render(<SchemaTable schemas={mockSchemas} />);

    expect(await screen.findByText("Schema A")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "Edit" }).length).toBe(2);
  });

  it("Should displays the correct data when the Edit button is clicked", async () => {
    render(<SchemaTable schemas={mockSchemas} />);

    await screen.findByText("Schema A");
    const editButtons = await screen.findAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("Edit Skema Database")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Schema A")).toBeInTheDocument();
  });
});
