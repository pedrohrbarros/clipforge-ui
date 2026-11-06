import { getSession, setSession } from "@/lib/auth";
import { ApiError } from "@/lib/i18n";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Quota = {
  limit_requests?: number | null;
  remaining_requests?: number | null;
  limit_tokens?: number | null;
  remaining_tokens?: number | null;
  limit_audio_seconds?: number | null;
  remaining_audio_seconds?: number | null;
  reset_requests?: string | null;
  reset_tokens?: string | null;
  reset_audio_seconds?: string | null;
  observed_at?: number | null;
};

export type Usage = { chat: Quota | null; whisper: Quota | null };

export type JobStatus =
  "queued" | "transcribing" | "selecting" | "rendering" | "done" | "failed";

export type Short = {
  index: number;
  title: string;
  start: number;
  end: number;
  duration: number;
  url: string | null; // signed storage link, or null when served by the API
  aspect?: string; // "9:16", "4:5", "1:1" or "16:9"
};

export type Job = {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  code: string;
  shorts: Short[];
  zip_url: string | null;
  stored: boolean;
  expired: boolean;
  created_at: string | null;
  finished_at: string | null;
};

export const RUNNING: JobStatus[] = [
  "queued",
  "transcribing",
  "selecting",
  "rendering",
];

export type Me = {
  email: string;
  name: string;
  used_today: number;
  limit: number;
  resets_at: string;
};

async function readError(res: Response): Promise<ApiError> {
  if (res.status === 401) setSession(null); // expired or revoked session
  try {
    const body = await res.json();
    const detail = body.detail;
    if (detail && typeof detail === "object")
      return new ApiError(detail.message, detail.code);
    return new ApiError(
      typeof detail === "string" ? detail : res.statusText,
      null,
    );
  } catch {
    return new ApiError(res.statusText, null);
  }
}

function auth(extra: HeadersInit = {}): HeadersInit {
  return { Authorization: `Bearer ${getSession() ?? ""}`, ...extra };
}

/** Fetch a media file from the API with the Authorization header (fallback without storage). */
export async function fetchMedia(path: string): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.blob();
}

/** Trigger a browser download of a blob under the given file name. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function checkHealth(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Exchange a Google credential for a ClipForge session (24 h) and remember it. */
export async function signInWithGoogle(credential: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw await readError(res);
  const { token } = await res.json();
  setSession(token);
}

export async function getMe(): Promise<Me> {
  const res = await fetch(`${API_URL}/me`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function getUsage(): Promise<Usage> {
  const res = await fetch(`${API_URL}/usage`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function listJobs(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/jobs`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export type JobOptions = {
  captions: boolean;
  plan: { count: number; min_seconds: number; max_seconds: number }[];
  mode: "best" | "split";
  aspect: string;
};

export async function createJob(
  file: File,
  options: JobOptions,
): Promise<string> {
  const form = new FormData();
  form.append("video", file);
  form.append("captions", String(options.captions));
  form.append("plan", JSON.stringify(options.plan));
  form.append("mode", options.mode);
  form.append("aspect", options.aspect);
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    body: form,
    headers: auth(),
  });
  if (!res.ok) throw await readError(res);
  const { id } = await res.json();
  return id;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`, { headers: auth() });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export const shortPath = (job: Job, short: Short) =>
  `/jobs/${job.id}/shorts/${short.index}`;
export const zipPath = (job: Job) => `/jobs/${job.id}/zip`;

/** Signed storage link, with Supabase's download hint when saving. */
export const downloadUrl = (url: string, filename: string) =>
  `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(filename)}`;
