"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  FileDown,
  FileText,
  FileUp,
  Loader2,
  Mail,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import {
  DRAWING_STATUS,
  ESTIMATING_SERVICES,
  PROJECT_TYPES,
  QUANTITY_BREAKDOWN,
  SYSTEMS,
} from "@/lib/content";
import {
  CURRENCIES,
  DEADLINES,
  EMPTY_BID,
  allSystemIds,
  autoSelectSystems,
  buildSummaryText,
  deadlineLabel,
  generateRequestId,
  parseArea,
  requestedBudgetLabel,
  serviceLabel,
  type BidFormState,
  type DeadlineId,
  type ProjectType,
  type ServiceId,
} from "@/lib/calculator";
import EmailDraftDialog from "@/components/ui/EmailDraftDialog";
import type { EmailDraft } from "@/lib/email-draft";
import { CONTACT_EMAIL } from "@/lib/contact";
import { CHUNK_BYTES, MAX_PLAN_FILE_BYTES, MAX_PLAN_FILES, MAX_PLAN_TOTAL_BYTES } from "@/lib/plan-upload-limits";



/** Reads a JSON API response, turning proxy/CDN HTML error pages into a readable error. */
async function readJson<T>(response: Response): Promise<T & { ok?: boolean; error?: string }> {
  try {
    return (await response.json()) as T & { ok?: boolean; error?: string };
  } catch {
    if (response.status === 413) return { ok: false, error: "The upload was too large for the server. Please reduce the PDF size and try again." } as T & { ok?: boolean; error?: string };
    return { ok: false, error: `The server could not process the request (error ${response.status}). Please try again or use Prepare Email.` } as T & { ok?: boolean; error?: string };
  }
}

/**
 * Uploads every plan in small chunks so no single request exceeds the hosting
 * CDN's body size limit. Returns the upload ID the bid submission refers to.
 */
async function uploadPlansInChunks(plans: File[], onProgress: (fraction: number) => void) {
  const uploadId = crypto.randomUUID().replace(/-/g, "");
  const totalBytes = plans.reduce((sum, file) => sum + file.size, 0) || 1;
  let sentBytes = 0;
  const manifest = [];

  for (const [fileIndex, file] of plans.entries()) {
    const chunks = Math.ceil(file.size / CHUNK_BYTES);
    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex += 1) {
      const blob = file.slice(chunkIndex * CHUNK_BYTES, (chunkIndex + 1) * CHUNK_BYTES);
      const body = new FormData();
      body.append("uploadId", uploadId);
      body.append("fileIndex", String(fileIndex));
      body.append("chunkIndex", String(chunkIndex));
      body.append("chunk", blob, `${fileIndex}-${chunkIndex}.part`);

      let lastError = "";
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch("/api/bid-upload", { method: "POST", body });
          const data = await readJson<object>(response);
          if (response.ok && data.ok) { lastError = ""; break; }
          lastError = data.error || "Upload failed.";
          if (response.status !== 429 && response.status < 500) break;
        } catch {
          lastError = "Network error while uploading your PDF plans. Please check your connection and try again.";
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1000 * (attempt + 1)));
      }
      if (lastError) throw new Error(`${file.name}: ${lastError}`);

      sentBytes += blob.size;
      onProgress(sentBytes / totalBytes);
    }
    manifest.push({ name: file.name, size: file.size, chunks });
  }
  return { uploadId, manifest };
}

type SubmitResult = {
  id: string;
  delivered: boolean;
  clientNotified: boolean;
  configured: boolean;
  submittedAt: string;
};

type FieldErrors = Partial<Record<string, string>>;

function ContactStrip() {
  return (
    <div className="mt-6 flex flex-col gap-1 border-t hairline pt-4 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
      <a href={`mailto:${CONTACT_EMAIL}`} className="w-fit hover:text-accent">{CONTACT_EMAIL}</a>
      <span>Replies continue by email</span>
    </div>
  );
}

function FormSection({
  number,
  id,
  title,
  description,
  children,
}: {
  number: string;
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border hairline bg-surface/70 p-6 md:p-8">
      <div className="border-b hairline pb-4">
        <p className="eyebrow">Section {number}</p>
        <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight md:text-[25px]">{title}</h2>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-muted">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
      <ContactStrip />
    </section>
  );
}

