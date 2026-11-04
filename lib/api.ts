export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

export type JobStatus = "queued" | "transcribing" | "selecting" | "rendering" | "done" | "failed";

export type Short = { index: number; title: string; start: number; end: number; duration: number };

export type Job = {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  shorts: Short[];
};

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.detail === "string" ? body.detail : res.statusText;
  } catch {
    return res.statusText;
  }
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

export async function getUsage(): Promise<Usage> {
  const res = await fetch(`${API_URL}/usage`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createJob(file: File, captions: boolean): Promise<string> {
  const form = new FormData();
  form.append("video", file);
  form.append("captions", String(captions));
  const res = await fetch(`${API_URL}/jobs`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));
  const { id } = await res.json();
  return id;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export const shortUrl = (id: string, index: number, download = false) =>
  `${API_URL}/jobs/${id}/shorts/${index}${download ? "?download=1" : ""}`;

export const zipUrl = (id: string) => `${API_URL}/jobs/${id}/zip`;

export type YoutubeOption = { id: string; label: string };

export type YoutubeInfo = {
  title: string;
  duration: number | null;
  thumbnail: string | null;
  options: YoutubeOption[];
};

export type Download = {
  id: string;
  status: "queued" | "downloading" | "done" | "failed";
  progress: number;
  message: string;
  title: string;
  filename: string | null;
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export const getYoutubeInfo = (url: string) => postJson<YoutubeInfo>("/youtube/info", { url });

export const startYoutubeDownload = (url: string, option: string) =>
  postJson<{ id: string }>("/youtube/download", { url, option }).then((r) => r.id);

export async function getDownload(id: string): Promise<Download> {
  const res = await fetch(`${API_URL}/youtube/${id}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export const downloadFileUrl = (id: string) => `${API_URL}/youtube/${id}/file`;
