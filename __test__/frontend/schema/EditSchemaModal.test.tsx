import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditSchemaModal from "@/app/components/EditSchemaModal";
import Schema from "@/app/schema/page";
import mockAxios from "axios";

jest.mock("axios");

describe("Edit Schema Modal Test", () => {
  const mockSchemas = [
    {
      id: 1,
      name: "users-2",
      description: "auth-2 purpose",
      schemaText:
        "CREATE TABLE users_2 (id SERIAL PRIMARY KEY, username TEXT, password TEXT);",
      createdAt: "2025-03-03T06:08:42.673Z",
    },
    {
      id: 2,
      name: "users-3",
      description: "auth-3 purpose",
      schemaText:
        "CREATE TABLE users_3 (id SERIAL PRIMARY KEY, username TEXT, password TEXT);",
      createdAt: "2025-03-03T06:08:42.673Z",
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
    render(<Schema />);

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
    render(<Schema />);

    expect(await screen.findByText("users-2")).toBeInTheDocument();
    expect(await screen.findByText("auth-2 purpose")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "Edit" }).length).toBe(2);
  });

  it("Should displays the correct data when the Edit button is clicked", async () => {
    render(<Schema />);

    await screen.findByText("users-2");
    const editButtons = await screen.findAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("Edit Skema Database")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("users-2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("auth-2 purpose")).toBeInTheDocument();
  });
});
