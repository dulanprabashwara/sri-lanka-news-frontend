export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.API_BASE_URL?.trim();
  if (!configuredUrl) {
    throw new ApiConfigurationError("API_BASE_URL is not configured.");
  }
  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ApiConfigurationError(
      "API_BASE_URL must be a valid HTTP or HTTPS URL.",
    );
  }
}
