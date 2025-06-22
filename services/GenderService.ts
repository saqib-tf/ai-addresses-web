import { useApiClient } from "../axios/useApiClient";
import { Gender } from "../models/Gender";
import { PagedQuery } from "../models/PagedQuery";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/gender";

export function useGenderService() {
  const api = useApiClient();

  return {
    async getAll(): Promise<Gender[]> {
      const response = await api({ method: "get", url: BASE_URL });
      return response.data;
    },

    async getGenderById(id: number): Promise<Gender> {
      const response = await api({ method: "get", url: `${BASE_URL}/${id}` });
      return response.data;
    },

    async createGender(gender: Gender): Promise<Gender> {
      const response = await api({ method: "post", url: BASE_URL, data: gender });
      return response.data;
    },

    async updateGender(id: number, gender: Gender): Promise<Gender> {
      const response = await api({ method: "put", url: `${BASE_URL}/${id}`, data: gender });
      return response.data;
    },

    async deleteGender(id: number): Promise<void> {
      await api({ method: "delete", url: `${BASE_URL}/${id}` });
    },

    async search(query: PagedQuery): Promise<PagedResult<Gender>> {
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
  };
}
