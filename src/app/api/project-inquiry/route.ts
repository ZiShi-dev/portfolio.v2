import { parseFormRequest } from "@/lib/api/parse-form-request";
import { jsonResponse, serviceUnavailableResponse } from "@/lib/api/json-response";
import { logFormSecurityEvent } from "@/lib/security/audit-log";
import { checkEmailSubmissionLimit } from "@/lib/security/email-submission-limit";
import { createSubmissionFingerprint } from "@/lib/security/fingerprint";
import {
  checkProjectInquiryEmailDailyLimit,
  checkProjectInquiryIpDailyLimit,
} from "@/lib/security/project-inquiry-daily-limit";
import { parseProjectInquiryPayload } from "@/lib/project-inquiry/schema";
import {
  createProjectInquiry,
  getProjectInquiryByFingerprint,
} from "@/lib/project-inquiry/store";
import { getPublishedServiceById } from "@/lib/services/store";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { ValidationErrors } from "@/lib/validation-errors";

const FORM_KIND = "project_inquiry";

export async function POST(request: Request) {
  const parsedRequest = await parseFormRequest(request, FORM_KIND);
  if (!parsedRequest.ok) return parsedRequest.response;

  const { body, ip } = parsedRequest;
  const parsed = parseProjectInquiryPayload(body);

  if (!parsed.ok) {
    if (parsed.error === "honeypot") {
      logFormSecurityEvent(FORM_KIND, "accepted", ip, { honeypot: true });
      return jsonResponse({ ok: true }, 200);
    }
    const field = "field" in parsed ? parsed.field : undefined;
    logFormSecurityEvent(FORM_KIND, "validation_failed", ip, {
      error: parsed.error,
      ...(field ? { field } : {}),
    });
    return jsonResponse(
      {
        error: parsed.error,
        ...(field ? { field } : {}),
      },
      400
    );
  }

  let submissionData = parsed.data;
  if (submissionData.serviceId) {
    const service = await getPublishedServiceById(submissionData.serviceId);
    submissionData = {
      ...submissionData,
      serviceId: service?.id ?? null,
      serviceReference: service?.reference ?? null,
      source: service
        ? submissionData.source === "service-buy"
          ? "service-buy"
          : "service"
        : "start-project-page",
    };
  } else {
    submissionData = {
      ...submissionData,
      serviceReference: null,
      source:
        submissionData.source === "service" ||
        submissionData.source === "service-buy"
          ? "start-project-page"
          : submissionData.source,
    };
  }

  const fingerprint = createSubmissionFingerprint(
    ip,
    FORM_KIND,
    submissionData
  );

  const existing = await getProjectInquiryByFingerprint(fingerprint);
  if (existing) {
    logFormSecurityEvent(FORM_KIND, "duplicate", ip);
    return jsonResponse(
      { ok: true, stored: true, reference: existing.reference },
      200
    );
  }

  const ipDaily = await checkProjectInquiryIpDailyLimit(ip);
  if (!ipDaily.allowed) {
    logFormSecurityEvent(FORM_KIND, "rate_limited_daily_ip", ip);
    return jsonResponse(
      { error: ValidationErrors.dailyRateLimited },
      429,
      ipDaily.retryAfterSec
        ? { "Retry-After": String(ipDaily.retryAfterSec) }
        : undefined
    );
  }

  const emailDaily = await checkProjectInquiryEmailDailyLimit(
    submissionData.email
  );
  if (!emailDaily.allowed) {
    logFormSecurityEvent(FORM_KIND, "rate_limited_daily_email", ip);
    return jsonResponse(
      { error: ValidationErrors.dailyRateLimited },
      429,
      emailDaily.retryAfterSec
        ? { "Retry-After": String(emailDaily.retryAfterSec) }
        : undefined
    );
  }

  const emailLimit = checkEmailSubmissionLimit(submissionData.email);
  if (!emailLimit.allowed) {
    logFormSecurityEvent(FORM_KIND, "rate_limited_email", ip);
    return jsonResponse(
      { error: ValidationErrors.rateLimited },
      429,
      emailLimit.retryAfterSec
        ? { "Retry-After": String(emailLimit.retryAfterSec) }
        : undefined
    );
  }

  if (!isSupabaseServiceConfigured()) {
    return serviceUnavailableResponse();
  }

  const created = await createProjectInquiry({
    data: submissionData,
    fingerprint,
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  if (!created.ok) {
    logFormSecurityEvent(FORM_KIND, "persist_failed", ip);
    return serviceUnavailableResponse();
  }

  logFormSecurityEvent(
    FORM_KIND,
    created.duplicate ? "duplicate" : "sent",
    ip,
    { email_disabled: true }
  );
  return jsonResponse(
    {
      ok: true,
      stored: true,
      reference: created.inquiry.reference,
    },
    200
  );
}

export function GET() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
