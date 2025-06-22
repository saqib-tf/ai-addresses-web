import { useApiClient } from "../axios/useApiClient";
import { State } from "../models/State";
import { StateSearchQuery } from "../models/State";
import { PagedResult } from "../models/PagedResult";

const BASE_URL = "/state";

export function useStateService() {
  const api = useApiClient();

  return {
    async getAll(): Promise<State[]> {
      const response = await api({ method: "get", url: BASE_URL });
      return response.data;
    },

    async getById(id: number): Promise<State> {
      const response = await api({ method: "get", url: `${BASE_URL}/${id}` });
      return response.data;
    },

    async create(state: State): Promise<State> {
      const response = await api({ method: "post", url: BASE_URL, data: state });
      return response.data;
    },

    async update(id: number, state: State): Promise<State> {
      const response = await api({ method: "put", url: `${BASE_URL}/${id}`, data: state });
      return response.data;
    },

    async delete(id: number): Promise<void> {
      await api({ method: "delete", url: `${BASE_URL}/${id}` });
    },

    async search(query: StateSearchQuery): Promise<PagedResult<State>> {
      const params = new URLSearchParams();
      if (query.searchTerm !== undefined) params.append("searchTerm", query.searchTerm ?? "");
      if (query.sortBy !== undefined) params.append("sortBy", query.sortBy ?? "");
      params.append("sortDescending", String(query.sortDescending));
      params.append("pageNumber", String(query.pageNumber));
      params.append("pageSize", String(query.pageSize));
      if (query.countryId !== undefined) params.append("countryId", String(query.countryId));
      const response = await api({
        method: "get",
        url: `${BASE_URL}/search?${params.toString()}`,
      });
      return response.data;
    },
  };
}
