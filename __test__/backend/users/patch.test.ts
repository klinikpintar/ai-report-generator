import { PATCH } from "@/app/(backend)/api/users/[id]/route";
import prisma from "@/lib/prisma";

// 🛠️ Mock prisma client saja, usersService tetap real
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

type Params = { params: Promise<{ id: string }> };

// 🛠️ UUID valid untuk testing
const validUserId = "550e8400-e29b-41d4-a716-446655440000";

describe("PATCH /api/users/[id] route (full flow including usersService)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Positive Case: User updated successfully
  it("should update user successfully with valid data (positive case)", async () => {
    const mockExistingUser = {
      id: validUserId,
      name: "Old Name",
      email: "old@example.com",
      role: "ADMIN",
      isActive: true,
    };

    const mockUpdatedUser = {
      ...mockExistingUser,
      name: "Updated Name",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const body = {
      name: "Updated Name",
    };

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    const params: Params = { params: Promise.resolve({ id: validUserId }) };

    const response = await PATCH(request, params);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("User updated successfully");
    expect(json.data.name).toBe("Updated Name");
  });

  // ❌ Negative Case: Validation fails (invalid email format)
  it("should return 400 when validation fails (negative case)", async () => {
    const invalidBody = {
      email: "invalid-email", // Not an email
    };

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify(invalidBody),
    });

    const params: Params = { params: Promise.resolve({ id: validUserId }) };

    const response = await PATCH(request, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ Negative Case: User not found
  it("should return 404 when user not found (negative case)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // simulate user not found

    const validBody = {
      name: "Should Fail",
    };

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify(validBody),
    });

    const params: Params = { params: Promise.resolve({ id: validUserId }) };

    const response = await PATCH(request, params);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.message).toBe("User not found");
  });

  // Corner Case: No data provided to update
  it("should return 400 if no data provided to update (Corner Case)", async () => {
    const mockExistingUser = {
      id: validUserId,
      name: "Old Name",
      email: "old@example.com",
      role: "ADMIN",
      isActive: true,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

    const emptyBody = {}; // ⚡ Ini empty object

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify(emptyBody),
    });

    const params: Params = { params: Promise.resolve({ id: validUserId }) };

    const response = await PATCH(request, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toBe("No data provided for update");
  });

  // 🧪 Corner Case: Internal Server Error (unexpected error)
  it("should return 500 when unexpected error occurs (corner case)", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure")
    );

    const validBody = {
      name: "Another Test",
    };

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify(validBody),
    });

    const params: Params = { params: Promise.resolve({ id: validUserId }) };

    const response = await PATCH(request, params);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.message).toBe("Internal server error");
  });
});
