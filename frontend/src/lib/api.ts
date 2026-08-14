export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5167/api";

interface ApiErrorBody {
  message?: string;
  title?: string;
}

export async function api<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}) as ApiErrorBody);
    throw new Error(
      error.message ?? error.title ?? `Request failed (${response.status})`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
