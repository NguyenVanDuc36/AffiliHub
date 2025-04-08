import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

// Original apiRequest function for backward compatibility
export async function apiRequest(
  url: string,
  options?: ApiRequestOptions
): Promise<Response> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: options?.body 
      ? { "Content-Type": "application/json", ...options?.headers } 
      : options?.headers || {},
    body: typeof options?.body === 'string' 
      ? options.body 
      : options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// New typed API request function
export async function apiRequestTyped<T>(
  url: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest(url, options);
  return await response.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
