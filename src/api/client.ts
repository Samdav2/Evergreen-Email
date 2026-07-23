import { Contact, EmailTemplate, Campaign, CampaignAnalytics, PaginatedContacts } from '../types';

const API_BASE = '/api/v1';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchContacts(page: number = 1, pageSize: number = 100): Promise<PaginatedContacts> {
  return request(`${API_BASE}/contacts?page=${page}&page_size=${pageSize}`);
}

export async function importManualContacts(raw_text: string) {
  return request(`${API_BASE}/contacts/import-manual`, {
    method: 'POST',
    body: JSON.stringify({ raw_text }),
  });
}

export async function uploadContactsFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_BASE}/contacts/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'File upload failed');
  }
  return res.json();
}

export async function fetchTemplates(): Promise<EmailTemplate[]> {
  return request(`${API_BASE}/templates`);
}

export async function createTemplate(data: { name: string; subject_line: string; content_json: string; category?: string }) {
  return request(`${API_BASE}/templates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  return request(`${API_BASE}/campaigns`);
}

export async function createCampaign(data: { subject: string; category_label: string; scheduled_time?: string; template_id?: number | null }) {
  return request(`${API_BASE}/campaigns`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function launchCampaign(campaign_id: number, schedule_option: 'immediate' | 'scheduled') {
  return request(`${API_BASE}/campaigns/launch`, {
    method: 'POST',
    body: JSON.stringify({ campaign_id, schedule_option }),
  });
}

export async function fetchAnalyticsSummary() {
  return request(`${API_BASE}/analytics/summary`);
}

export async function fetchCampaignAnalytics(id: number): Promise<CampaignAnalytics> {
  return request(`${API_BASE}/analytics/campaign/${id}`);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Invalid login credentials');
  }
  return res.json();
}

export async function signupUser(full_name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Signup failed');
  }
  return res.json();
}

export async function resetPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Reset password request failed');
  }
  return res.json();
}
