import { useApiClient } from "../axios/useApiClient";
import { Person } from "../models/Person";
import { PagedQuery } from "../models/PagedQuery";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/person";

export function usePersonService() {
  const api = useApiClient();

  return {
    async getAll(): Promise<Person[]> {
      const response = await api({ method: "get", url: BASE_URL });
      return response.data;
    },

    async getById(id: number): Promise<Person> {
      const response = await api({ method: "get", url: `${BASE_URL}/${id}` });
      return response.data;
    },

    async create(person: Person): Promise<Person> {
      const response = await api({ method: "post", url: BASE_URL, data: person });
      return response.data;
    },

    async update(id: number, person: Person): Promise<Person> {
      const response = await api({ method: "put", url: `${BASE_URL}/${id}`, data: person });
      return response.data;
    },

    async delete(id: number): Promise<void> {
      await api({ method: "delete", url: `${BASE_URL}/${id}` });
    },

    async search(query: PagedQuery): Promise<PagedResult<Person>> {
      const params = new URLSearchParams();
      if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
      if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
      params.append("sortDescending", String(query.sortDescending));
      params.append("pageNumber", String(query.pageNumber));
      params.append("pageSize", String(query.pageSize));
      const response = await api({
        method: "get",
        url: `${BASE_URL}/search?${params.toString()}`,
      });
      return response.data;
    },

    async uploadImage(file: File): Promise<string> {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api({
        method: "post",
        url: `${BASE_URL}/upload-image`,
        data: formData,
        headers: {
          // Let the browser set the correct Content-Type with boundary
          // Axios will handle this if Content-Type is not set
        },
      });
      return response.data.path;
    },
  };
}
