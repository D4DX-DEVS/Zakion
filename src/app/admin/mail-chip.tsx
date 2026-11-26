// How the email to the team went for one enquiry or calculator lead: set when it was sent (see lib/notify.ts). Older entries have no note.
export function MailChip({ status }: { status?: string }) {
  if (!status) return null;
  if (status === "sent") return <span className="chip published" title="The team was emailed about this one">Emailed</span>;
  if (status === "not configured") return <span className="chip draft" title="Email sending is not set up yet, so only this list has it">Email not set up</span>;
  return <span className="chip draft" title={status}>Email failed</span>;
}
