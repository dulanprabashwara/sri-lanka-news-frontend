import { ApiConfigurationError } from "@/config/env";
import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import { ApiResponseError } from "@/lib/api/parsers";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiConfigurationError) {
    return "The news API has not been configured for this environment.";
  }
  if (error instanceof ApiUnavailableError) {
    return "The news service is unavailable. Please try again shortly.";
  }
  if (error instanceof ApiResponseError) {
    return "The news service returned data in an unexpected format.";
  }
  if (error instanceof ApiError) {
    return "The news service could not complete this request.";
  }
  return "Something went wrong while loading the news.";
}
