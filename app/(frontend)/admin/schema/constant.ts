import { Platform, Schema, Service } from "./types"


export const dummyPlatforms: Platform[] = [
  {
    id: 1,
    name: "PostgreSQL",
    color: "#013F59",
  },
  {
    id: 2,
    name: "MySQL",
    color: "#FF9500",
  },
  {
    id: 3,
    name: "MongoDB",
    color: "#009951",
  }
];


export const dummyServices: Service[] = [
  {
    id: 1,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Reservasi Pasien",
    platform: dummyPlatforms[0],
  },
  {
    id: 2,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Pemesanan Online",
    platform: dummyPlatforms[1],
  },
  {
    id: 3,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Laporan Keuangan",
    platform: dummyPlatforms[2],
  },
  {
    id: 4,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Manajemen Inventaris",
    platform: dummyPlatforms[1],
  },
]


export const dummySchemas: Schema[] = [
  {
    id: 1,
    createdAt: new Date(),
    modifiedAt: new Date(),
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
  },
  {
    id: 2,
    createdAt: new Date(),
    modifiedAt: new Date(),
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
  },
  {
    id: 3,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "laporan_keuangan",
    service: dummyServices[2],
    description: "Schema untuk menyimpan data laporan keuangan",
    schemaText: `CREATE TABLE laporan_keuangan (
      id SERIAL PRIMARY KEY,
      tgl_transaksi DATE,
      jenis_transaksi VARCHAR(50),
      total DECIMAL(10, 2)
    )`,
  },
  {
    id: 4,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "manajemen_stok",
    service: dummyServices[3],
    description: "Schema untuk menyimpan data stok barang",
    schemaText: `CREATE TABLE manajemen_stok (
      id SERIAL PRIMARY KEY,
      nama_barang VARCHAR(50),
      harga DECIMAL(10, 2),
      stok INT
    )`,
  },
]