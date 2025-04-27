import { PATCH } from "@/app/(backend)/api/users/[id]/route";
import usersService from "@/app/(backend)/services/usersService";
import { NotFoundResponse } from "@/app/(backend)/utils/exceptions";

// 🛠️ Mock usersService
jest.mock("@/app/(backend)/services/usersService", () => ({
  __esModule: true,
  default: {
    updateUser: jest.fn(),
  },
}));

type Params = { params: Promise<{ id: string }> };

// 🛠️ UUID valid untuk testing
const validUserId = "550e8400-e29b-41d4-a716-446655440000";

describe("PATCH /api/users/[id]", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Positive Case: User updated successfully
  it("should update user successfully with valid data (positive case)", async () => {
    const fakeUpdatedUser = {
      id: validUserId,
      name: "Updated Name",
      email: "updated@example.com",
      role: "ADMIN",
      isActive: true,
    };

    (usersService.updateUser as jest.Mock).mockResolvedValue(fakeUpdatedUser);

    const body = {
      name: "Updated Name",
      email: "updated@example.com",
      role: "ADMIN",
      isActive: true,
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
    expect(json.data).toEqual(fakeUpdatedUser);
  });

  // ❌ Negative Case: Validation fails (invalid email format)
  it("should return 400 when validation fails (negative case)", async () => {
    const invalidBody = {
      email: "not-an-email", // ❌ invalid email
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
    (usersService.updateUser as jest.Mock).mockRejectedValue(
      new NotFoundResponse("User not found")
    );

    const validBody = {
      name: "New Name",
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

  // 🧪 Corner Case: Internal Server Error (unexpected error)
  it("should return 500 when unexpected error occurs (corner case)", async () => {
    (usersService.updateUser as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure")
    );

    const validBody = {
      name: "Another Name",
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
