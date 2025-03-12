import { render, screen } from "@testing-library/react";
import { ServiceProvider, useService } from "@frontend/(chat)/context/serviceContext";
import { createContext, useContext } from "react";

describe("ServiceContext", () => {
  it("should provide default service context value", () => {
    let contextValue;

    const TestComponent = () => {
      contextValue = useService();
      return null;
    };

    render(
      <ServiceProvider>
        <TestComponent />
      </ServiceProvider>
    );

    expect(contextValue.selectedService).toBe("Pilih Service");
  });

  it("should throw an error when used outside of ServiceProvider", () => {
    console.error = jest.fn(); // Supaya error tidak memenuhi output

    const TestComponent = () => {
      useService(); // Harus error karena tidak dibungkus dengan ServiceProvider
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useService must be used within a ServiceProvider"
    );
  });
});