const API_BASE = 'http://localhost:8000/api';

// Helper for fetch handling with graceful fallback to mock data if API is unreachable
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Endpoint ${endpoint} failed, fallback/error handling:`, err);
    throw err;
  }
}

// 1. CPSE API
export async function getCpses() {
  return await apiFetch('/cpses');
}

export async function createCpse(data) {
  return await apiFetch('/cpses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 2. Materials API & Search
export async function getMaterials(cpseId = 'all', search = '', category = 'ALL', status = 'ALL') {
  const params = new URLSearchParams();
  if (cpseId && cpseId !== 'all') params.append('cpse_id', cpseId);
  if (search) params.append('q', search);
  if (category && category !== 'ALL') params.append('category', category);
  if (status && status !== 'ALL') params.append('status', status);

  return await apiFetch(`/materials/search?${params.toString()}`);
}

export async function createMaterial(data) {
  return await apiFetch('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteMaterial(id) {
  return await apiFetch(`/materials/${id}`, {
    method: 'DELETE',
  });
}

// 3. CSV Material Upload API
export async function uploadMaterialsCsvFile(file, cpseId = 'ntpc') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/materials/upload?cpse_id=${cpseId}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return await res.json();
}

// 4. Standard Materials API
export async function getStandardMaterials() {
  return await apiFetch('/standard-materials');
}

export async function createStandardMaterial(data) {
  return await apiFetch('/standard-materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 5. Material Mappings API
export async function getMappings(status = 'ALL') {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  return await apiFetch(`/mappings?${params.toString()}`);
}

export async function updateMappingStatus(mappingId, status) {
  return await apiFetch(`/mappings/${mappingId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// 6. Approvals API
export async function getApprovals() {
  return await apiFetch('/approvals');
}

export async function submitApproval(mappingId, decision, comment, reviewedBy = 'Master Data Admin') {
  return await apiFetch('/approvals', {
    method: 'POST',
    body: JSON.stringify({
      mapping_id: mappingId,
      decision,
      comment,
      reviewed_by: reviewedBy,
    }),
  });
}

// 7. Dashboard Stats API
export async function getDashboardStats() {
  return await apiFetch('/dashboard/stats');
}

// 8. Audit Logs API
export async function getAuditLogs() {
  return await apiFetch('/audit-logs');
}
