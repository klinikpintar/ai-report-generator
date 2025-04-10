import { NextResponse } from "next/server";

export class ErrorResponse {
  message: string;
  status: number;

  constructor(message: string, status: number) {
    this.message = message;
    this.status = status;
  }

  generate() {
    return NextResponse.json(
      { message: this.message },
      { status: this.status }
    );
  }
}

export class NotFoundResponse extends ErrorResponse {
  constructor(message: Error | string = "Resource not found") {
    super(message?.toString() ?? "Resource not found", 404);
  }
}

export class InternalServerErrorResponse extends ErrorResponse {
  constructor(message: Error | string = "Internal Server Error") {
    super(message?.toString() ?? "Internal Server Error", 500);
  }
}

export class UnauthenticatedResponse extends ErrorResponse {
  constructor(message: Error | string = "Unauthenticated") {
    super(message?.toString() ?? "Unauthenticated", 401);
  }
}

export class UnauthorizedResponse extends ErrorResponse {
  constructor(message: Error | string = "Unauthorized") {
    super(message?.toString() ?? "Unauthorized", 403);
  }
}

export class BadRequestResponse extends ErrorResponse {
  constructor(message: Error | string = "Bad Request") {
    super(message?.toString() ?? "Bad Request", 400);
  }
}

export class ConflictResponse extends ErrorResponse {
  constructor(message: Error | string = "Conflict") {
    super(message?.toString() ?? "Conflict", 409);
  }
}
