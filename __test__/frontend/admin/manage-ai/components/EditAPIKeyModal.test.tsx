import { EditAPIKeyModal } from "@frontend/admin/manage-ai/components/EditAPIKeyModal";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";
import { patchApiKey } from "@frontend/admin/manage-ai/utils/api/patch-api-key";

jest.mock("@frontend/admin/manage-ai/utils/api/patch-api-key", () => ({
  patchApiKey: jest.fn(),
}));

const onCloseMock = jest.fn();

const setup = () => {
  render(
    <>
      <ToastContainer />
      <EditAPIKeyModal
        isVisible={true}
        onClose={onCloseMock}
        providerId="1"
        providerName="Gemini"
      />
    </>
  );
};

const mockApiKey = "AIzaSyDNSjz";

describe("EditAPIKeyModal Display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("should display the correct title", async () => {
    const title = await screen.findByText(/Edit API Key AI/i);
    expect(title).toBeInTheDocument();
  });

  it('should display "Unchanged" placeholder for api key input', async () => {
    const input = await screen.findByPlaceholderText(/Unchanged/i);
    expect(input).toBeInTheDocument();
  });

  it('should display "Simpan" button', async () => {
    const saveButton = await screen.findByText(/Simpan/i);
    expect(saveButton).toBeInTheDocument();
  });

  it('should display "Batal" button', async () => {
    const cancelButton = await screen.findByText(/Batal/i);
    expect(cancelButton).toBeInTheDocument();
  });
});

describe("EditAPIKeyModal Functionality", () => {
  beforeEach(() => {
    setup();
  });

  it("the submit button should be disabled when the input is empty", async () => {
    const saveButton = await screen.findByText(/Simpan/i);
    expect(saveButton).toBeDisabled();
  });

  it("the submit button should be enabled when the input is filled", async () => {
    const input = (await screen.findByPlaceholderText(/Unchanged/i)) as HTMLInputElement;
    const saveButton = await screen.findByText(/Simpan/i);

    await userEvent.type(input, "New API Key");
    expect(saveButton).toBeEnabled();
  });

  it("should call patchAPIKey when the form is submitted", async () => {
    (patchApiKey as jest.Mock).mockResolvedValueOnce({ success: true });
    const input = (await screen.findByPlaceholderText(/Unchanged/i)) as HTMLInputElement;
    const saveButton = await screen.findByText(/Simpan/i);

    await userEvent.type(input, mockApiKey);
    await userEvent.click(saveButton);

    expect(patchApiKey).toHaveBeenCalledWith({
      providerId: "1",
      apiKey: mockApiKey,
    });
  });

  it("should display success message when the API key is updated successfully", async () => {
    (patchApiKey as jest.Mock).mockResolvedValueOnce({ success: true });
    const input = (await screen.findByPlaceholderText(/Unchanged/i)) as HTMLInputElement;
    const saveButton = await screen.findByText(/Simpan/i);

    await userEvent.type(input, mockApiKey);
    await userEvent.click(saveButton);

    expect(patchApiKey).toHaveBeenCalledWith({
      providerId: "1",
      apiKey: mockApiKey,
    });

    await waitFor(async () => {
      const successMessage = await screen.findByText(/API Key updated successfully/i);
      expect(successMessage).toBeInTheDocument();
    });
  });

  it("should display error message when the API key update fails", async () => {
    (patchApiKey as jest.Mock).mockResolvedValueOnce({ success: false, message: "Update failed" });
    const input = (await screen.findByPlaceholderText(/Unchanged/i)) as HTMLInputElement;
    const saveButton = await screen.findByText(/Simpan/i);

    await userEvent.type(input, mockApiKey);
    await userEvent.click(saveButton);

    expect(patchApiKey).toHaveBeenCalledWith({
      providerId: "1",
      apiKey: mockApiKey,
    });

    await waitFor(async () => {
      const errorMessage = await screen.findByText(/Failed to update API Key/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("should call onClose when the cancel button is clicked", async () => {
    const cancelButton = await screen.findByText(/Batal/i);
    await userEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
