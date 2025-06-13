import apiClient from "../axios/APIClient";
import { AddressType } from "../models/AddressType";
import { PagedQuery } from "../models/PagedQuery";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/addresstype";

export const AddressTypeService = {
  async getAll(): Promise<AddressType[]> {
    const response = await apiClient.get<AddressType[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<AddressType> {
    const response = await apiClient.get<AddressType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(addressType: AddressType): Promise<AddressType> {
    const response = await apiClient.post<AddressType>(BASE_URL, addressType);
    return response.data;
  },

  async update(id: number, addressType: AddressType): Promise<AddressType> {
    const response = await apiClient.put<AddressType>(`${BASE_URL}/${id}`, addressType);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async search(query: PagedQuery): Promise<PagedResult<AddressType>> {
    const params = new URLSearchParams();
    if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
    if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
    params.append("sortDescending", String(query.sortDescending));
    params.append("pageNumber", String(query.pageNumber));
    params.append("pageSize", String(query.pageSize));
    const response = await apiClient.get<PagedResult<AddressType>>(
      `${BASE_URL}/search?${params.toString()}`
    );
    return response.data;
  },
};
