import { randomUUID } from "crypto";
import { Platform, Schema, Service } from "./types"

export const dummyPlatforms: Platform[] = [
  {
    code: "POSTGRESQL",
    name: "PostgreSQL",
    img_url: "https://static-00.iconduck.com/assets.00/postgresql-icon-1987x2048-v2fkmdaw.png",
  },
  {
    code: "MYSQL",
    name: "MYSQL",
    img_url: "https://www.svgrepo.com/show/303251/mysql-logo.svg",
  },
  {
    code: "MONGODB",
    name: "MongoDB",
    img_url: "https://www.vectorlogo.zone/logos/mongodb/mongodb-icon.svg",
  }
];


export const dummyServices: Service[] = [
  {
    id: randomUUID(),
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Reservasi",
    platform: dummyPlatforms[0],
  },
  {
    id: randomUUID(),
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Kesehatan",
    platform: dummyPlatforms[1],
  },
  {
    id: randomUUID(),
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Keuangan",
    platform: dummyPlatforms[2],
  },
  {
    id: randomUUID(),
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: "Inventaris",
    platform: dummyPlatforms[1],
  },
]


export const dummySchemas: Schema[] = [
  {
    id: randomUUID(),
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
    id: randomUUID(),
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
    id: randomUUID(),
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
    id: randomUUID(),
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