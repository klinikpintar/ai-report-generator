import { platforms } from "../constant"
import { Platform, Schema, Service } from "@frontend/common/types"

export interface FetchSchemasParams {
  serviceIds?: Service['id'][]
  platformCodes?: Platform[]
  [key: string]: unknown
}

export async function fetchSchemas(params: FetchSchemasParams = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => queryParams.append(key, String(v)));
    }
  });

  const response = await fetch(`/api/schema?${queryParams.toString()}`);
  const data = await response.json() as Schema[];

  const schemas = data.map((schema) => ({
    ...schema,
  })) as Schema[];

  return schemas;
}

export async function fetchServices() {
  const response = await fetch(`/api/service`);

  const services = await response.json();
  return services;
}

export async function fetchPlatforms() {
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