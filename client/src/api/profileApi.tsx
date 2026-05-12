import { apiClient } from "./apiClient";

export async function profileRequest() {
  const response = await apiClient.get("/profile");
  return response.data;
}
