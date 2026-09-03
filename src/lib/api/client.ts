import { getApiBaseUrl } from "@/config/env";
import { ApiResponseError } from "@/lib/api/parsers";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiUnavailableError extends Error {
  constructor() {
    super("The news service is currently unavailable.");
    this.name = "ApiUnavailableError";
  }
}

interface RequestOptions {
  fetcher?: typeof fetch;
  accessToken?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }
  const error = payload as Record<string, unknown>;
  for (const field of ["detail", "message", "title"]) {
    if (typeof error[field] === "string" && error[field].trim() !== "") {
      return error[field];
    }
  }
  return fallback;
}

export async function requestJson<T>(
  path: string,
  parser: (payload: unknown) => T,
  options: RequestOptions = {},
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const requestUrl = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetcher(requestUrl, {
      cache: "no-store",
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options.accessToken
          ? { Authorization: `Bearer ${options.accessToken}` }
          : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiUnavailableError();
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Request failed with status ${response.status}.`,
        response.status,
      );
    }
    throw new ApiResponseError("The backend returned invalid JSON.");
  }

  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(payload, `Request failed with status ${response.status}.`),
      response.status,
    );
  }
  return parser(payload);
}

export async function requestNoContent(
  path: string,
  options: RequestOptions,
): Promise<void> {
  const fetcher = options.fetcher ?? fetch;
  let response: Response;
  try {
    response = await fetcher(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
      method: options.method ?? "DELETE",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiUnavailableError();
  }
  if (!response.ok) throw new ApiError(`Request failed with status ${response.status}.`, response.status);
}
