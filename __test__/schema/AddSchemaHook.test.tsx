import { renderHook, act, waitFor } from "@testing-library/react";
import { AddSchemaHook } from "@/app/hooks/AddSchemaHook";

global.alert = jest.fn();
global.fetch = jest.fn();

describe("AddSchemaHook Test", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should initialize empty formData", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));
    expect(result.current.formData).toEqual({
      name: "",
      description: "",
      schemaText: "",
      fileName: "",
    });
  });

  it("Should update state when 'handleChange' is called", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Test Schema" },
      } as any);
    });

    expect(result.current.formData.name).toBe("Test Schema");
  });

  it("Should reject disallowed files when 'handleFileChange' is called", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));
    const mockEvent = { target: { files: [{ name: "invalid.txt" }] } } as any;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(global.alert).toHaveBeenCalledWith("File format not allowed!");
  });

  it("Should read input file", async () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));
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
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

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
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(global.alert).toHaveBeenCalledWith("Please upload schema");
  });

  it("Should call API and 'onClose' when 'handleSubmit' succeeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

    act(() => {
      result.current.formData.schemaText = "CREATE TABLE users;";
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/schema",
      expect.any(Object)
    );
    expect(global.alert).toHaveBeenCalledWith("Schema successfully added");
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("Should handle errors if API fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

    act(() => {
      result.current.formData.schemaText = "CREATE TABLE users;";
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(global.alert).toHaveBeenCalledWith("Server error");
  });

  it("Should do nothing if the file does not exist", () => {
    const { result } = renderHook(() => AddSchemaHook(onCloseMock));

    const mockEvent = { target: { files: null } } as any;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.formData.schemaText).toBe("");
    expect(result.current.formData.fileName).toBe("");
  });
});
