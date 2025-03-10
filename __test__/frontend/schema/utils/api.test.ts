import "@testing-library/jest-dom";
import { fetchSchemas, fetchServices, fetchPlatforms } from "@/modules/schema/utils/api";
import { dummySchemas, dummyServices } from "@/modules/schema/constant";

describe("API functions", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        {
          // minimal shape
          name: "test_schema",
          description: "dummy schema",
          schemaText: "CREATE TABLE test ...",
        },
      ]),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchSchemas should call fetch", async () => {
    const result = await fetchSchemas();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.length).toBe(1);
    expect(result[0].service).toBe(dummyServices[0]);
  });

  it("fetchServices should return service list", async () => {
    const result = await fetchServices();
    const uniqueServices = Array.from(new Set(dummySchemas.map((s) => s.service)));
    expect(result).toEqual(uniqueServices);
  });

  it("fetchPlatforms should return platform list", async () => {
    const result = await fetchPlatforms();
    const uniquePlatforms = Array.from(new Set(dummySchemas.map((s) => s.service.platform)));
    expect(result).toEqual(uniquePlatforms);
  });
});