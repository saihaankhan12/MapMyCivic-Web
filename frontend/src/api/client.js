const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_STORAGE_KEY = "mapmycivic-token";

function getToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function buildHeaders(extraHeaders = {}, isJson = true) {
  const token = getToken();

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(options.headers, options.body instanceof FormData ? false : true),
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "Request failed.");
  }

  return response.json();
}

export const api = {
  TOKEN_STORAGE_KEY,
  getBootstrap() {
    return request("/api/bootstrap");
  },
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createNotice(payload) {
    return request("/api/notices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateIssueStatus(issueId, payload) {
    return request(`/api/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  updateIssueNotes(issueId, notes) {
    return request(`/api/issues/${issueId}/notes`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },
  async uploadIssueClip(issueId, clip) {
    const formData = new FormData();
    formData.append("clip", clip);

    const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}/cctv-clip`, {
      method: "POST",
      headers: buildHeaders({}, false),
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message ?? "Upload failed.");
    }

    return response.json();
  },
};
