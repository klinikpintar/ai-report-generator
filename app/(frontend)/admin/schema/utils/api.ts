import { dummyServices } from "../constant"
import { Schema, Platform } from "../types"

export interface FetchSchemasParams {
  serviceIds?: number[]
  platformIds?: number[]
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchSchemas(params: FetchSchemasParams = {}) {
  const response = await fetch(`${window.location.origin}/api/schema`);
  const data = await response.json() as Schema[];

  const schemas = data.map((schema, index) => ({
    ...schema,
    service: dummyServices[index % dummyServices.length],
  })) as Schema[];

  return schemas;
}

export async function fetchServices() {
  const services = dummyServices
  return Promise.resolve(services)
}

export async function fetchPlatforms() {
  const response = await fetch(`${window.location.origin}/api/schema/platform`);
  const platforms = await response.json() as Platform[];
  return platforms;
}


export async function deleteSchema(id: number) {
  return fetch(`${window.location.origin}/api/schema`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })
}