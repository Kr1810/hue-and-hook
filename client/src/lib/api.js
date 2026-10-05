/**
 * Thin fetch wrappers for the Express API. Always relative URLs (/api/...):
 * Vite proxies them in dev, and Express serves both in production.
 */

export class ApiError extends Error {
  /**
   * @param {string} message  human-readable, safe to show in the UI
   * @param {number} status   HTTP status (0 = network failure)
   * @param {Record<string, string[]>} [details] per-field validation errors
   */
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || `Something went wrong (${response.status}).`,
      response.status,
      data?.error?.details
    );
  }
  return data;
}

export const api = {
  sendInquiry: (body) => request("/contact", { method: "POST", body }),
};
