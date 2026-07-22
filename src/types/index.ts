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
    textAlign?: 'left' | 'center' | 'right';
    padding?: string;
    borderRadius?: string;
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

export interface CampaignAnalytics {
  campaign_id: number;
  subject: string;
  sent_date: string;
  total_opens: number;
  open_rate_growth: number;
  ctr: number;
  ctr_growth: number;
  conversion_rate: number;
  conversion_growth: number;
  bounce_rate: number;
  bounce_growth: number;
  engagement_trends: EngagementTrendPoint[];
}
