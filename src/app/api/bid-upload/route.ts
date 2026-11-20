import { NextResponse } from "next/server";
import { CHUNK_BYTES, MAX_PLAN_FILE_BYTES, MAX_PLAN_FILES, isValidUploadId, saveChunk, sweepStaleUploads } from "@/lib/plan-uploads";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 25 MB in 4 MB chunks is at most ~25 requests per bid; allow a few retries/resubmits.
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_CHUNKS_PER_FILE = Math.ceil(MAX_PLAN_FILE_BYTES / CHUNK_BYTES);

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

/** Receives one piece of one PDF plan. See src/lib/plan-uploads.ts. */
export async function POST(req: Request) {
  if (!allowRequest(`bid-upload:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return json({ ok: false, error: "Too many uploads from this connection. Please try again in a few minutes." }, 429);
  }

  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > CHUNK_BYTES + 64 * 1024) {
    return json({ ok: false, error: "Upload chunk is too large." }, 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "Invalid upload." }, 400);
  }

  const uploadId = String(form.get("uploadId") ?? "");
  const fileIndex = Number(form.get("fileIndex"));
  const chunkIndex = Number(form.get("chunkIndex"));
  const chunk = form.get("chunk");

  if (
    !isValidUploadId(uploadId) ||
    !Number.isInteger(fileIndex) || fileIndex < 0 || fileIndex >= MAX_PLAN_FILES ||
    !Number.isInteger(chunkIndex) || chunkIndex < 0 || chunkIndex >= MAX_CHUNKS_PER_FILE ||
    !(chunk instanceof Blob) || chunk.size === 0
  ) {
    return json({ ok: false, error: "Invalid upload." }, 400);
  }

  const data = new Uint8Array(await chunk.arrayBuffer());
  if (chunkIndex === 0 && String.fromCharCode(...data.subarray(0, 5)) !== "%PDF-") {
    return json({ ok: false, error: "Only PDF plan files can be uploaded." }, 400);
  }

  const saved = await saveChunk(uploadId, fileIndex, chunkIndex, data);
  if (!saved.ok) return json({ ok: false, error: saved.error }, 413);

  if (chunkIndex === 0 && fileIndex === 0) void sweepStaleUploads();
  return json({ ok: true });
}
