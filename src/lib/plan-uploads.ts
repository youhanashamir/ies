/**
 * Temporary server-side storage for PDF plans uploaded in chunks.
 *
 * The hosting CDN rejects request bodies larger than ~8 MB, so the browser
 * uploads each plan in small pieces to /api/bid-upload, then submits the bid
 * with only the upload ID. The pieces are joined here, attached to the email,
 * and deleted.
 */
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CHUNK_BYTES, MAX_PLAN_FILE_BYTES, MAX_PLAN_FILES, MAX_PLAN_TOTAL_BYTES } from "@/lib/plan-upload-limits";

export { CHUNK_BYTES, MAX_PLAN_FILE_BYTES, MAX_PLAN_FILES, MAX_PLAN_TOTAL_BYTES };
const UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

const ROOT = join(tmpdir(), "ies-plan-uploads");
const UPLOAD_ID_RE = /^[a-f0-9]{32}$/;

export type PlanManifestEntry = { name: string; size: number; chunks: number };

export const isValidUploadId = (id: string) => UPLOAD_ID_RE.test(id);

const uploadDir = (uploadId: string) => join(ROOT, uploadId);
const chunkPath = (uploadId: string, fileIndex: number, chunkIndex: number) =>
  join(uploadDir(uploadId), `${fileIndex}-${chunkIndex}.part`);

/** Total bytes already stored for an upload, used to enforce the overall size cap. */
async function storedBytes(uploadId: string) {
  try {
    const names = await readdir(uploadDir(uploadId));
    const sizes = await Promise.all(names.map((n) => stat(join(uploadDir(uploadId), n)).then((s) => s.size)));
    return sizes.reduce((a, b) => a + b, 0);
  } catch {
    return 0;
  }
}

export async function saveChunk(uploadId: string, fileIndex: number, chunkIndex: number, data: Uint8Array) {
  if (data.byteLength > CHUNK_BYTES) return { ok: false as const, error: "Upload chunk is too large." };
  if ((await storedBytes(uploadId)) + data.byteLength > MAX_PLAN_TOTAL_BYTES + CHUNK_BYTES) {
    return { ok: false as const, error: "The combined PDF plan upload must be 25 MB or smaller." };
  }
  await mkdir(uploadDir(uploadId), { recursive: true });
  await writeFile(chunkPath(uploadId, fileIndex, chunkIndex), data);
  return { ok: true as const };
}

/** Reassembles every file in the manifest. Fails if any chunk is missing or sizes disagree. */
export async function readUploadedPlans(uploadId: string, manifest: PlanManifestEntry[]) {
  const files: { name: string; data: Buffer }[] = [];
  for (const [fileIndex, entry] of manifest.entries()) {
    const parts: Buffer[] = [];
    for (let chunkIndex = 0; chunkIndex < entry.chunks; chunkIndex += 1) {
      try {
        parts.push(await readFile(chunkPath(uploadId, fileIndex, chunkIndex)));
      } catch {
        return { ok: false as const, error: `“${entry.name}” did not finish uploading. Please submit again.` };
      }
    }
    const data = Buffer.concat(parts);
    if (data.byteLength !== entry.size) {
      return { ok: false as const, error: `“${entry.name}” did not upload completely. Please submit again.` };
    }
    files.push({ name: entry.name, data });
  }
  return { ok: true as const, files };
}

export async function deleteUpload(uploadId: string) {
  await rm(uploadDir(uploadId), { recursive: true, force: true }).catch(() => undefined);
}

/** Removes uploads abandoned mid-way (closed tab, failed submit). */
export async function sweepStaleUploads() {
  try {
    const now = Date.now();
    for (const name of await readdir(ROOT)) {
      const info = await stat(join(ROOT, name)).catch(() => null);
      if (info && now - info.mtimeMs > UPLOAD_TTL_MS) await rm(join(ROOT, name), { recursive: true, force: true });
    }
  } catch {
    // Root folder does not exist yet.
  }
}

/** Validates the file list the browser sends with the final bid submission. */
export function parseManifest(raw: unknown): { ok: true; manifest: PlanManifestEntry[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "At least one PDF project plan is required. Upload working, building, electrical, MEP, or structural plans." };
  }
  if (raw.length > MAX_PLAN_FILES) return { ok: false, error: `Please upload ${MAX_PLAN_FILES} PDF files or fewer.` };
  const manifest: PlanManifestEntry[] = [];
  let total = 0;
  for (const item of raw) {
    const { name, size, chunks } = (item ?? {}) as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim() || name.length > 255) return { ok: false, error: "Invalid PDF file name." };
    if (typeof size !== "number" || !Number.isInteger(size) || size <= 0) return { ok: false, error: "Invalid PDF file size." };
    if (size > MAX_PLAN_FILE_BYTES) return { ok: false, error: "Each PDF plan file must be 15 MB or smaller." };
    if (chunks !== Math.ceil(size / CHUNK_BYTES)) return { ok: false, error: "Invalid upload. Please submit again." };
    total += size;
    // Content is checked for the %PDF- signature; make sure the attachment opens as a PDF too.
    const safeName = name.replace(/[\\/\r\n]/g, "_");
    manifest.push({ name: safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`, size, chunks });
  }
  if (total > MAX_PLAN_TOTAL_BYTES) return { ok: false, error: "The combined PDF plan upload must be 25 MB or smaller." };
  return { ok: true, manifest };
}
