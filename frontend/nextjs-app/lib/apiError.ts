import type { ApiError } from "@/lib/api";
type T = (key: string) => string;

export function apiErrorMessage(err: unknown, t: T, fallbackKey: string): string {
  if (err && typeof err === "object" && "status" in err) {
    const e = err as ApiError;
    switch (e.status) {
      case 400:
        return t("errors.badRequest");
      case 401:
        return t("errors.unauthorized");
      case 403:
        return t("errors.forbidden");
      case 404:
        return t("errors.notFound");
      case 409:
        return t("errors.conflict");
      case 500:
        return t("errors.serverError");
      default:
        return t(fallbackKey);
    }
  }

  // Network errors often don't have an HTTP status.
  if (err instanceof Error) {
    return t("errors.network");
  }

  return t(fallbackKey);
}

