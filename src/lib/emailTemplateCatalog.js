// Complete email template catalog — includes Base44 platform templates + custom app templates
export const EMAIL_TEMPLATES = [
  // Platform templates (reserved — managed by Base44, shown read-only)
  { name: "PasswordReset", type: "platform", title: "Password Reset", category: "Authentication", description: "Sent when a user requests a password reset. Contains a secure reset link.", variables: ["action_url", "first_name", "app_name"] },
  { name: "UserInvite", type: "platform", title: "User Invite", category: "Authentication", description: "Sent when a user is invited to the app. Contains the invitation acceptance link.", variables: ["action_url", "first_name", "app_name"] },
  { name: "AccessApproved", type: "platform", title: "Access Approved", category: "Authentication", description: "Sent when a user's pending access request is approved.", variables: ["action_url", "first_name", "app_name"] },
  { name: "EmailVerification", type: "platform", title: "Email Verification", category: "Authentication", description: "Sent with an OTP code during sign-up to verify the user's email address.", variables: ["otp_code", "first_name", "app_name"] },

  // Custom app templates
  { name: "LeadFollowUp", type: "custom", title: "Lead Follow-Up", category: "Sales", description: "Automated follow-up email sent to leads to keep them engaged.", variables: ["first_name", "business_name"] },
  { name: "Welcome", type: "custom", title: "Welcome", category: "Onboarding", description: "Welcome new clients to the platform with key getting-started information.", variables: ["first_name", "app_name"] },
  { name: "LeadNotification", type: "custom", title: "Lead Notification", category: "Sales", description: "Internal notification sent when a new lead is captured through a website.", variables: ["lead_name", "lead_email", "service", "message"] },
  { name: "ProjectComplete", type: "custom", title: "Project Complete", category: "Operations", description: "Notify clients when their website project is complete and ready for review.", variables: ["first_name", "project_name", "preview_url"] },
  { name: "DeploymentSuccess", type: "custom", title: "Deployment Success", category: "Operations", description: "Notify clients when their website has been successfully deployed and is live.", variables: ["first_name", "site_url", "business_name"] },
  { name: "ComplianceAlert", type: "custom", title: "Compliance Alert", category: "Operations", description: "Alert about compliance issues detected on a deployed site that may affect search ranking.", variables: ["first_name", "site_url", "issues", "score"] },
  { name: "CampaignLaunch", type: "custom", title: "Campaign Launch", category: "Operations", description: "Notify about the status of a mass launch campaign with site counts and locations.", variables: ["first_name", "campaign_name", "sites_count", "locations"] },
  { name: "Newsletter", type: "custom", title: "Newsletter", category: "Marketing", description: "Monthly newsletter with platform updates, tips, and announcements.", variables: ["first_name", "content"] },
  { name: "WeeklyDigest", type: "custom", title: "Weekly Digest", category: "Analytics", description: "Weekly performance summary with visitor counts, leads, and top-performing sites.", variables: ["first_name", "total_visitors", "total_leads", "top_performer"] },
];

export const TEMPLATE_CATEGORIES = ["All", "Authentication", "Onboarding", "Sales", "Operations", "Marketing", "Analytics"];