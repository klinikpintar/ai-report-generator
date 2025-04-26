import { platforms } from "../constant"
import { PaginationResponse, Platform, Schema, Service } from "@frontend/common/types"

export interface FetchSchemasParams {
  serviceIds?: Service['id'][]
  platformCodes?: Platform[]
  page?: number;
  limit?: number;

}

export const fetchSchemas = async ({ serviceIds, platformCodes, page, limit }: FetchSchemasParams) => {
  const queryParams = new URLSearchParams();

  if (serviceIds) {
    serviceIds.forEach(serviceId => queryParams.append("serviceIds", serviceId))
  }
  if (platformCodes) {
    platformCodes.forEach(platformCode => queryParams.append("platformCodes", platformCode))
  }
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const response = await fetch(`/api/schema?${queryParams.toString()}`);
  const paginatedData = await response.json() as PaginationResponse<Schema>;

  return paginatedData;
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