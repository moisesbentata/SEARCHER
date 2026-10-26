// Allowlist of accounts that can view the private /dashboard.
// Add emails here (lowercase) to grant access. Not exposed to the client.
const ADMIN_EMAILS = new Set<string>([
  "hello.tracecheck.app@gmail.com",
  "moisesbenchoc@gmail.com",
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
