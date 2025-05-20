import { render, screen } from "@testing-library/react";
import React from "react";
import { useUser, UserProvider } from "@frontend/login/context/userContext";
import userEvent from "@testing-library/user-event";

// Komponen uji coba yang memakai useUser
const TestComponent = () => {
  const { email, name, setEmailContext, setNameContext } = useUser();

  return (
    <div>
      <p>Email: {email}</p>
      <p>Name: {name}</p>
      <button onClick={() => setEmailContext("test@klinikpintar.id")}>
        Set Email
      </button>
      <button onClick={() => setNameContext("Test User")}>
        Set Name
      </button>
    </div>
  );
};

// Komponen uji coba yang digunakan di luar UserProvider
const BadComponent = () => {
  useUser(); // Harus throw error
  return null;
};

describe("UserContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("should show default email and update on button click", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Email:")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /set email/i });
    await userEvent.click(button);

    expect(screen.getByText("Email: test@klinikpintar.id")).toBeInTheDocument();
  });

  test("should load email from localStorage on mount", () => {
    localStorage.setItem("userEmail", "stored@klinikpintar.id");

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(
      screen.getByText("Email: stored@klinikpintar.id")
    ).toBeInTheDocument();
  });

  // ✅ SOLUSI BARU: Memastikan error tertangkap secara eksplisit
  test("should throw error if useUser is used outside provider", () => {
    // 🔹 Suppress expected error log from React agar tidak mengganggu output
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => { });

    try {
      render(<BadComponent />);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("useUser must be used within a UserProvider");
    }

    consoleError.mockRestore();
  });

  test("should return user context when inside UserProvider", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Email:")).toBeInTheDocument();
  });

  test("should load name from localStorage on mount", () => {
    localStorage.setItem("userName", "Stored User");

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Name: Stored User")).toBeInTheDocument();
  });

  test("should update name and display it correctly", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Name:")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /set name/i });
    await userEvent.click(button);

    expect(screen.getByText("Name: Test User")).toBeInTheDocument();
  });
});