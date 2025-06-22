// hooks/useApiClient.ts
import { useSession } from "next-auth/react";
import apiClient from "@/axios/APIClient";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export function useApiClient() {
  const { data: session } = useSession();
  // console.log("id token in useApiClient before:", session?.id_token);

  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    // if (session?.id_token) {
    // console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
    // console.log("id token in useApiClient:", session);
    config.headers = config.headers || {};
    // config.headers.Authorization = `Bearer session.id_token`;
    config.headers["Authorization"] = `Bearer ${session?.id_token}`;
    // }
    return apiClient(config);
  };
}
