import apiClient from "../axios/APIClient";
import { Country } from "../models/Country";
import { PagedQuery } from "../models/PagedQuery";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/country";

export const CountryService = {
  async getAll(): Promise<Country[]> {
    const response = await apiClient.get<Country[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<Country> {
    const response = await apiClient.get<Country>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(country: Country): Promise<Country> {
    const response = await apiClient.post<Country>(BASE_URL, country);
    return response.data;
  },

  async update(id: number, country: Country): Promise<Country> {
    const response = await apiClient.put<Country>(`${BASE_URL}/${id}`, country);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async search(query: PagedQuery): Promise<PagedResult<Country>> {
    const params = new URLSearchParams();
    if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
    if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
    params.append("sortDescending", String(query.sortDescending));
    params.append("pageNumber", String(query.pageNumber));
    params.append("pageSize", String(query.pageSize));
    const response = await apiClient.get<PagedResult<Country>>(
      `${BASE_URL}/search?${params.toString()}`
    );
    return response.data;
  },
};
