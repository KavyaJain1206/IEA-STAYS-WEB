const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const API_ORIGIN = window.location.origin;

async function request(path, options = {}) {
  const { headers: requestHeaders, body, ...requestOptions } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    body,
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...requestHeaders,
    },
  });

  const rawBody = await response.text();
  let data = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = rawBody;
    }
  }

  if (!response.ok) {
    const message = data?.detail || "Something went wrong. Please try again.";
    throw new Error(Array.isArray(message) ? message[0]?.msg : message);
  }

  return data;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function resolveImageUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/uploads/")) {
    return `${API_ORIGIN}${src}`;
  }
  return src;
}

export function createVisitRequest(payload) {
  return request("/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signupResident(payload) {
  return request("/residents/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginResident(payload) {
  return request("/residents/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getResidentProfile(token) {
  return request("/residents/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function loginAdmin(payload) {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminProfile(token) {
  return request("/admin/me", {
    headers: authHeaders(token),
  });
}

export function listAdminVisits(token, params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  return request(`/admin/visits?${query.toString()}`, {
    headers: authHeaders(token),
  });
}

export function getAdminVisit(token, visitId) {
  return request(`/admin/visits/${visitId}`, {
    headers: authHeaders(token),
  });
}

export function updateAdminVisitStatus(token, visitId, payload) {
  return request(`/admin/visits/${visitId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function listAdminResidents(token, params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  return request(`/admin/residents?${query.toString()}`, {
    headers: authHeaders(token),
  });
}

export function getAdminResident(token, residentId) {
  return request(`/admin/residents/${residentId}`, {
    headers: authHeaders(token),
  });
}

export function updateAdminResidentStatus(token, residentId, payload) {
  return request(`/admin/residents/${residentId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function getCatalogCollections() {
  return request("/catalog/collections");
}

export function getCatalogHomes() {
  return request("/catalog/homes");
}

export function getHomepageContent() {
  return request("/homepage");
}

export function listHomepageSections() {
  return request("/homepage/sections/");
}

export function createHomepageSection(token, payload) {
  return request("/homepage/sections/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateHomepageSection(token, id, payload) {
  return request(`/homepage/sections/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteHomepageSection(token, id) {
  return request(`/homepage/sections/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function getAdminCatalogSummary(token) {
  return request("/admin/catalog/summary", {
    headers: authHeaders(token),
  });
}

export function listAdminCollections(token, params = {}) {
  const query = new URLSearchParams();
  if (params.includeInactive === false) {
    query.set("include_inactive", "false");
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request(`/admin/catalog/collections${suffix}`, {
    headers: authHeaders(token),
  });
}

export function getAdminCollection(token, collectionId) {
  return request(`/admin/catalog/collections/${collectionId}`, {
    headers: authHeaders(token),
  });
}

export function createAdminCollection(token, payload) {
  return request("/admin/catalog/collections", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function uploadAdminCatalogImage(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/admin/catalog/uploads/image", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
}

export function updateAdminCollection(token, collectionId, payload) {
  return request(`/admin/catalog/collections/${collectionId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCollection(token, collectionId) {
  return request(`/admin/catalog/collections/${collectionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function listAdminHomes(token, params = {}) {
  const query = new URLSearchParams();
  if (params.includeInactive === false) {
    query.set("include_inactive", "false");
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request(`/admin/catalog/homes${suffix}`, {
    headers: authHeaders(token),
  });
}

export function getAdminHome(token, homeId) {
  return request(`/admin/catalog/homes/${homeId}`, {
    headers: authHeaders(token),
  });
}

export function createAdminHome(token, payload) {
  return request("/admin/catalog/homes", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateAdminHome(token, homeId, payload) {
  return request(`/admin/catalog/homes/${homeId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminHome(token, homeId) {
  return request(`/admin/catalog/homes/${homeId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
