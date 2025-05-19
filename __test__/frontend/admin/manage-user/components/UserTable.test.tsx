import { UserTable } from "@frontend/admin/manage-user/components/UserTable";
import { render, screen } from "@testing-library/react";
import { adminUser, businessAnalystUser } from "@/__mocks__/user-data";
import { ToastContainer } from "react-toastify";
import userEvent from "@testing-library/user-event";

// Mock the data
const mockUsers = [adminUser, businessAnalystUser];

// Mock all hooks
jest.mock("@frontend/admin/manage-user/hooks/useFetchUser", () => ({
  useFetchUser: () => ({
    refreshUsers: jest.fn(),
  }),
}));

jest.mock("@frontend/admin/manage-user/hooks/useUserTablePagination", () => ({
  useUserTablePagination: () => ({
    handlePageChange: jest.fn(),
  }),
}));

// Mock the context directly - this is the key for performance
jest.mock("@frontend/admin/manage-user/context/UserTableContext", () => ({
  useUserTableContext: () => ({
    state: {
      data: mockUsers,
      isLoading: false,
      error: null,
      pagination: {
        currentPage: 1,
        lastPage: 2,
        totalItems: mockUsers.length,
      },
      filters: {
        role: {
          selected: [],
        },
      },
    },
    dispatch: jest.fn(),
  }),
  UserTableProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock API
jest.mock("@frontend/admin/manage-user/utils/api", () => ({
  fetchUsers: jest.fn(() => Promise.resolve({ data: mockUsers, pagination: { total_pages: 1 } })),
}));

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock the generic table components to reduce rendering complexity
jest.mock("@frontend/components/table", () => ({
  GenericTable: ({ columns, data }: { columns: Array<{ key: string; header: string; renderCell?: (item: any) => React.ReactNode }>; data: Array<any> }) => (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((col) => (
              <td key={`${item.id}-${col.key}`}>
                {col.renderCell ? col.renderCell(item) : item[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  GenericTableColumn: () => null,
  TablePagination: () => (
    <div>
      <button>Sebelumnya</button>
      <a href="#" aria-current="page">1</a>
      <button>Selanjutnya</button>
    </div>
  ),
}));

describe("UserTable", () => {
  const onEditUser = jest.fn();
  const onDeleteUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders table with correct headers and data", async () => {
    render(
      <>
        <ToastContainer />
        <UserTable onEditUser={onEditUser} onDeleteUser={onDeleteUser} />
      </>
    );

    // Check that all headers are present
    expect(screen.getByText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Aksi")).toBeInTheDocument();

    // Check user data
    expect(screen.getByText(adminUser.name)).toBeInTheDocument();
    expect(screen.getByText(adminUser.email)).toBeInTheDocument();
    expect(screen.getByText(businessAnalystUser.name)).toBeInTheDocument();
    expect(screen.getByText(businessAnalystUser.email)).toBeInTheDocument();
    
    // Check role display
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Business Analyst")).toBeInTheDocument();
    
    // Check status
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByText("Nonaktif")).toBeInTheDocument();
    
    // Check action buttons
    const editButtons = screen.getAllByRole("button", { name: /Edit/i });
    expect(editButtons).toHaveLength(2);
    
    const deleteButtons = screen.getAllByRole("button", { name: /Hapus/i });
    expect(deleteButtons).toHaveLength(2);
  });

  test("calls onEditUser when edit button is clicked", async () => {
    render(
      <>
        <ToastContainer />
        <UserTable onEditUser={onEditUser} onDeleteUser={onDeleteUser} />
      </>
    );
    
    const user = userEvent.setup();
    const editButtons = screen.getAllByRole("button", { name: /Edit/i });
    
    await user.click(editButtons[0]);
    expect(onEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test("calls onDeleteUser when delete button is clicked", async () => {
    render(
      <>
        <ToastContainer />
        <UserTable onEditUser={onEditUser} onDeleteUser={onDeleteUser} />
      </>
    );
    
    const user = userEvent.setup();
    const deleteButtons = screen.getAllByRole("button", { name: /Hapus/i });
    
    await user.click(deleteButtons[0]);
    expect(onDeleteUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test("displays error message when there is an error", async () => {
    // Override the mock to return an error state
    jest.spyOn(require("@frontend/admin/manage-user/context/UserTableContext"), "useUserTableContext")
      .mockReturnValueOnce({
        state: {
          data: [],
          isLoading: false,
          error: "Gagal memuat data pengguna",
          pagination: { currentPage: 1, lastPage: 1, totalItems: 0 },
          filters: { role: { selected: [] } },
        },
        dispatch: jest.fn(),
      });

    render(
      <>
        <ToastContainer />
        <UserTable onEditUser={onEditUser} onDeleteUser={onDeleteUser} />
      </>
    );
    
    expect(screen.getByText("Gagal memuat data pengguna")).toBeInTheDocument();
  });
});