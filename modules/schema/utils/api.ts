import { dummySchemas } from "../constant"

export interface FetchSchemasParams {
  serviceIds?: string[]
  platformCodes?: string[]
  [key: string]: any
}

export async function fetchSchemas(params: FetchSchemasParams = {}) {
  return Promise.resolve(dummySchemas)
}

export async function fetchServices() {
  const services = Array.from(new Set(dummySchemas.map((schema) => schema.service)))
  return Promise.resolve(services)
}

export async function fetchPlatforms() {
  const platforms = Array.from(new Set(dummySchemas.map((schema) => schema.service.platform)))
  return Promise.resolve(platforms)
}