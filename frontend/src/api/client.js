// Prefer same-origin (CRA proxy in dev). Fall back to explicit env var when set.
const DEFAULT_BASE = process.env.REACT_APP_API_BASE || "";

async function request(path, { method = "GET", body } = {}) {
  const url = `${DEFAULT_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.detail === "string") detail = data.detail;
    } catch (_) {
      // ignore
    }
    throw new Error(detail);
  }

  return res.json();
}

export const api = {
  health: () => request("/health"),
  suggestRole: (description) =>
    request("/suggest-role", { method: "POST", body: { description } }),
  listRoles: () => request("/roles"),
  requestAccess: (payload) =>
    request("/request-access", { method: "POST", body: payload }),
  listRequests: () => request("/requests"),
  updateRequestStatus: (id, status) =>
    request(`/requests/${id}/status`, { method: "PATCH", body: { status } })
};

