import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "../../app/login/page";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axios);

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("Login Page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    mockAxios.reset();
    jest.restoreAllMocks();
  });

  //positive cases
  test("show logo", () => {
    render(<Login />);

    const logo: HTMLImageElement = screen.getByRole("img", {
      name: /klinik pintar/i,
    });
    expect(logo).toBeInTheDocument();
  });

  test("show email and password input", () => {
    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", {
      name: /email/i,
    });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test("show login button", () => {
    render(<Login />);

    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: /login/i,
    });
    expect(loginButton).toBeInTheDocument();
  });

  test("should submit form successfully and redirect when login is successful", async () => {
    // Mock localStorage
    const setItemMock = jest.spyOn(Storage.prototype, "setItem");
  
    render(<Login />);
  
    // Mock API success
    mockAxios.onPost("/api/auth/login").reply(200, { data: { access_token: "test-token" } });
  
    // Simulate user input
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });
  
    // Wait for the API call to complete and check localStorage
    await waitFor(() => {
      expect(setItemMock).toHaveBeenCalledWith("access_token", "test-token");
    });
  
    // Verify router.push() was called to redirect
    expect(pushMock).toHaveBeenCalledWith("/"); // Expecting redirect to homepage after successful login
  });

  test("should display loading state when submitting the form", async () => {
    render(<Login />);

    // Mock API to delay response
    mockAxios.onPost("/api/auth/login").reply(200, { data: { access_token: "test-token" } });

    // Simulate user input
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    });

    await waitFor(() => {
      // Expect to see the loading state
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });
    expect(screen.getByRole("button", { name: /logging in/i })).toBeInTheDocument();
  });

  //negative cases
  test("validate: can't login if email field is empty", async () => {
    render(<Login />);

    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: /login/i,
    });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(loginButton);
    });

    const emailInput: HTMLInputElement = screen.getByRole("textbox", {
      name: /email/i,
    });
    expect(emailInput).toBeInvalid();
  });

  test("validate: can't login if password field is empty", async () => {
    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", {
      name: /email/i,
    });
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: /login/i,
    });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.click(loginButton);
    });

    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInvalid();
  });

  test("validate: can't login if all fields is empty", async () => {
    render(<Login />);

    const loginButton: HTMLButtonElement = screen.getByRole("button", { name: /login/i });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    const emailInput: HTMLInputElement = screen.getByRole("textbox", { name: /email/i });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  test("validate: can't login if email input is invalid", async () => {
    render(<Login />);

    const emailInput: HTMLInputElement = screen.getByRole("textbox", {
      name: /email/i,
    });
    const passwordInput: HTMLInputElement = screen.getByLabelText(/password/i);
    const loginButton: HTMLButtonElement = screen.getByRole("button", {
      name: /login/i,
    });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(loginButton);
    });

    expect(emailInput).toBeInvalid();
  });

  test("should display error when login fails", async () => {
    render(<Login />);

    // Mock API failure
    mockAxios.onPost("/api/auth/login").reply(500);

    // Simulate user input
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpassword" } });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });

    // Check if the form fields are cleared
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/password/i) as HTMLInputElement).value).toBe("");
  });

  //edge case
  test("should handle multiple rapid clicks on login button", async () => {
    render(<Login />);

    // Mock API response
    mockAxios.onPost("/api/auth/login").reply(200, { data: { access_token: "test-token" } });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    await waitFor(() => {
      // Click login button multiple times rapidly
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);
      // Make sure only 1 request is created
      expect(mockAxios.history.post.length).toBe(1);
    });
  });
});