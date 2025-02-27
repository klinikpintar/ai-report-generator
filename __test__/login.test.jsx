import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../app/login/page";

describe("Login Page", () => {
  test("show logo", () => {
    render(<Login />);
    
    const logo = screen.getByRole("img", { name: /klinik pintar/i });
    expect(logo).toBeInTheDocument();
  });

  test("show email and password input", () => {
    render(<Login />);
    
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("show login button", () => {
    render(<Login />);
    
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("validate: can't login if emaild field is empty ", () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInvalid();
  });

  test("validate: can't login if password field is empty ", () => {
    render(<Login />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByLabelText(/password/i)).toBeInvalid();
  });

  test("validate: can't login if email input is invalid", () => {
    render(<Login />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), { target: { value: "invalid-email" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInvalid();
  });


  test("call login function when the form is submitted", () => {
    console.log = jest.fn(); // Tangkap log untuk mengecek submit berhasil

    render(<Login />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(console.log).toHaveBeenCalledWith("Email:", "user@example.com");
    expect(console.log).toHaveBeenCalledWith("Password:", "password123");
  });
});
