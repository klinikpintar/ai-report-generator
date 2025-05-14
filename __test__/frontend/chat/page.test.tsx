import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "@frontend/(chat)/page"; // sesuaikan path sesuai struktur proyek kamu
import "@testing-library/jest-dom";

// Mock ChatBox untuk menghindari logika internal yang berat
jest.mock("@frontend/(chat)/chatbox", () => () => (
  <div data-testid="chatbox">Mocked ChatBox</div>
));

describe("Home Page", () => {
  it("should render ChatBox inside Suspense", async () => {
    render(<Home />);

    // Cek apakah komponen ChatBox tampil
    expect(screen.getByTestId("chatbox")).toBeInTheDocument();

    // Cek apakah fallback *tidak muncul* setelah ChatBox dirender
    expect(screen.queryByText("Loading chat...")).not.toBeInTheDocument();
  });
});
