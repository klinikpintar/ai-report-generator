import { dummySchemas, dummyServices } from "../constant"
import { Schema } from "../types"

export interface FetchSchemasParams {
  serviceIds?: string[]
  platformCodes?: string[]
  [key: string]: unknown
}

export async function fetchSchemas(params: FetchSchemasParams = {}) {
  const response = await fetch(`${window.location.origin}/api/schema`);
  const data = await response.json() as any[];

  const schemas = data.map((schema, index) => ({
    ...schema,
    service: dummyServices[index % dummyServices.length],
  })) as Schema[];

  return schemas;
}

export async function fetchServices() {
  const services = Array.from(new Set(dummySchemas.map((schema) => schema.service)))
  return Promise.resolve(services)
}

export async function fetchPlatforms() {
  const platforms = Array.from(new Set(dummySchemas.map((schema) => schema.service.platform)))
  return Promise.resolve(platforms)
}