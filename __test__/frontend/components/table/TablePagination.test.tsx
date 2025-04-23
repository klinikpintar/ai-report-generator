import { render, screen, fireEvent } from "@testing-library/react";
import { TablePagination } from "@frontend/components/table";
import "@testing-library/jest-dom";

describe("TablePagination Component", () => {
  // Mock function for onPageChange
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    // Reset mock function before each test
    mockOnPageChange.mockReset();
  });

  it("should render next and previous buttons correctly", () => {
    render(<TablePagination currentPage={2} lastPage={5} onPageChange={mockOnPageChange} />);

    // Check that both buttons are rendered
    expect(screen.getByRole("button", { name: /sebelumnya/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /selanjutnya/i })).toBeInTheDocument();
  });

  it("should display all page numbers when total pages is less than or equal to 5", () => {
    render(<TablePagination currentPage={3} lastPage={5} onPageChange={mockOnPageChange} />);

    // Check that all page numbers are displayed
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Check that no ellipsis is displayed
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("should display one ellipsis when total pages > 5 and current page <= 3", () => {
    render(<TablePagination currentPage={2} lastPage={10} onPageChange={mockOnPageChange} />);

    // Check that expected page numbers are displayed
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check that only one ellipsis is displayed
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(1);
  });

  it("should display one ellipsis when total pages > 5 and current page is in last three pages", () => {
    render(<TablePagination currentPage={8} lastPage={10} onPageChange={mockOnPageChange} />);

    // Check that expected page numbers are displayed
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check that only one ellipsis is displayed
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(1);
  });

  it("should display two ellipses when total pages > 5 and current page is in the middle", () => {
    render(<TablePagination currentPage={5} lastPage={10} onPageChange={mockOnPageChange} />);

    // Check that expected page numbers are displayed
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check that two ellipses are displayed
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  it("should disable previous button when on first page", () => {
    render(<TablePagination currentPage={1} lastPage={5} onPageChange={mockOnPageChange} />);

    // Get the previous button
    const prevButton = screen.getByRole("button", { name: /sebelumnya/i });

    // Try to click it and verify onPageChange is not called
    fireEvent.click(prevButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should disable next button when on last page", () => {
    render(<TablePagination currentPage={5} lastPage={5} onPageChange={mockOnPageChange} />);

    // Get the next button
    const nextButton = screen.getByRole("button", { name: /selanjutnya/i });

    // Try to click it and verify onPageChange is not called
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should call onPageChange with correct page number when a page number is clicked", () => {
    render(<TablePagination currentPage={3} lastPage={5} onPageChange={mockOnPageChange} />);

    // Click on page 4
    fireEvent.click(screen.getByText("4"));

    // Verify onPageChange was called with the correct page number
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("should call onPageChange with previous page when previous button is clicked", () => {
    render(<TablePagination currentPage={3} lastPage={5} onPageChange={mockOnPageChange} />);

    // Click the previous button
    fireEvent.click(screen.getByRole("button", { name: /sebelumnya/i }));

    // Verify onPageChange was called with the previous page
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange with next page when next button is clicked", () => {
    render(<TablePagination currentPage={3} lastPage={5} onPageChange={mockOnPageChange} />);

    // Click the next button
    fireEvent.click(screen.getByRole("button", { name: /selanjutnya/i }));

    // Verify onPageChange was called with the next page
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  // Edge cases
  it("should handle edge case when lastPage is 1", () => {
    render(<TablePagination currentPage={1} lastPage={1} onPageChange={mockOnPageChange} />);

    // Check that only page 1 is displayed
    expect(screen.getByText("1")).toBeInTheDocument();

    // Try to click both buttons and verify onPageChange is not called
    const prevButton = screen.getByRole("button", { name: /sebelumnya/i });
    const nextButton = screen.getByRole("button", { name: /selanjutnya/i });

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should handle edge case when lastPage is 0", () => {
    render(<TablePagination currentPage={1} lastPage={0} onPageChange={mockOnPageChange} />);

    // Check that no page numbers are displayed
    expect(screen.queryByText("1")).not.toBeInTheDocument();

    // Try to click both buttons and verify onPageChange is not called
    const prevButton = screen.getByRole("button", { name: /sebelumnya/i });
    const nextButton = screen.getByRole("button", { name: /selanjutnya/i });

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it("should highlight the current page", () => {
    render(<TablePagination currentPage={3} lastPage={5} onPageChange={mockOnPageChange} />);

    // Find all page links
    const pageLinks = screen.getAllByRole("link");

    // Find the link for page 3
    const currentPageLink = pageLinks.find((link) => link.textContent === "3");

    // Check that it has the active class
    expect(currentPageLink).toHaveAttribute("data-state", "active");
  });

  it("should handle edge case when currentPage is greater than lastPage", () => {
    render(<TablePagination currentPage={10} lastPage={5} onPageChange={mockOnPageChange} />);

    // Try to click the next button and verify onPageChange is not called
    const nextButton = screen.getByRole("button", { name: /selanjutnya/i });
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });
});
