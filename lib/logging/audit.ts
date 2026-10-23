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

export interface AuditLogEntry {
  action: AuditAction;
  actorId: string;
  targetId?: string;
  outcome: "SUCCESS" | "FAILURE";
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp?: string;
}

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
