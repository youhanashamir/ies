export type EmailDraft = {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachmentNames?: string[];
};

function headerValue(value: string) {
  return value.replace(/[\r\n]/g, " ").trim();
}

/** Opens the browser-based Gmail composer; no default email application is needed. */
export function gmailComposeUrl(draft: EmailDraft) {
  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  url.searchParams.set("to", headerValue(draft.to));
  if (draft.cc) url.searchParams.set("cc", headerValue(draft.cc));
  url.searchParams.set("su", headerValue(draft.subject));
  url.searchParams.set("body", draft.body);
  return url.toString();
}

export function emailAppUrl(draft: EmailDraft) {
  const parts = [
    `subject=${encodeURIComponent(headerValue(draft.subject))}`,
    `body=${encodeURIComponent(draft.body)}`,
  ];
  if (draft.cc) parts.push(`cc=${encodeURIComponent(headerValue(draft.cc))}`);
  return `mailto:${encodeURIComponent(headerValue(draft.to))}?${parts.join("&")}`;
}

function utf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

/** A portable unsent .eml draft when Gmail or a mailto handler is unavailable. */
export function emailDraftFile(draft: EmailDraft) {
  const body = utf8Base64(draft.body).match(/.{1,76}/g)?.join("\r\n") ?? "";
  return [
    "X-Unsent: 1",
    `To: ${headerValue(draft.to)}`,
    ...(draft.cc ? [`Cc: ${headerValue(draft.cc)}`] : []),
    `Subject: =?UTF-8?B?${utf8Base64(headerValue(draft.subject))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    body,
    "",
  ].join("\r\n");
}
