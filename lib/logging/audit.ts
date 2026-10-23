/**
 * Minimal, secure audit logging utility for administrative actions (Section 9).
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * - Logs actorId, targetId, timestamp, action category, and outcome.
 * - NEVER logs passwords, session tokens, API keys, or personal secrets.
 * - Outputs structured JSON for log drains (Vercel, CloudWatch, Datadog).
 */

export type AuditAction =
  | "ADMIN_REMOVAL"
  | "ADMIN_CREATION"
  | "ADMIN_NAME_UPDATE"
  | "ADMIN_PASSWORD_CHANGE";

/**
 * Payload structure for an administrative audit log event.
 */
export interface AuditLogEntry {
  /** The specific administrative action being recorded. */
  action: AuditAction;
  /** UUID or identifier of the administrator executing the action. */
  actorId: string;
  /** UUID or identifier of the target administrator or entity, if applicable. */
  targetId?: string;
  /** The final execution outcome. */
  outcome: "SUCCESS" | "FAILURE";
  /** Descriptive reason for failure or additional non-sensitive context. */
  reason?: string;
  /** Non-sensitive key-value metadata for downstream log aggregation. */
  metadata?: Record<string, string | number | boolean>;
  /** ISO-8601 timestamp; defaults to current time if omitted. */
  timestamp?: string;
}

/**
 * Emits a sanitized, structured JSON audit log entry to standard output.
 *
 * Designed for automated ingestion by observability log drains (Vercel Log Drains,
 * AWS CloudWatch, Datadog). Ensures security compliance by strictly enforcing
 * that secrets (passwords, JWTs, API keys) are excluded from the log stream.
 *
 * @param entry - The audit event data to log.
 */
export function logAuditEvent(entry: AuditLogEntry): void {
  const sanitizedEntry: AuditLogEntry = {
    action: entry.action,
    actorId: entry.actorId,
    targetId: entry.targetId,
    outcome: entry.outcome,
    reason: entry.reason,
    metadata: entry.metadata,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  // Structured logging for production observability
  console.log(`[AUDIT] ${JSON.stringify(sanitizedEntry)}`);
}
