import { Platform, Schema, Service } from "@frontend/common/types";


export const platforms: Platform[] = [
  "PostgreSQL",
  "MySQL",
  "MongoDB",
]


export const dummyServices: Service[] = [
  {
    id: "1",
    name: "Reservasi Pasien",
    platformCode: "PostgreSQL",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Rekam Medis",
    platformCode: "MySQL",
    createdAt: "2023-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Laporan Keuangan",
    platformCode: "MongoDB",
    createdAt: "2023-01-03T00:00:00Z",
  },
  {
    id: "4",
    name: "Manajemen Inventaris",
    platformCode: "PostgreSQL",
    createdAt: "2023-01-04T00:00:00Z",
  },
]



export const dummySchemas: Schema[] = [
  {
    id: 1,
    name: "reservasi_pelanggan",
    service: dummyServices[0],
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
    serviceId: dummyServices[0].id,
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "rekam_medis",
    service: dummyServices[1],
    description: "Schema untuk menyimpan rekam medis pasien",
    schemaText: `CREATE TABLE rekam_medis (
      id SERIAL PRIMARY KEY,
      nama_pasien VARCHAR(50),
      alamat VARCHAR(100),
      no_hp VARCHAR(15),
      tgl_periksa DATE,
      diagnosa TEXT,
      resep_obat TEXT
    )`,
    serviceId: dummyServices[1].id,
    createdAt: "2023-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "laporan_keuangan",
    service: dummyServices[2],
    description: "Schema untuk menyimpan data laporan keuangan",
    schemaText: `CREATE TABLE laporan_keuangan (
      id SERIAL PRIMARY KEY,
      tgl_transaksi DATE,
      jenis_transaksi VARCHAR(50),
      total DECIMAL(10, 2)
    )`,
    serviceId: dummyServices[2].id,
    createdAt: "2023-01-03T00:00:00Z",
  },
  {
    id: 4,
    name: "manajemen_stok",
    service: dummyServices[3],
    description: "Schema untuk menyimpan data stok barang",
    schemaText: `CREATE TABLE manajemen_stok (
      id SERIAL PRIMARY KEY,
      nama_barang VARCHAR(50),
      harga DECIMAL(10, 2),
      stok INT
    )`,
    serviceId: dummyServices[3].id,
    createdAt: "2023-01-04T00:00:00Z",
  },
]