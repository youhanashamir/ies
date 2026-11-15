"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, Mail, Paperclip, X } from "lucide-react";
import { emailAppUrl, emailDraftFile, gmailComposeUrl, type EmailDraft } from "@/lib/email-draft";

export default function EmailDraftDialog({ draft, onClose }: { draft: EmailDraft | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !draft) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.close();
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [draft]);

  if (!draft) return null;

  const downloadDraft = () => {
    const blob = new Blob([emailDraftFile(draft)], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "international-estimating-email-draft.eml";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      setNotice("");
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice("Clipboard access is unavailable. You can select and copy the message below, or download the draft.");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="print-hide fixed inset-0 m-auto max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border hairline bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/55"
      aria-labelledby="email-draft-title"
      aria-describedby="email-draft-description"
      onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      data-lenis-prevent
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">International Estimating</p>
            <h2 id="email-draft-title" className="mt-2 text-2xl font-bold tracking-tight">Your email draft is ready</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close email draft" className="grid h-10 w-10 shrink-0 place-items-center border hairline text-muted hover:border-ink hover:text-ink"><X size={18} /></button>
        </div>
        <p id="email-draft-description" className="mt-3 text-sm leading-relaxed text-muted">Choose Gmail to compose in your browser, or use another email app. Preparing a draft does not send the email automatically.</p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <a href={gmailComposeUrl(draft)} target="_blank" rel="noopener noreferrer" className="btn-primary"><Mail size={15} />Open in Gmail<ExternalLink size={13} /></a>
          <a href={emailAppUrl(draft)} className="btn-ghost"><Mail size={15} />Other email app</a>
          <button type="button" onClick={downloadDraft} className="btn-ghost"><Download size={15} />Download draft</button>
          <button type="button" onClick={copyDraft} className="btn-ghost">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy draft"}</button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">Gmail may ask you to sign in. The downloaded .eml draft can be opened in a compatible desktop email app.</p>

        {Boolean(draft.attachmentNames?.length) && (
          <div className="mt-5 border-l-4 border-accent bg-accent/5 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Paperclip size={15} />Attach your files before sending</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Browser email links cannot attach files automatically. Add these files to your draft in Gmail or your email app:</p>
            <ul className="mt-2 space-y-1 text-[13px] font-medium">{draft.attachmentNames?.map((name, index) => <li key={`${name}-${index}`} className="break-all">{name}</li>)}</ul>
          </div>
        )}

        <dl className="mt-5 space-y-3 border-y hairline py-4 text-[13px]">
          <div className="grid gap-1 sm:grid-cols-[65px_1fr]"><dt className="font-semibold text-muted">To</dt><dd className="break-all font-medium">{draft.to}</dd></div>
          {draft.cc && <div className="grid gap-1 sm:grid-cols-[65px_1fr]"><dt className="font-semibold text-muted">Copy to</dt><dd className="break-all">{draft.cc}</dd></div>}
          <div className="grid gap-1 sm:grid-cols-[65px_1fr]"><dt className="font-semibold text-muted">Subject</dt><dd className="break-words font-semibold">{draft.subject}</dd></div>
        </dl>
        <pre className="mt-4 max-h-[36dvh] overflow-y-auto whitespace-pre-wrap break-words bg-bg p-4 font-sans text-[13px] leading-relaxed" data-lenis-prevent>{draft.body}</pre>
        {notice && <p role="status" className="mt-3 text-sm text-red-700">{notice}</p>}
      </div>
    </dialog>
  );
}
