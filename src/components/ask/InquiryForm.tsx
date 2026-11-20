"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, CheckCircle2, Mail, Paperclip, TriangleAlert, X } from "lucide-react";
import { generateRequestId } from "@/lib/calculator";
import EmailDraftDialog from "@/components/ui/EmailDraftDialog";
import type { EmailDraft } from "@/lib/email-draft";
import { CONTACT_EMAIL } from "@/lib/contact";

type InquiryResult = {
  inquiryId: string;
  delivered: boolean;
  clientNotified: boolean;
  configured: boolean;
  status: "sent" | "delivery-failed" | "not-configured" | "unknown";
};
type FieldErrors = Partial<Record<"fullName" | "email" | "subject" | "question" | "attachment" | "form", string>>;

const MAX_BYTES = 5 * 1024 * 1024;

function FieldShell({
  id,
  label,
  required = false,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-red-600">
          <TriangleAlert size={13} className="mt-0.5 flex-none" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export default function InquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [lastPayload, setLastPayload] = useState<{ subject: string; body: string } | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);

  const scrollToField = (id: string) => {
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const onFileChange = (file: File | null) => {
    if (!file) {
      setFileName("");
      setErrors((current) => {
        const next = { ...current };
        delete next.attachment;
        return next;
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((current) => ({ ...current, attachment: "Attachment must be 5 MB or smaller." }));
      const input = formRef.current?.elements.namedItem("attachment") as HTMLInputElement | null;
      if (input) input.value = "";
      setFileName("");
      scrollToField("attachment");
      return;
    }
    setFileName(file.name);
    setErrors((current) => {
      const next = { ...current };
      delete next.attachment;
      return next;
    });
  };

  const openPreparedEmail = (payload: { subject: string; body: string }) => {
    setEmailDraft({ ...payload, to: CONTACT_EMAIL, attachmentNames: fileName ? [fileName] : [] });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const question = String(data.get("question") ?? "").trim();

    const next: FieldErrors = {};
    if (!fullName) next.fullName = "Please enter your full name.";
    if (!email) next.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (!subject) next.subject = "Please enter a subject.";
    if (!question) next.question = "Please enter your question.";

    setErrors(next);
    const firstError = (["fullName", "email", "subject", "question"] as const).find((field) => next[field]);
    if (firstError) {
      scrollToField(firstError);
      return;
    }

    const inquiryId = generateRequestId().replace(/^IES-/, "INQ-");
    const attachmentNote = fileName ? `\n\nATTACHMENT TO ADD MANUALLY\n• ${fileName}` : "";
    const payload = {
      subject: `[${inquiryId}] ${subject}`,
      body: `INTERNATIONAL ESTIMATING — INQUIRY\nInquiry ID: ${inquiryId}\n\nName: ${fullName}\nEmail: ${email}\n\nQUESTION\n${question}${attachmentNote}`,
    };

    setLastPayload(payload);
    try {
      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      const json = (await response.json().catch(() => ({ ok: false, error: `The server could not process the request (error ${response.status}). You can still use Open Prepared Email.` }))) as { ok?: boolean; error?: string; inquiryId?: string; delivered?: boolean; clientNotified?: boolean; configured?: boolean; status?: InquiryResult["status"] };
      if (!response.ok || !json.ok) throw new Error(json.error || "Submission failed. You can still use Open Prepared Email.");
      const confirmedId = json.inquiryId ?? inquiryId;
      setLastPayload({
        subject: `[${confirmedId}] ${subject}`,
        body: payload.body.replace(`Inquiry ID: ${inquiryId}`, `Inquiry ID: ${confirmedId}`),
      });
      setResult({
        inquiryId: confirmedId,
        delivered: Boolean(json.delivered),
        clientNotified: Boolean(json.clientNotified),
        configured: Boolean(json.configured),
        status: json.status ?? "unknown",
      });
    } catch (error) {
      // Stay on the form so the user sees the real error and can retry or use the prepared email.
      setErrors({ form: error instanceof Error ? error.message : "Submission failed. You can still use Open Prepared Email." });
    }
  };

  if (result) {
    return (
      <>
      <div className="relative overflow-hidden border hairline bg-surface p-7 md:p-9">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-accent text-white"><CheckCircle2 size={18} /></span>
          <div>
            <p className="eyebrow">Inquiry prepared</p>
            <h3 className="mt-1 font-display text-[22px] font-bold tracking-tight">Your inquiry is ready to send.</h3>
          </div>
        </div>
        <div className="mt-6 border hairline bg-bg/50 p-5">
          <p className="eyebrow">Inquiry ID</p>
          <p className="mono-num mt-1 text-2xl font-semibold text-accent-ink">{result.inquiryId}</p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            {result.delivered
              ? "You and our team both received this inquiry with the same Inquiry ID. We will reply to the email you provided."
              : result.status === "delivery-failed"
                ? "We could not deliver your inquiry automatically. Open the prepared email below and send it to International Estimating. Keep this ID for future replies."
                : "Automatic email is not available right now. Open the prepared email below, attach any listed file manually, and send it to International Estimating. Keep this ID for future replies."}
          </p>
          <ul className="mt-4 space-y-1.5 text-[13px] text-muted">
            <li>• Company notified: {result.delivered ? "Yes" : "No (use prepared email)"}</li>
            <li>• Your confirmation email: {result.clientNotified ? "Sent" : "Not sent (use prepared email)"}</li>
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {lastPayload && (
            <button type="button" onClick={() => openPreparedEmail(lastPayload)} className="btn-primary"><Mail size={14} /> Open Prepared Email</button>
          )}
          <button type="button" onClick={() => { setResult(null); setFileName(""); setErrors({}); setEmailDraft(null); }} className="btn-ghost">Ask another question</button>
        </div>
      </div>
      <EmailDraftDialog draft={emailDraft} onClose={() => setEmailDraft(null)} />
      </>
    );
  }

  const fieldClass = (field: keyof FieldErrors) => `field ${errors[field] ? "!border-red-400" : ""}`;

  return (
    <>
    <form ref={formRef} onSubmit={onSubmit} className="border hairline bg-surface/70 p-6 md:p-8" noValidate>
      {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="mb-5 text-[13px] text-muted"><span className="mr-1 text-red-400">*</span>Required fields must be completed before an inquiry can be prepared.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="fullName" label="Full Name" required error={errors.fullName}>
          <input id="fullName" name="fullName" className={fieldClass("fullName")} aria-invalid={Boolean(errors.fullName)} placeholder="Your name" autoComplete="name" required />
        </FieldShell>
        <FieldShell id="email" label="Email Address" required error={errors.email}>
          <input id="email" name="email" type="email" className={fieldClass("email")} aria-invalid={Boolean(errors.email)} placeholder="you@company.com" autoComplete="email" required />
        </FieldShell>
        <FieldShell id="subject" label="Subject" required error={errors.subject}>
          <input id="subject" name="subject" className={fieldClass("subject")} aria-invalid={Boolean(errors.subject)} placeholder="e.g. Turnaround for a 40-sheet set" required />
        </FieldShell>
        <FieldShell id="question" label="Your Question" required error={errors.question} className="sm:col-span-2">
          <textarea id="question" name="question" className={`${fieldClass("question")} min-h-[150px]`} aria-invalid={Boolean(errors.question)} placeholder="Tell us about your project, scope, or question…" required />
        </FieldShell>
        <div className="sm:col-span-2">
          <span className="field-label">Attachment (Optional)</span>
          <label htmlFor="attachment" className={`flex cursor-pointer items-center justify-between gap-3 border border-dashed p-4 transition-colors ${errors.attachment ? "border-red-400 bg-red-500/10" : "hairline bg-bg/40 hover:border-accent"}`}>
            <span className="flex items-center gap-2 text-[14px] text-muted"><Paperclip size={15} />{fileName || "Attach a drawing, spec, or scope document (max 5 MB)"}</span>
            {fileName && <button type="button" onClick={(e) => { e.preventDefault(); const input = formRef.current?.elements.namedItem("attachment") as HTMLInputElement | null; if (input) input.value = ""; setFileName(""); }} className="text-muted hover:text-red-600" aria-label="Remove attachment"><X size={14} /></button>}
          </label>
          <input id="attachment" name="attachment" type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.zip,.dwg,.xlsx,.xls,.doc,.docx" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
          {errors.attachment && <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-600">{errors.attachment}</p>}
        </div>
      </div>
      {errors.form && <p role="alert" className="mt-5 border-l-4 border-red-400 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-700">{errors.form}</p>}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-5">
        <p className="text-[12.5px] text-muted">Your details are prepared locally. Use the email draft to send your inquiry; attach any selected file manually.</p>
        <div className="flex flex-wrap gap-3">
          {errors.form && lastPayload && (
            <button type="button" onClick={() => openPreparedEmail(lastPayload)} className="btn-ghost"><Mail size={14} /> Open Prepared Email</button>
          )}
          <button type="submit" className="btn-primary"><ArrowUpRight size={15} />Prepare Inquiry Email</button>
        </div>
      </div>
    </form>
    <EmailDraftDialog draft={emailDraft} onClose={() => setEmailDraft(null)} />
    </>
  );
}
