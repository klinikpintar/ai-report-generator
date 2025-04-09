import "@testing-library/jest-dom";
import { fetchServices, fetchPlatforms, deleteSchema } from "@frontend/admin/schema/utils/api";
import { dummySchemas, } from "@frontend/admin/schema/constant";

describe("API functions", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        {
          name: "test_schema",
          description: "dummy schema",
          schemaText: "CREATE TABLE test ...",
        },
      ]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchServices should return service list", async () => {
    const mockServices = [
      { id: "1", name: "Service A", platformCode: "PostgreSQL" },
      { id: "2", name: "Service B", platformCode: "MySQL" },
    ];
  
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockServices),
    });
  
    const result = await fetchServices();
  
    expect(global.fetch).toHaveBeenCalledWith(`${window.location.origin}/api/service`);
    expect(result).toEqual(mockServices);
  });

  it("fetchPlatforms should return platform list", async () => {
    const result = await fetchPlatforms();
    const uniquePlatforms = Array.from(new Set(dummySchemas.map((s) => s.service!.platform)));
    expect(result).toEqual(uniquePlatforms);
  });

  it("deleteSchema should call fetch with DELETE method", async () => {
    const schemaId = 1;
    await deleteSchema(schemaId);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});