function Field({
  id,
  label,
  required = false,
  error,
  children,
  hint,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error ? <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

function Choice({
  checked,
  onClick,
  label,
  note,
  radio = false,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  note?: string;
  radio?: boolean;
}) {
  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={checked}
      onClick={onClick}
      className={`flex w-full items-start gap-3 border p-4 text-left transition-colors ${checked ? "border-accent bg-accent/10" : "hairline hover:border-accent/60"}`}
    >
      <span className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center border ${radio ? "rounded-full" : ""} ${checked ? "border-accent bg-accent text-white" : "border-muted"}`}>
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-[14px] font-semibold leading-snug">{label}</span>
        {note && <span className="mt-1 block text-[12px] leading-snug text-muted">{note}</span>}
      </span>
    </button>
  );
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-2 text-[12.5px] font-medium text-red-600">{message}</p> : null;
}

export default function BidForm() {
  const [state, setState] = useState<BidFormState>(EMPTY_BID);
  const [plans, setPlans] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [draftId, setDraftId] = useState("");
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  // Honeypot: hidden from people; bots tend to fill every field.
  const [website, setWebsite] = useState("");
  const bidIdRef = useRef("");
  const planInputRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const projectArea = useMemo(() => parseArea(state.area), [state.area]);
  const summary = useMemo(() => buildSummaryText(state, result?.id || draftId), [state, result?.id, draftId]);

  const ensureBidId = () => {
    if (!bidIdRef.current) bidIdRef.current = generateRequestId();
    setDraftId(bidIdRef.current);
    return bidIdRef.current;
  };

  const setField = <K extends keyof BidFormState>(key: K, value: BidFormState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const scrollTo = (id: string) => {
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const selectPlans = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);
    const nonPdf = incoming.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (nonPdf) {
      setErrors((current) => ({ ...current, plans: `“${nonPdf.name}” is not a PDF. Please upload PDF plans only.` }));
      scrollTo("project-details");
      return;
    }
    const oversized = incoming.find((file) => file.size > MAX_PLAN_FILE_BYTES);
    if (oversized) {
      setErrors((current) => ({ ...current, plans: `“${oversized.name}” is larger than 15 MB.` }));
      scrollTo("project-details");
      return;
    }
    const combined = [...plans, ...incoming].filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size) === index);
    if (combined.length > MAX_PLAN_FILES) {
      setErrors((current) => ({ ...current, plans: `Please upload ${MAX_PLAN_FILES} PDF files or fewer. Combine sheets into fewer PDFs if needed.` }));
      scrollTo("project-details");
      return;
    }
    if (combined.reduce((total, file) => total + file.size, 0) > MAX_PLAN_TOTAL_BYTES) {
      setErrors((current) => ({ ...current, plans: "Combined PDF size cannot exceed 25 MB." }));
      scrollTo("project-details");
      return;
    }
    setPlans(combined);
    setErrors((current) => {
      const next = { ...current };
      delete next.plans;
      return next;
    });
    if (planInputRef.current) planInputRef.current.value = "";
  };

  const removePlan = (index: number) => setPlans((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const selectSystems = (ids: string[]) => {
    setField("systems", ids);
  };

  const toggleSystem = (id: string) => {
    selectSystems(state.systems.includes(id) ? state.systems.filter((item) => item !== id) : [...state.systems, id]);
  };

  const validate = () => {
    const next: FieldErrors = {};
    let section = "";
    if (!state.clientName.trim()) { next.clientName = "Enter the client name."; section ||= "project-details"; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { next.email = "Enter a valid email address."; section ||= "project-details"; }
    if (!state.projectName.trim()) { next.projectName = "Enter the project name."; section ||= "project-details"; }
    if (!state.projectType) { next.projectType = "Select a project type."; section ||= "project-details"; }
    if (!(projectArea > 0)) { next.area = "Enter the project area in square feet."; section ||= "project-details"; }
    if (!plans.length) { next.plans = "Working, building, electrical, MEP, or structural PDF plans are required."; section ||= "project-details"; }
    if (!state.service) { next.service = "Select an estimating service."; section ||= "service-budget"; }
    if (!state.requestedBudget.trim() || Number(state.requestedBudget) <= 0) { next.requestedBudget = "Enter a positive requested service budget."; section ||= "service-budget"; }
    if (!state.requestedBudgetCurrency) { next.requestedBudget = "Select a budget currency."; section ||= "service-budget"; }
    if (!state.systems.length) { next.systems = "Select at least one system."; section ||= "scope"; }
    if (!state.breakdown.length) { next.breakdown = "Choose one quantity breakdown format."; section ||= "scope"; }
    setErrors(next);
    if (section) scrollTo(section);
    return !section;
  };

  const buildPreparedEmail = (id: string): EmailDraft => {
    const planNames = plans.length ? plans.map((file) => `• ${file.name}`).join("\n") : "• No PDF plan selected";
    const clientEmail = state.email.trim();
    return {
      to: CONTACT_EMAIL,
      cc: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) && clientEmail.toLowerCase() !== CONTACT_EMAIL.toLowerCase() ? clientEmail : undefined,
      subject: `Bid request ${id} — ${state.projectName || "New project"}`,
      body: `${buildSummaryText(state, id)}\n\nPDF PLAN FILES TO ATTACH MANUALLY\n${planNames}`,
      attachmentNames: plans.map((file) => file.name),
    };
  };

  const openPreparedEmail = (id?: string) => {
    setEmailDraft(buildPreparedEmail(id || ensureBidId()));
  };

  const printBidSlip = () => {
    ensureBidId();
    window.requestAnimationFrame(() => window.print());
  };

  const submit = async () => {
    if (!validate()) return;
    const id = ensureBidId();
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("bid_id", id);
      form.append("state", JSON.stringify(state));
      form.append("website", website);
      if (!website) {
        setUploadProgress(0);
        const upload = await uploadPlansInChunks(plans, setUploadProgress);
        form.append("uploadId", upload.uploadId);
        form.append("plans_manifest", JSON.stringify(upload.manifest));
      }
      setUploadProgress(null);

      const response = await fetch("/api/bid-request", { method: "POST", body: form });
      const data = await readJson<{ requestId?: string; delivered?: boolean; clientNotified?: boolean; configured?: boolean; receivedAt?: string }>(response);
      if (!response.ok || !data.ok) throw new Error(data.error || "Submission failed. Please use Prepare Email instead.");

      bidIdRef.current = data.requestId ?? id;
      setDraftId(bidIdRef.current);
      setResult({
        id: bidIdRef.current,
        delivered: Boolean(data.delivered),
        clientNotified: Boolean(data.clientNotified),
        configured: Boolean(data.configured),
        submittedAt: data.receivedAt ?? new Date().toISOString(),
      });
      window.setTimeout(() => confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Submission failed. Please use Prepare Email instead." });
      scrollTo("review");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(state, ensureBidId()));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrors({ submit: "Clipboard access was blocked. Please use Prepare Email instead." });
    }
  };

  const startNew = () => {
    setState(EMPTY_BID);
    setPlans([]);
    setErrors({});
    setResult(null);
    setDraftId("");
    bidIdRef.current = "";
    setEmailDraft(null);
    if (planInputRef.current) planInputRef.current.value = "";
    scrollTo("project-details");
  };

  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
    </div>
  );

  const printableSlip = (
    <div className="print-only print-slip mx-auto max-w-3xl bg-white p-6 text-black">
      <p className="eyebrow">International Estimating — Bid Submission Slip</p>
      <p className="mt-2 text-2xl font-bold">{state.projectName || "Untitled project"}</p>
      <pre className="mt-6 whitespace-pre-wrap font-sans text-[12px] leading-relaxed">{summary}</pre>
      {plans.length > 0 && <p className="mt-4 text-[12px]">PDF plans: {plans.map((file) => file.name).join(", ")}</p>}
    </div>
  );

  if (result) {
    return (
      <>
      <div ref={confirmationRef} className="print-hide border border-accent/50 bg-surface p-6 text-ink md:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center bg-accent text-white"><CheckCircle2 size={18} /></span>
          <div>
            <p className="eyebrow">Bid request confirmation</p>
            <h2 className="mt-1 font-display text-[25px] font-bold tracking-tight">{result.delivered ? "Your bid request was sent." : "Your bid request is prepared."}</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="border hairline bg-bg/50 p-5"><p className="eyebrow">Bid ID</p><p className="mono-num mt-2 text-[24px] font-semibold text-accent-ink">{result.id}</p><p className="mt-2 text-[12px] text-muted">Created {new Date(result.submittedAt).toLocaleString()}</p></div>
          <div className="border hairline bg-bg/50 p-5"><p className="eyebrow">Next step</p><p className="mt-2 text-[14px] leading-relaxed text-muted">{result.delivered ? "Your bid is in review. Our team will reply by email after reviewing your drawings, scope, and requested budget." : "The bid email was not sent. Use Prepare Email below to open a draft, attach your PDFs, and send it to International Estimating."}</p></div>
        </div>
        {result.delivered && <p className="mt-4 text-[13px] text-muted">{result.clientNotified ? "A confirmation with the same Bid ID has also been sent to your email address." : "Your client confirmation email was not sent. You can keep a copy using the options below."}</p>}
        {errors.submit && <ErrorText message={errors.submit} />}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={copySummary} className="btn-ghost">{copied ? <ClipboardCheck size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy Summary"}</button>
          <button type="button" onClick={printBidSlip} className="btn-ghost"><FileDown size={15} />Print Bid Slip</button>
          <button type="button" onClick={() => openPreparedEmail(result.id)} className="btn-primary"><Mail size={15} />Prepare Email</button>
          <button type="button" onClick={startNew} className="btn-ghost"><Pencil size={15} />New Request</button>
        </div>
      </div>
      {printableSlip}
      <EmailDraftDialog draft={emailDraft} onClose={() => setEmailDraft(null)} />
      </>
    );
  }

  return (
    <>
      {honeypot}
      <p className="print-hide mb-5 text-[13px] text-muted"><span className="mr-1 text-red-400">*</span>Fields marked with an asterisk are required before a bid request can be prepared.</p>
      <div className="print-hide space-y-6">
        <FormSection number="01" id="project-details" title="Client & Project Details" description="Tell us who you are and upload the working plans required for review.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="clientName" label="Client Name" required error={errors.clientName}><input id="clientName" className={`field ${errors.clientName ? "!border-red-400" : ""}`} value={state.clientName} onChange={(event) => setField("clientName", event.target.value)} /></Field>
            <Field id="companyName" label="Company Name"><input id="companyName" className="field" value={state.companyName} onChange={(event) => setField("companyName", event.target.value)} /></Field>
            <Field id="email" label="Email Address" required error={errors.email}><input id="email" type="email" className={`field ${errors.email ? "!border-red-400" : ""}`} value={state.email} onChange={(event) => setField("email", event.target.value)} /></Field>
            <Field id="phone" label="Phone Number"><input id="phone" type="tel" className="field" value={state.phone} onChange={(event) => setField("phone", event.target.value)} /></Field>
            <Field id="projectName" label="Project Name" required error={errors.projectName} className="sm:col-span-2"><input id="projectName" className={`field ${errors.projectName ? "!border-red-400" : ""}`} value={state.projectName} onChange={(event) => setField("projectName", event.target.value)} /></Field>
            <Field id="projectType" label="Project Type" required error={errors.projectType}><select id="projectType" className={`field ${errors.projectType ? "!border-red-400" : ""}`} value={state.projectType} onChange={(event) => setField("projectType", event.target.value as ProjectType | "")}><option value="">Select project type</option>{PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
            <Field id="projectLocation" label="Project Location"><input id="projectLocation" className="field" value={state.projectLocation} onChange={(event) => setField("projectLocation", event.target.value)} /></Field>
            <Field id="area" label="Project Area (Square Feet)" required error={errors.area}><input id="area" inputMode="decimal" className={`field mono-num ${errors.area ? "!border-red-400" : ""}`} value={state.area} onChange={(event) => setField("area", event.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4"><Field id="floors" label="Floors"><input id="floors" className="field mono-num" value={state.floors} onChange={(event) => setField("floors", event.target.value)} /></Field><Field id="sheets" label="Drawing Sheets"><input id="sheets" className="field mono-num" value={state.sheets} onChange={(event) => setField("sheets", event.target.value)} /></Field></div>
            <div className="sm:col-span-2">
              <p className="field-label">Working Plans & Drawings (PDF) <span className="text-red-400">*</span></p>
              <label htmlFor="plans" className={`flex cursor-pointer items-center justify-between gap-4 border border-dashed p-4 transition-colors ${errors.plans ? "border-red-400 bg-red-500/10" : "hairline bg-bg/40 hover:border-accent"}`}>
                <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-accent text-white"><FileUp size={16} /></span><span><span className="block text-[14px] font-semibold">Upload one or more PDF plan files</span><span className="block text-[12px] text-muted">Working, building, electrical, MEP, HVAC, plumbing, or structural plans · 15 MB each / 25 MB total</span></span></span>
                <span className="text-[13px] font-semibold text-accent">Choose files</span>
              </label>
              <input ref={planInputRef} id="plans" type="file" multiple accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectPlans(event.target.files)} />
              <ErrorText message={errors.plans} />
              {plans.length > 0 && <ul className="mt-3 divide-y divide-line border-y hairline">{plans.map((file, index) => <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3 py-2.5"><span className="flex min-w-0 items-center gap-2 text-[13px]"><FileText size={15} className="flex-none text-accent" /><span className="truncate">{file.name}</span><span className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span></span><button type="button" onClick={() => removePlan(index)} className="text-muted hover:text-red-600" aria-label={`Remove ${file.name}`}><X size={15} /></button></li>)}</ul>}
            </div>
          </div>
        </FormSection>

        <FormSection number="02" id="service-budget" title="Estimating Service & Requested Budget" description="Choose the service you need and share the budget you are requesting. Final fixed pricing is provided after review.">
          <p className="field-label">Estimating Service <span className="text-red-400">*</span></p>
          <div className={`grid gap-3 md:grid-cols-3 ${errors.service ? "border border-red-400 p-2" : ""}`} role="radiogroup">{ESTIMATING_SERVICES.map((service) => <Choice key={service.id} radio checked={state.service === service.id} onClick={() => setField("service", service.id as ServiceId)} label={service.label} note={service.note} />)}</div>
          <ErrorText message={errors.service} />
          <div className="mt-6 border-t hairline pt-5"><Field id="requestedBudget" label="Your Desired Service Budget" required error={errors.requestedBudget} hint="This is your requested budget only. Our team reviews the bid, PDFs, and scope before confirming the final fixed price."><div className="grid gap-3 sm:grid-cols-[220px_1fr]"><select id="requestedBudgetCurrency" className={`field mono-num ${errors.requestedBudget ? "!border-red-400" : ""}`} value={state.requestedBudgetCurrency} onChange={(event) => setField("requestedBudgetCurrency", event.target.value)}>{CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select><input id="requestedBudget" type="number" min="1" inputMode="decimal" className={`field mono-num ${errors.requestedBudget ? "!border-red-400" : ""}`} value={state.requestedBudget} onChange={(event) => setField("requestedBudget", event.target.value)} placeholder="Enter requested budget" /></div></Field></div>
        </FormSection>

        <FormSection number="03" id="scope" title="Scope, Systems & Deadline" description="Select the systems required for the estimate and tell us your preferred turnaround.">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="field-label !mb-0">Systems to Include <span className="text-red-400">*</span></p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => selectSystems(autoSelectSystems(state.service, state.projectType))} className="btn-primary btn-sm"><Sparkles size={13} />Auto-Select</button><button type="button" onClick={() => selectSystems(allSystemIds())} className="btn-ghost btn-sm">Select All</button><button type="button" onClick={() => selectSystems([])} className="btn-ghost btn-sm">Clear All</button></div></div>
          <div className={`mt-3 grid gap-2 sm:grid-cols-2 ${errors.systems ? "border border-red-400 p-2" : ""}`}>{SYSTEMS.map((system) => <Choice key={system.id} checked={state.systems.includes(system.id)} onClick={() => toggleSystem(system.id)} label={system.label} />)}</div><ErrorText message={errors.systems} />
          <div className="mt-6 grid gap-5 border-t hairline pt-5 md:grid-cols-2"><div><p className="field-label">Drawing Status</p><div className="space-y-2">{DRAWING_STATUS.map((status) => <Choice key={status} radio checked={state.drawingStatus === status} onClick={() => setField("drawingStatus", status)} label={status} />)}</div></div><div><p className="field-label">Preferred Deadline</p><div className="space-y-2">{DEADLINES.map((deadline) => <Choice key={deadline.id} radio checked={state.deadline === deadline.id} onClick={() => setField("deadline", deadline.id as DeadlineId)} label={deadline.label} note={deadline.note} />)}</div></div></div>
          <div className="mt-6 border-t hairline pt-5">
            <p className="field-label">Quantity Breakdown <span className="text-red-400">*</span></p>
            <p className="mb-3 text-[12px] text-muted">Choose one format for your estimate.</p>
            <div className={`grid gap-2 sm:grid-cols-2 ${errors.breakdown ? "border border-red-400 p-2" : ""}`} role="radiogroup" aria-label="Quantity breakdown">
              {QUANTITY_BREAKDOWN.map((item) => (
                <Choice key={item.id} radio checked={state.breakdown.includes(item.id)} onClick={() => setField("breakdown", [item.id])} label={item.label} note={item.note} />
              ))}
            </div>
            <ErrorText message={errors.breakdown} />
          </div>
        </FormSection>

        <FormSection number="04" id="notes" title="Special Client Instructions" description="Include scope requirements, inclusions or exclusions, delivery preferences, and any other project notes in one place.">
          <Field id="specialInstructions" label="Special Client Instructions (Optional)">
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              rows={6}
              className="field min-h-[160px] resize-y"
              value={state.specialInstructions}
              onChange={(event) => setField("specialInstructions", event.target.value)}
              placeholder="Add any scope requirements, inclusions or exclusions, delivery expectations, or project notes…"
            />
          </Field>
        </FormSection>

        <FormSection number="05" id="review" title="Review & Submit Project" description="Review your request. The requested budget is not final pricing; our team confirms final fixed pricing after review.">
          <div className="border hairline bg-bg/50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-display text-[18px] font-bold">{state.projectName || "Untitled project"}</p><span className="mono-num border border-accent/50 px-3 py-1 text-[12px] text-accent-ink">{draftId || "Bid ID assigned on submit"}</span></div><dl className="mt-4 divide-y divide-line text-[13px]"><div className="grid grid-cols-[150px_1fr] gap-3 py-2"><dt className="text-muted">Client</dt><dd>{state.clientName || "—"}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-2"><dt className="text-muted">Service</dt><dd>{serviceLabel(state.service)}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-2"><dt className="text-muted">Requested budget</dt><dd>{requestedBudgetLabel(state.requestedBudget, state.requestedBudgetCurrency)}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-2"><dt className="text-muted">PDF plans</dt><dd>{plans.length ? plans.map((file) => file.name).join(", ") : "Required — not selected"}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-2"><dt className="text-muted">Preferred deadline</dt><dd>{deadlineLabel(state.deadline)}</dd></div></dl></div>
          {errors.submit && <p role="alert" className="mt-4 border-l-4 border-red-400 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-700">{errors.submit}</p>}
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={copySummary} className="btn-ghost">{copied ? <ClipboardCheck size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy Summary"}</button><button type="button" onClick={printBidSlip} className="btn-ghost"><FileDown size={15} />Print Bid Slip</button><button type="button" onClick={() => openPreparedEmail()} className="btn-ghost"><Mail size={15} />Prepare Email</button><button type="button" onClick={submit} disabled={submitting} className="btn-primary">{submitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpRight size={15} />}{submitting ? (uploadProgress !== null ? `Uploading plans… ${Math.round(uploadProgress * 100)}%` : "Sending…") : "Submit Bid Request"}</button></div>
        </FormSection>
      </div>
      {printableSlip}
      <EmailDraftDialog draft={emailDraft} onClose={() => setEmailDraft(null)} />
    </>
  );
}
