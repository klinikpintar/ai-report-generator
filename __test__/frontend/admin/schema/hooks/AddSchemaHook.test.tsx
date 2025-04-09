import { renderHook, act, waitFor } from "@testing-library/react";
import { AddSchemaHook } from "@frontend/admin/schema/hooks/AddSchemaHook";
import axios from "axios";

jest.mock("axios");
global.alert = jest.fn();

describe("AddSchemaHook Test", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("Should initialize empty formData", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));
    expect(result.current.formData).toEqual({
      name: "",
      description: "",
      schemaText: "",
      fileName: "",
    });
  });

  it("Should update state when 'handleChange' is called", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Test Schema" },
      } as any);
    });

    expect(result.current.formData.name).toBe("Test Schema");
  });

  it("Should reject disallowed files when 'handleFileChange' is called", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));
    const mockEvent = { target: { files: [{ name: "invalid.txt" }] } } as any;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(global.alert).toHaveBeenCalledWith("File format not allowed!");
  });

  it("Should read input file", async () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));
    const mockFile = new File(["CREATE TABLE users;"], "schema.sql", {
      type: "text/plain",
    });

    const mockEvent = {
      target: { files: [mockFile] },
    } as any;

    await act(async () => {
      result.current.handleFileChange(mockEvent);
    });

    await waitFor(() => {
      expect(result.current.formData.schemaText).toBe("CREATE TABLE users;");
      expect(result.current.formData.fileName).toBe("schema.sql");
    });
  });

  it("Should clear form when 'clearForm' is called", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    act(() => {
      result.current.clearForm();
    });

    expect(result.current.formData).toEqual({
      name: "",
      description: "",
      schemaText: "",
      fileName: "",
    });
  });

  it("Should display an alert if 'handleSubmit' is called without a file", async () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(global.alert).toHaveBeenCalledWith("Please upload schema");
  });

  it("Should call API and 'onClose' when 'handleSubmit' succeeds", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    act(() => {
      result.current.formData.schemaText = "CREATE TABLE users;";
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(axios.post).toHaveBeenCalledWith("/api/schema", {
      name: result.current.formData.name,
      description: result.current.formData.description,
      schemaText: "CREATE TABLE users;",
    });
    expect(global.alert).toHaveBeenCalledWith("Schema successfully added");
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("Should handle errors if API fails", async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: { error: "Server error" } },
    });

    jest.spyOn(window, "alert").mockImplementation(() => {});

    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    act(() => {
      result.current.formData.schemaText = "CREATE TABLE users;";
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(global.alert).toHaveBeenCalledWith("Server error");
  });

  it("Should do nothing if the file does not exist", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, true));

    const mockEvent = { target: { files: null } } as any;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.formData.schemaText).toBe("");
    expect(result.current.formData.fileName).toBe("");
  });

  it("Should not call API if initialData does not exist", async () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock, false));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(axios.patch).not.toHaveBeenCalled();
  });

  it("Should call PATCH API with the correct data when submit", async () => {
    const initialData = {
      id: 1,
      name: "users-2",
      description: "auth-2 purpose",
      schemaText: "create",
      fileName: "skema.sql",
    };

    (axios.patch as jest.Mock).mockResolvedValue({ data: initialData });

    const { result } = renderHook(() =>
      AddSchemaHook(onCloseMock, false, initialData)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(axios.patch).toHaveBeenCalledWith("/api/schema", {
      id: 1,
      name: "users-2",
      description: "auth-2 purpose",
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("Should display error alert if API fails", async () => {
    const initialData = {
      id: 1,
      name: "users-2",
      description: "auth-2 purpose",
      schemaText: "create",
      fileName: "skema.sql",
    };

    (axios.patch as jest.Mock).mockRejectedValue({
      response: { data: { error: "Failed to update schema" } },
    });

    jest.spyOn(window, "alert").mockImplementation(() => {});

    const { result } = renderHook(() =>
      AddSchemaHook(onCloseMock, false, initialData)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(alert).toHaveBeenCalledWith("Failed to update schema");
  });
});
