import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed Data Store
  const mockUser = {
    id: 1,
    full_name: "Jane Cooper",
    email: "jane@evergreen.com",
    company: "Evergreen Mail Org",
    is_active: true,
    created_at: new Date().toISOString()
  };

  let mockContacts = [
    { id: 1, email: "j.doe@marketing.com", first_name: "Jane", last_name: "Doe", company: "Horizon Media", status: "Valid", engagement_score: 5, last_activity: "Clicked 2m ago", created_at: new Date().toISOString() },
    { id: 2, email: "alex.smith@saas-growth.io", first_name: "Alex", last_name: "Smith", company: "SaaS Growth", status: "Valid", engagement_score: 4, last_activity: "Opened 45m ago", created_at: new Date().toISOString() },
    { id: 3, email: "mike@design.co", first_name: "Michael", last_name: "Design", company: "Creative Hub", status: "Duplicate", engagement_score: 2, last_activity: "Sent 2h ago", created_at: new Date().toISOString() },
    { id: 4, email: "sarah.k@techflow.net", first_name: "Sarah", last_name: "Kensley", company: "TechFlow", status: "Valid", engagement_score: 5, last_activity: "Opened 10m ago", created_at: new Date().toISOString() },
    { id: 5, email: "alex.m@techflow.io", first_name: "Alex", last_name: "Morgan", company: "TechFlow", status: "Valid", engagement_score: 5, last_activity: "Clicked 2m ago", created_at: new Date().toISOString() },
    { id: 6, email: "brian.t@logistics-plus.net", first_name: "Brian", last_name: "Thompson", company: "Logistics Plus", status: "Valid", engagement_score: 3, last_activity: "Sent 2h ago", created_at: new Date().toISOString() },
    { id: 7, email: "l.mendez@cloudware.com", first_name: "Lisa", last_name: "Mendez", company: "Cloudware", status: "Bounced", engagement_score: 1, last_activity: "Failed 1h ago", created_at: new Date().toISOString() }
  ];

  let mockTemplates = [
    {
      id: 1,
      name: "Welcome & Onboarding Series",
      description: "Sleek forest green template with hero banner and clear call-to-action.",
      subject_line: "Welcome to the future of growth.",
      category: "Newsletter",
      content_json: JSON.stringify([
        { id: "b1", type: "text", content: "Welcome to the future of growth.", styles: { color: "#002d1c", fontSize: "28px", fontWeight: "bold", textAlign: "center" } },
        { id: "b2", type: "text", content: "We're thrilled to have you join our sustainable marketing revolution. Start building your success today.", styles: { color: "#475569", fontSize: "16px", textAlign: "center" } },
        { id: "b3", type: "image", content: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", styles: { borderRadius: "8px", margin: "16px 0" } },
        { id: "b4", type: "button", content: "Get Started Now", styles: { backgroundColor: "#002d1c", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textAlign: "center" } }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  let mockCampaigns = [
    {
      id: 101,
      subject: "Q4 Product Launch Announcement",
      category_label: "PRODUCT NEWSLETTER",
      template_id: 1,
      status: "Sent",
      recipients_count: 42100,
      open_rate: 32.4,
      click_rate: 8.42,
      bounce_rate: 0.42,
      scheduled_time: "Sent Immediately",
      sent_date: "Oct 24, 2023 • 09:15 AM",
      created_at: new Date().toISOString()
    },
    {
      id: 102,
      subject: "Urgent: Account Verification Required",
      category_label: "SECURITY WARNING",
      template_id: 1,
      status: "Failed",
      recipients_count: 852,
      open_rate: 0.0,
      click_rate: 0.0,
      bounce_rate: 12.5,
      scheduled_time: "Send Immediately",
      sent_date: "Oct 23, 2023 • 04:30 PM",
      created_at: new Date().toISOString()
    },
    {
      id: 103,
      subject: "Weekly Growth Insights #42",
      category_label: "CONTENT DIGEST",
      template_id: 1,
      status: "Scheduled",
      recipients_count: 15000,
      open_rate: 0.0,
      click_rate: 0.0,
      bounce_rate: 0.0,
      scheduled_time: "Scheduled: Oct 30, 2023",
      sent_date: "Scheduled: Oct 30, 2023",
      created_at: new Date().toISOString()
    },
    {
      id: 104,
      subject: "Special Offer: 20% Off Annual Plans",
      category_label: "SALES CAMPAIGN",
      template_id: 1,
      status: "Sent",
      recipients_count: 112000,
      open_rate: 18.2,
      click_rate: 3.8,
      bounce_rate: 0.18,
      scheduled_time: "Sent Immediately",
      sent_date: "Oct 20, 2023 • 10:00 AM",
      created_at: new Date().toISOString()
    },
    {
      id: 105,
      subject: "Welcome to the Platform! (Day 1)",
      category_label: "AUTOMATION SEQUENCE",
      template_id: 1,
      status: "Active",
      recipients_count: 2450,
      open_rate: 64.5,
      click_rate: 14.2,
      bounce_rate: 0.05,
      scheduled_time: "Recurring • Ongoing",
      sent_date: "Recurring • Ongoing",
      created_at: new Date().toISOString()
    }
  ];

  // API Routes
  app.get("/api/v1/health", (req: Request, res: Response) => {
    res.json({ status: "online", engine: "Evergreen Mail Node-Express Bridge" });
  });

  // Auth
  app.post("/api/v1/auth/signup", (req: Request, res: Response) => {
    const { full_name, email } = req.body;
    res.json({
      access_token: "mock_jwt_token_evergreen_2026",
      token_type: "bearer",
      user: { ...mockUser, full_name: full_name || mockUser.full_name, email: email || mockUser.email }
    });
  });

  app.post("/api/v1/auth/login", (req: Request, res: Response) => {
    res.json({
      access_token: "mock_jwt_token_evergreen_2026",
      token_type: "bearer",
      user: mockUser
    });
  });

  app.post("/api/v1/auth/reset-password", (req: Request, res: Response) => {
    const { email } = req.body;
    res.json({ message: `Recovery link sent to ${email || "your email address"}` });
  });

  // Contacts
  app.get("/api/v1/contacts", (req: Request, res: Response) => {
    res.json(mockContacts);
  });

  app.post("/api/v1/contacts/import-manual", (req: Request, res: Response) => {
    const { raw_text } = req.body;
    const lines = (raw_text || "").split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
    let validCount = 0;
    let dupCount = 0;

    const newEntries = lines.map((email: string, i: number) => {
      const isDup = mockContacts.some(c => c.email.toLowerCase() === email.toLowerCase());
      if (isDup) dupCount++; else validCount++;
      const item = {
        id: mockContacts.length + i + 10,
        email,
        first_name: email.split("@")[0],
        last_name: "Imported",
        company: "External List",
        status: isDup ? "Duplicate" : "Valid",
        engagement_score: 5,
        last_activity: "Just Imported",
        created_at: new Date().toISOString()
      };
      return item;
    });

    mockContacts = [...newEntries, ...mockContacts];

    res.json({
      total_detected: lines.length,
      valid_count: validCount,
      duplicate_count: dupCount,
      invalid_count: 0,
      contacts: newEntries
    });
  });

  // Templates
  app.get("/api/v1/templates", (req: Request, res: Response) => {
    res.json(mockTemplates);
  });

  app.post("/api/v1/templates", (req: Request, res: Response) => {
    const { name, subject_line, content_json } = req.body;
    const newTmpl = {
      id: mockTemplates.length + 1,
      name: name || "New Evergreen Template",
      description: "Custom template created in Template Designer.",
      subject_line: subject_line || "Important update",
      category: "Custom",
      content_json: content_json || "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTemplates.push(newTmpl);
    res.json(newTmpl);
  });

  // Campaigns
  app.get("/api/v1/campaigns", (req: Request, res: Response) => {
    res.json(mockCampaigns);
  });

  app.post("/api/v1/campaigns", (req: Request, res: Response) => {
    const { subject, category_label, scheduled_time } = req.body;
    const newCamp = {
      id: mockCampaigns.length + 100,
      subject: subject || "New Marketing Blast",
      category_label: category_label || "PROMOTIONAL",
      template_id: 1,
      status: "Draft",
      recipients_count: 12450,
      open_rate: 0.0,
      click_rate: 0.0,
      bounce_rate: 0.0,
      scheduled_time: scheduled_time || "Send Immediately",
      sent_date: "Draft",
      created_at: new Date().toISOString()
    };
    mockCampaigns.unshift(newCamp);
    res.json(newCamp);
  });

  app.post("/api/v1/campaigns/launch", (req: Request, res: Response) => {
    const { campaign_id, schedule_option } = req.body;
    const camp = mockCampaigns.find(c => c.id === Number(campaign_id));
    if (camp) {
      camp.status = schedule_option === "immediate" ? "Sent" : "Scheduled";
      camp.sent_date = schedule_option === "immediate" ? "Oct 24, 2024 • 10:15 AM" : "Scheduled";
      camp.open_rate = 32.4;
      camp.click_rate = 8.42;
      res.json(camp);
    } else {
      res.status(404).json({ error: "Campaign not found" });
    }
  });

  // Analytics
  app.get("/api/v1/analytics/summary", (req: Request, res: Response) => {
    res.json({
      total_sent_30d: 124502,
      sent_growth_pct: 12.0,
      avg_open_rate: 24.8,
      open_rate_growth_pct: 2.4,
      avg_click_rate: 3.2,
      click_rate_change_pct: -0.8,
      avg_bounce_rate: 0.14,
      bounce_rate_status: "Stable"
    });
  });

  app.get("/api/v1/analytics/campaign/:id", (req: Request, res: Response) => {
    res.json({
      campaign_id: Number(req.params.id),
      subject: "Q4 Product Launch Announcement",
      sent_date: "Oct 24, 2024 at 10:15 AM",
      total_opens: 42891,
      open_rate_growth: 12.4,
      ctr: 8.42,
      ctr_growth: 3.1,
      conversion_rate: 2.15,
      conversion_growth: 0.8,
      bounce_rate: 0.42,
      bounce_growth: -2.4,
      engagement_trends: [
        { time: "10:00", opens: 1200, clicks: 450 },
        { time: "14:00", opens: 2800, clicks: 920 },
        { time: "18:00", opens: 5400, clicks: 1890 },
        { time: "22:00", opens: 8900, clicks: 3100 },
        { time: "02:00", opens: 11200, clicks: 4050 },
        { time: "06:00", opens: 12450, clicks: 4280 }
      ]
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Evergreen Mail Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
