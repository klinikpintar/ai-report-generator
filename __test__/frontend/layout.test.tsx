import React from "react";
import { render, screen } from "@testing-library/react";
import RootLayout  from "@frontend/layout";
import "@testing-library/jest-dom";

// Mock Toastify karena style & animasinya tidak penting untuk test
jest.mock("react-toastify", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock Google font Inter
jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "mock-inter-font",
    variable: "--mock-inter",
  }),
}));

// Mock UserProvider agar children tetap bisa dirender
jest.mock("@frontend/login/context/userContext", () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("should render layout with children and required providers", () => {
    render(
      <RootLayout>
        <main data-testid="main-content">Hello World</main>
      </RootLayout>
    );

    // ✅ Cek children dirender
    expect(screen.getByTestId("main-content")).toBeInTheDocument();

    // ✅ Cek ToastContainer muncul
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();

    // ✅ Cek UserProvider membungkus children
    expect(screen.getByTestId("user-provider")).toBeInTheDocument();
  });
});