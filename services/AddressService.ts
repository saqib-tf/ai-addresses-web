import apiClient from "../axios/APIClient";
import { Address } from "../models/Address";
import { AddressSearchQuery } from "../models/Address";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/address";

export const AddressService = {
  async getAll(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<Address> {
    const response = await apiClient.get<Address>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(address: Address): Promise<Address> {
    const response = await apiClient.post<Address>(BASE_URL, address);
    return response.data;
  },

  async update(id: number, address: Address): Promise<Address> {
    const response = await apiClient.put<Address>(`${BASE_URL}/${id}`, address);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async search(query: AddressSearchQuery): Promise<PagedResult<Address>> {
    const params = new URLSearchParams();
    if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
    if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
    params.append("sortDescending", String(query.sortDescending));
    params.append("pageNumber", String(query.pageNumber));
    params.append("pageSize", String(query.pageSize));
    if (query.personId !== undefined) params.append("personId", String(query.personId));
    const response = await apiClient.get<PagedResult<Address>>(
      `${BASE_URL}/search?${params.toString()}`
    );
    return response.data;
  },
};
