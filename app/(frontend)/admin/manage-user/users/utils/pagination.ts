export const generatePagination = (
  currentPage: number,
  lastPage: number
): (number | "...")[] => {
  let pages: (number | "...")[] = [];

  if (lastPage <= 5) {
    pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  } else {
    if (currentPage <= 3) {
      pages = [1, 2, 3, "...", lastPage];
    } else if (currentPage >= lastPage - 2) {
      pages = [1, "...", lastPage - 2, lastPage - 1, lastPage];
    } else {
      pages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        lastPage,
      ];
    }
  }

  return pages;
};
