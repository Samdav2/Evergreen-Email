export type ActivePage =
  | 'dashboard'
  | 'campaigns'
  | 'new_campaign'
  | 'templates'
  | 'audience'
  | 'history'
  | 'analytics'
  | 'recipients'
  | 'settings'
  | 'signup'
  | 'signin'
  | 'reset_password';

export interface User {
  id: number;
  full_name: string;
  email: string;
  company?: string;
}

export type ContactStatus = 'Valid' | 'Duplicate' | 'Invalid' | 'Unsubscribed' | 'Bounced';

export interface Contact {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  status: ContactStatus;
  engagement_score: number; // 1-5
  last_activity?: string;
  created_at: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'columns';
  content: string;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    padding?: string;
    borderRadius?: string;
    linkUrl?: string;
    altText?: string;
    alt?: string;
  };
}

export interface EmailTemplate {
  id: number;
  name: string;
  description: string;
  subject_line: string;
  category: string;
  content_json: string;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Active' | 'Sent' | 'Failed';

export interface Campaign {
  id: number;
  subject: string;
  category_label: string;
  template_id?: number;
  status: CampaignStatus;
  recipients_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  scheduled_time: string;
  sent_date: string;
  created_at: string;
}

export interface EngagementTrendPoint {
  time: string;
  opens: number;
  clicks: number;
}

export interface PaginatedContacts {
  items: Contact[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface DeviceBreakdown {
  device: string;
  percentage: number;
  count?: number;
}

export interface LocationBreakdown {
  location: string;
  percentage: number;
  count?: number;
}

export interface RecentActivityItem {
  id?: number;
  recipient_email: string;
  event_type: string;
  timestamp: string;
  device_type: string;
  location: string;
}

export interface CampaignAnalytics {
  campaign_id: number;
  subject: string;
  sent_date: string;
  total_sent?: number;
  total_delivered?: number;
  total_opens: number;
  open_rate?: number;
  open_rate_growth: number;
  total_clicks?: number;
  ctr: number;
  ctr_growth: number;
  conversion_rate: number;
  conversion_growth: number;
  bounce_rate: number;
  bounce_growth: number;
  engagement_trends: EngagementTrendPoint[];
  device_breakdown?: DeviceBreakdown[];
  location_breakdown?: LocationBreakdown[];
  recent_activity?: RecentActivityItem[];
}

