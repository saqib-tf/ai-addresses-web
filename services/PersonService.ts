import apiClient from "../axios/APIClient";
import { Person } from "../models/Person";
import { PagedQuery } from "../models/PagedQuery";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/person";

export const PersonService = {
  async getAll(): Promise<Person[]> {
    const response = await apiClient.get<Person[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<Person> {
    const response = await apiClient.get<Person>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(person: Person): Promise<Person> {
    const response = await apiClient.post<Person>(BASE_URL, person);
    return response.data;
  },

  async update(id: number, person: Person): Promise<Person> {
    const response = await apiClient.put<Person>(`${BASE_URL}/${id}`, person);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async search(query: PagedQuery): Promise<PagedResult<Person>> {
    const params = new URLSearchParams();
    if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
    if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
    params.append("sortDescending", String(query.sortDescending));
    params.append("pageNumber", String(query.pageNumber));
    params.append("pageSize", String(query.pageSize));
    const response = await apiClient.get<PagedResult<Person>>(
      `${BASE_URL}/search?${params.toString()}`
    );
    return response.data;
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ path: string }>(`${BASE_URL}/upload-image`, formData, {
      headers: {
        // Let the browser set the correct Content-Type with boundary
        "Content-Type": undefined,
      },
    });
    return response.data.path;
  },
};
