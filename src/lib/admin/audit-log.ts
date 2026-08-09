import { hashForAudit } from "@/lib/security/fingerprint";

type AdminAuditEvent =
  | "login_success"
  | "login_failed"
  | "login_blocked_allowlist"
  | "login_rate_limited"
  | "logout"
  | "mfa_challenge"
  | "mfa_success"
  | "mfa_failed"
  | "mfa_enroll_started"
  | "mfa_enroll_success"
  | "mfa_enroll_failed"
  | "password_change_success"
  | "password_change_failed"
  | "reviews_listed"
  | "about_stats_listed"
  | "about_stats_updated"
  | "about_stats_update_failed"
  | "social_links_listed"
  | "social_links_updated"
  | "social_links_update_failed"
  | "projects_listed"
  | "project_created"
  | "project_create_failed"
  | "project_updated"
  | "project_update_failed"
  | "project_deleted"
  | "project_uploaded"
  | "project_upload_failed"
  | "project_inquiries_listed"
  | "project_inquiry_updated"
  | "project_inquiry_deleted"
  | "review_updated"
  | "review_deleted"
  | "services_listed"
  | "services_reordered"
  | "service_created"
  | "service_create_failed"
  | "service_updated"
  | "service_update_failed"
  | "service_duplicated"
  | "service_deleted"
  | "engagements_listed"
  | "engagements_reordered"
  | "engagement_created"
  | "engagement_viewed"
  | "engagement_updated"
  | "engagement_archived"
  | "engagement_deleted";

export function logAdminAuthEvent(
  event: AdminAuditEvent,
  ip: string,
  extra?: Record<string, string | number | boolean>
) {
  console.info("[admin-auth]", {
    event,
    ip: hashForAudit(ip),
    ...extra,
  });
}
