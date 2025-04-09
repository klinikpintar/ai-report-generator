import { dummyPlatforms } from "../constant"
import { Schema } from "../types"

export interface FetchSchemasParams {
  serviceIds?: number[]
  platformIds?: number[]
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchSchemas(params: FetchSchemasParams = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => queryParams.append(key, String(v)));
    } else if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${window.location.origin}/api/schema?${queryParams.toString()}`);
  const data = await response.json() as Schema[];

  const schemas = data.map((schema, index) => ({
    ...schema,
    platform: dummyPlatforms[index % dummyPlatforms.length],
  })) as Schema[];

  return schemas;
}

export async function fetchServices() {
  const response = await fetch(`${window.location.origin}/api/service`);

  const services = await response.json();
  return services;
}

export async function fetchPlatforms() {
  const platforms = dummyPlatforms
  return Promise.resolve(platforms)
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