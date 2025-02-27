import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../app/login/page";

describe("Login Page", () => {
  test("show logo", () => {
    render(<Login />);
    
    const logo: HTMLImageElement = screen.getByRole("img", { name: /klinik pintar/i });
    expect(logo).toBeInTheDocument();
  });

  test("show email and password input", () => {
    render(<Login />);
    
    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test("show login button", () => {
    render(<Login />);
    
    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("validate: can't login if email field is empty", () => {
    render(<Login />);

    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    expect(emailInput).toBeInvalid();
  });

  test("validate: can't login if password field is empty", () => {
    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(loginButton);

    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInvalid();
  });

  test("validate: can't login if email input is invalid", () => {
    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(emailInput).toBeInvalid();
  });

  test("call login function when the form is submitted", () => {
    jest.spyOn(console, "log").mockImplementation(() => {}); // Mock console.log

    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(console.log).toHaveBeenCalledWith("Email:", "user@example.com");
    expect(console.log).toHaveBeenCalledWith("Password:", "password123");

    (console.log as jest.Mock).mockRestore(); // Kembalikan fungsi asli console.log
  });
});
