import "@testing-library/jest-dom";
import { fetchServices, fetchPlatforms, deleteSchema, fetchSchemas } from "@frontend/admin/schema/utils/api";
import { platforms, } from "@frontend/admin/schema/constant";
import { mockSchemas, mockServices } from "@/__mocks__/schema-data";

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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockServices),
    });

    const result = await fetchServices();

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/service"));

    expect(result).toEqual(mockServices);
  });

  it("fetchPlatforms should return platform list", async () => {
    const result = await fetchPlatforms();
    expect(result).toEqual(platforms);
  });

  it("deleteSchema should call fetch with DELETE method", async () => {
    const schemaId = 1;
    await deleteSchema(schemaId);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should fetch schemas with correct query parameters", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSchemas),
    });

    const params = {
      serviceIds: ["1", "2"],
      platformCodes: ["PostgreSQL", "MySQL"],
    };

    const result = await fetchSchemas(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("serviceIds=1&serviceIds=2&platformCodes=PostgreSQL&platformCodes=MySQL")
    );

    expect(result).toEqual(mockSchemas);
  });
});