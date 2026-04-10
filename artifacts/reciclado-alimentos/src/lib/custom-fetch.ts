export const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem("ra_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};
