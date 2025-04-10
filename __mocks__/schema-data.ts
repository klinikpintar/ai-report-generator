import { Platform, Service, Schema } from "@frontend/common/types";
export const mockPlatforms: Platform[] = [
  "PostgreSQL",
]

export const mockServices: Service[] = [
  {
    id: "1",
    name: "Reservasi Pasien",
    platformCode: "PostgreSQL",
    createdAt: "2023-01-01T00:00:00Z",
  },
];

export const mockSchemas: Schema[] = [
  {
    id: 1,
    name: "reservasi_pelanggan",
    service: mockServices[0],
    description: "Schema untuk menyimpan data pelanggan yang melakukan reservasi",
    schemaText: `CREATE TABLE reservasi_pelanggan (
      id SERIAL PRIMARY KEY,
      nama VARCHAR(50),
      alamat VARCHAR(100),
      no_hp VARCHAR(15),
      email VARCHAR(50),
      tgl_reservasi DATE,
      tgl_checkin DATE,
      tgl_checkout DATE
    )`,
    serviceId: mockServices[0].id,
    createdAt: "2023-01-01T00:00:00Z",
  },
];