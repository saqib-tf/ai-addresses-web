import apiClient from "../axios/APIClient";
import { State } from "../models/State";
import { StateSearchQuery } from "../models/State";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/state";

export const StateService = {
  async getAll(): Promise<State[]> {
    const response = await apiClient.get<State[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<State> {
    const response = await apiClient.get<State>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(state: State): Promise<State> {
    const response = await apiClient.post<State>(BASE_URL, state);
    return response.data;
  },

  async update(id: number, state: State): Promise<State> {
    const response = await apiClient.put<State>(`${BASE_URL}/${id}`, state);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async search(query: StateSearchQuery): Promise<PagedResult<State>> {
    const params = new URLSearchParams();
    if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
    if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
    params.append("sortDescending", String(query.sortDescending));
    params.append("pageNumber", String(query.pageNumber));
    params.append("pageSize", String(query.pageSize));
    if (query.countryId !== undefined) params.append("countryId", String(query.countryId));
    const response = await apiClient.get<PagedResult<State>>(
      `${BASE_URL}/search?${params.toString()}`
    );
    return response.data;
  },
};
