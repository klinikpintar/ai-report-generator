import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditSchemaModal from "@frontend/admin/schema/components/EditSchemaModal";
import mockAxios from "axios";

jest.mock("axios");

describe("Edit Schema Modal Test", () => {
  const mockSchemas = [
    {
      id: 1,
      name: "users-2",
      description: "auth-2 purpose",
      schemaText: "CREATE TABLE users_2 (id SERIAL PRIMARY KEY, username TEXT, password TEXT);",
      createdAt: "2025-03-03T06:08:42.673Z",
    },
    {
      id: 2,
      name: "users-3",
      description: "auth-3 purpose",
      schemaText: "CREATE TABLE users_3 (id SERIAL PRIMARY KEY, username TEXT, password TEXT);",
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

    expect(screen.queryByText(/Edit Skema Database/i)).not.toBeInTheDocument()
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<EditSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
