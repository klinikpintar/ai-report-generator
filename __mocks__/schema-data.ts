import { Platform, Service, Schema } from "@frontend/admin/schema/types";
export const mockPlatforms: Platform[] = [
  {
    id: 1,
    name: "PostgreSQL",
    color: "#000000",
  },
];

export const mockServices: Service[] = [
  {
    id: 1,
    name: "patient",
    platform: mockPlatforms[0],
  },
];

export const mockSchemas: Schema[] = [
  {
    id: 1,
    name: "Pasien Portal V1",
    description: "Test Description",
    schemaText: "Test Schema Text",
    service: mockServices[0],
  },
];