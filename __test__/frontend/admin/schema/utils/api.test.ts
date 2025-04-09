import "@testing-library/jest-dom";
import { fetchServices, fetchPlatforms, deleteSchema, fetchSchemas } from "@frontend/admin/schema/utils/api";
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

  it("should fetch schemas with correct query parameters", async () => {
    const mockSchemas = [
      {
        id: 1,
        name: "Schema A",
        description: "Description A",
        schemaText: "CREATE TABLE schema_a (id SERIAL PRIMARY KEY);",
        serviceId: 1,
        platform: {
          id: 1,
          name: "PostgreSQL",
          color: "#013F59",
        },
      },
      {
        id: 2,
        name: "Schema B",
        description: "Description B",
        schemaText: "CREATE TABLE schema_b (id SERIAL PRIMARY KEY);",
        serviceId: 2,
        platform: {
          id: 2,
          name: "MySQL",
          color: "#FF9500",
        },
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSchemas),
    });

    const params = {
      serviceIds: [1, 2],
      platformIds: [1, 2],
    };

    const result = await fetchSchemas(params);

    expect(global.fetch).toHaveBeenCalledWith(
      `${window.location.origin}/api/schema?serviceIds=1&serviceIds=2&platformIds=1&platformIds=2`
    );

    expect(result).toEqual(mockSchemas);
  });
});