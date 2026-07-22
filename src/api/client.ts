import { Contact, EmailTemplate, Campaign, CampaignAnalytics } from '../types';

const API_BASE = '/api/v1';

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${API_BASE}/contacts`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function importManualContacts(raw_text: string) {
  const res = await fetch(`${API_BASE}/contacts/import-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text }),
  });
  if (!res.ok) throw new Error('Failed to import contacts');
  return res.json();
}

export async function fetchTemplates(): Promise<EmailTemplate[]> {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function createTemplate(data: { name: string; subject_line: string; content_json: string; category?: string }) {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${API_BASE}/campaigns`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function createCampaign(data: { subject: string; category_label: string; scheduled_time?: string }) {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  return res.json();
}

export async function launchCampaign(campaign_id: number, schedule_option: 'immediate' | 'scheduled') {
  const res = await fetch(`${API_BASE}/campaigns/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaign_id, schedule_option }),
  });
  if (!res.ok) throw new Error('Failed to launch campaign');
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}

export async function fetchCampaignAnalytics(id: number): Promise<CampaignAnalytics> {
  const res = await fetch(`${API_BASE}/analytics/campaign/${id}`);
  if (!res.ok) throw new Error('Failed to fetch campaign analytics');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid login credentials');
  return res.json();
}

export async function signupUser(full_name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password }),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

export async function resetPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Reset password request failed');
  return res.json();
}
