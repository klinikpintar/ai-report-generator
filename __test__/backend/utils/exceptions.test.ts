import { NextResponse } from "next/server";
import {
  ErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  UnauthenticatedResponse,
  UnauthorizedResponse,
  BadRequestResponse,
  ConflictResponse,
} from "@backend/utils/exceptions";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe("Exception Responses", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("✅ ErrorResponse should generate JSON response", () => {
    const error = new ErrorResponse("Something went wrong", 500);
    error.generate();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Something went wrong" },
      { status: 500 }
    );
  });

  test("✅ NotFoundResponse should return 404", () => {
    const response = new NotFoundResponse();
    response.generate();

    expect(response.message).toBe("Resource not found");
    expect(response.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Resource not found" },
      { status: 404 }
    );
  });

  test("✅ InternalServerErrorResponse should return 500", () => {
    const response = new InternalServerErrorResponse();
    response.generate();

    expect(response.message).toBe("Internal Server Error");
    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  });

  test("✅ UnauthenticatedResponse should return 401", () => {
    const response = new UnauthenticatedResponse();
    response.generate();

    expect(response.message).toBe("Unauthenticated");
    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Unauthenticated" },
      { status: 401 }
    );
  });

  test("✅ UnauthorizedResponse should return 403", () => {
    const response = new UnauthorizedResponse();
    response.generate();

    expect(response.message).toBe("Unauthorized");
    expect(response.status).toBe(403);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Unauthorized" },
      { status: 403 }
    );
  });

  test("✅ BadRequestResponse should return 400", () => {
    const response = new BadRequestResponse();
    response.generate();

    expect(response.message).toBe("Bad Request");
    expect(response.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Bad Request" },
      { status: 400 }
    );
  });

  test("✅ ConflictResponse should return 409", () => {
    const response = new ConflictResponse();
    response.generate();

    expect(response.message).toBe("Conflict");
    expect(response.status).toBe(409);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Conflict" },
      { status: 409 }
    );
  });

  test("✅ Should allow custom error messages", () => {
    const response = new BadRequestResponse("Invalid data format");
    response.generate();

    expect(response.message).toBe("Invalid data format");
    expect(response.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Invalid data format" },
      { status: 400 }
    );
  });
  
});
