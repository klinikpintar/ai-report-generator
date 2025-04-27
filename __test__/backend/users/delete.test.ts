import { DELETE } from "@/app/(backend)/api/users/[id]/route";
import { Role } from "@prisma/client";

// 🛠️ Langsung mock prisma disini aja
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

// Karena kita mock manual, import prisma supaya bisa di-cast
import prisma from "@/lib/prisma";

type RequestParams = { params: { id: string } };

describe("DELETE /api/users/[id]", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ✅ Positive Case: berhasil menghapus user
  it("should delete user successfully with valid ID (positive case)", async () => {
    const fakeUser = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Doe",
      email: "john@example.com",
      role: Role.ADMIN,
      isActive: true,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue(fakeUser);

    const request = {} as Request;
    const params: RequestParams = { params: { id: fakeUser.id } };

    const response = await DELETE(request, params);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("User deleted successfully");
    expect(json.data).toEqual(fakeUser);
  });

  // ❌ Negative Case: format UUID invalid
  it("should return 400 when ID format is invalid (negative case)", async () => {
    const request = {} as Request;
    const params: RequestParams = { params: { id: "invalid-uuid" } };

    const response = await DELETE(request, params);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBe("Invalid user ID format");
  });

  // ❌ Negative Case: user tidak ditemukan
  it("should return 404 when user not found (negative case)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = {} as Request;
    const params: RequestParams = { params: { id: "550e8400-e29b-41d4-a716-446655440000" } };

    const response = await DELETE(request, params);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.message).toBe("User not found");
  });

  // 🧪 Corner Case: error saat delete
  it("should return 500 when deleteUser fails (corner case)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    (prisma.user.delete as jest.Mock).mockRejectedValue(new Error("Delete failed"));

    const request = {} as Request;
    const params: RequestParams = { params: { id: "550e8400-e29b-41d4-a716-446655440000" } };

    const response = await DELETE(request, params);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.message).toBe("Internal server error");
  });

  // 🧪 Corner Case: validation gagal, tidak call delete
  it("should not call deleteUser when validation fails (corner case)", async () => {
    const request = {} as Request;
    const params: RequestParams = { params: { id: "not-a-uuid" } };

    await DELETE(request, params);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
