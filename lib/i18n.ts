"use client";

import { useSyncExternalStore } from "react";

export const LANGS = { en: "English", pt: "Português", es: "Español" } as const;
export type Lang = keyof typeof LANGS;
export const LANG_KEY = "clipforge-lang";

type Dict = Record<string, string>;

const en: Dict = {
  "theme.toggle": "Switch between dark and light theme",
  "lang.label": "Language",
  "usage.title": "Uses left today",
  "usage.chat": "Picking moments",
  "usage.whisper": "Transcribing",
  "usage.left": "{remaining} of {limit} left",
  "usage.na": "not available",
  "usage.checking": "Checking…",
  "usage.resets": "Resets in {time}",
  "usage.aria": "{label}, {pct}% of today's uses left",
  waking: "Waking the server. The free tier sleeps when idle, this takes up to a minute.",
  "hero.title": "One long video in. Up to five shorts out.",
  "hero.body":
    "ClipForge listens to your video, finds the moments worth posting, and cuts them to 9:16 with captions burned in. Videos up to 10 minutes. Nothing is stored; results disappear after an hour.",
  "link.label": "Or paste a YouTube link",
  "link.placeholder": "https://www.youtube.com/watch?v=…",
  "link.override": "The link will be used instead of {name}.",
  captions: "Burn captions into each short",
  "btn.make": "Make shorts",
  "btn.uploading": "Uploading…",
  "btn.forging": "Forging…",
  sending: "Sending the file to the server…",
  starting: "Starting…",
  "drop.title": "Drop a video here",
  "drop.sub": "click to choose one, or paste a YouTube link",
  "drop.choose": "Choose a video",
  "drop.selected": "Selected {name}. Choose a different video",
  "drop.notVideo": "That is not a video file.",
  "drop.tooBig": "Videos must be under {mb} MB.",
  "steps.downloading": "Fetching the video from YouTube",
  "steps.transcribing": "Transcribing the audio",
  "steps.selecting": "Picking the best moments",
  "steps.rendering": "Cutting and captioning",
  "results.one": "One short ready",
  "results.many": "{n} shorts ready",
  "results.downloadAll": "Download all",
  "results.again": "Start another",
  "short.download": "Download",
  "errors.lostContact": "Lost contact with the server.",
  "errors.uploadFailed": "Upload failed.",
  "errors.quota": "The free AI quota is used up for now. Try again later.",
  "errors.auth": "The server's AI key is missing or invalid.",
  "errors.too_long": "This video is too long; the limit is 10 minutes.",
  "errors.no_speech": "No speech found in this video.",
  "errors.select_failed": "Could not pick moments, try again.",
  "errors.unreadable": "Could not read this video.",
  "errors.youtube_blocked": "YouTube is blocking the server right now. Try uploading the file instead.",
  "errors.youtube_unavailable": "This video is private or unavailable.",
  "errors.youtube_failed": "Could not fetch this video from YouTube.",
  "errors.transcript_too_long": "The transcript is too long for the free tier. Try a shorter video.",
  "errors.ai_error": "The AI service returned an error, try again.",
  "errors.error": "Something went wrong, try again.",
  "errors.bad_url": "Paste a YouTube video link, like https://youtu.be/…",
  "errors.no_source": "Upload a video or paste a YouTube link.",
  "errors.too_big": "Videos must be under 500 MB.",
  "errors.expired": "This result expired, generate again.",
};

const pt: Dict = {
  "theme.toggle": "Alternar entre tema escuro e claro",
  "lang.label": "Idioma",
  "usage.title": "Usos restantes hoje",
  "usage.chat": "Momentos",
  "usage.whisper": "Transcrição",
  "usage.left": "{remaining} de {limit} restantes",
  "usage.na": "indisponível",
  "usage.checking": "Verificando…",
  "usage.resets": "Renova em {time}",
  "usage.aria": "{label}, {pct}% dos usos de hoje restantes",
  waking: "Acordando o servidor. O plano gratuito dorme quando ocioso, isso leva até um minuto.",
  "hero.title": "Um vídeo longo entra. Até cinco shorts saem.",
  "hero.body":
    "O ClipForge ouve o seu vídeo, encontra os momentos que valem um post e corta em 9:16 com legendas gravadas. Vídeos de até 10 minutos. Nada é armazenado; os resultados somem após uma hora.",
  "link.label": "Ou cole um link do YouTube",
  "link.placeholder": "https://www.youtube.com/watch?v=…",
  "link.override": "O link será usado no lugar de {name}.",
  captions: "Gravar legendas em cada short",
  "btn.make": "Criar shorts",
  "btn.uploading": "Enviando…",
  "btn.forging": "Forjando…",
  sending: "Enviando o arquivo para o servidor…",
  starting: "Iniciando…",
  "drop.title": "Solte um vídeo aqui",
  "drop.sub": "clique para escolher um, ou cole um link do YouTube",
  "drop.choose": "Escolher um vídeo",
  "drop.selected": "Selecionado {name}. Escolher outro vídeo",
  "drop.notVideo": "Isso não é um arquivo de vídeo.",
  "drop.tooBig": "Os vídeos precisam ter menos de {mb} MB.",
  "steps.downloading": "Buscando o vídeo no YouTube",
  "steps.transcribing": "Transcrevendo o áudio",
  "steps.selecting": "Escolhendo os melhores momentos",
  "steps.rendering": "Cortando e legendando",
  "results.one": "Um short pronto",
  "results.many": "{n} shorts prontos",
  "results.downloadAll": "Baixar todos",
  "results.again": "Começar outro",
  "short.download": "Baixar",
  "errors.lostContact": "Perdemos contato com o servidor.",
  "errors.uploadFailed": "Falha no envio.",
  "errors.quota": "A cota gratuita de IA acabou por enquanto. Tente mais tarde.",
  "errors.auth": "A chave de IA do servidor está ausente ou inválida.",
  "errors.too_long": "Este vídeo é longo demais; o limite é de 10 minutos.",
  "errors.no_speech": "Nenhuma fala encontrada neste vídeo.",
  "errors.select_failed": "Não foi possível escolher momentos, tente de novo.",
  "errors.unreadable": "Não foi possível ler este vídeo.",
  "errors.youtube_blocked": "O YouTube está bloqueando o servidor agora. Tente enviar o arquivo.",
  "errors.youtube_unavailable": "Este vídeo é privado ou está indisponível.",
  "errors.youtube_failed": "Não foi possível buscar este vídeo no YouTube.",
  "errors.transcript_too_long":
    "A transcrição é longa demais para o plano gratuito. Tente um vídeo mais curto.",
  "errors.ai_error": "O serviço de IA retornou um erro, tente de novo.",
  "errors.error": "Algo deu errado, tente de novo.",
  "errors.bad_url": "Cole um link de vídeo do YouTube, como https://youtu.be/…",
  "errors.no_source": "Envie um vídeo ou cole um link do YouTube.",
  "errors.too_big": "Os vídeos precisam ter menos de 500 MB.",
  "errors.expired": "Este resultado expirou, gere de novo.",
};

const es: Dict = {
  "theme.toggle": "Cambiar entre tema oscuro y claro",
  "lang.label": "Idioma",
  "usage.title": "Usos restantes hoy",
  "usage.chat": "Momentos",
  "usage.whisper": "Transcripción",
  "usage.left": "{remaining} de {limit} restantes",
  "usage.na": "no disponible",
  "usage.checking": "Comprobando…",
  "usage.resets": "Se renueva en {time}",
  "usage.aria": "{label}, {pct}% de los usos de hoy restantes",
  waking:
    "Despertando el servidor. El plan gratuito se duerme si está inactivo, tarda hasta un minuto.",
  "hero.title": "Entra un vídeo largo. Salen hasta cinco shorts.",
  "hero.body":
    "ClipForge escucha tu vídeo, encuentra los momentos que merecen publicarse y los corta en 9:16 con subtítulos grabados. Vídeos de hasta 10 minutos. No se guarda nada; los resultados desaparecen en una hora.",
  "link.label": "O pega un enlace de YouTube",
  "link.placeholder": "https://www.youtube.com/watch?v=…",
  "link.override": "Se usará el enlace en lugar de {name}.",
  captions: "Grabar subtítulos en cada short",
  "btn.make": "Crear shorts",
  "btn.uploading": "Subiendo…",
  "btn.forging": "Forjando…",
  sending: "Enviando el archivo al servidor…",
  starting: "Empezando…",
  "drop.title": "Suelta un vídeo aquí",
  "drop.sub": "haz clic para elegir uno, o pega un enlace de YouTube",
  "drop.choose": "Elegir un vídeo",
  "drop.selected": "Seleccionado {name}. Elegir otro vídeo",
  "drop.notVideo": "Eso no es un archivo de vídeo.",
  "drop.tooBig": "Los vídeos deben pesar menos de {mb} MB.",
  "steps.downloading": "Obteniendo el vídeo de YouTube",
  "steps.transcribing": "Transcribiendo el audio",
  "steps.selecting": "Eligiendo los mejores momentos",
  "steps.rendering": "Cortando y subtitulando",
  "results.one": "Un short listo",
  "results.many": "{n} shorts listos",
  "results.downloadAll": "Descargar todos",
  "results.again": "Empezar otro",
  "short.download": "Descargar",
  "errors.lostContact": "Se perdió el contacto con el servidor.",
  "errors.uploadFailed": "La subida falló.",
  "errors.quota": "La cuota gratuita de IA se agotó por ahora. Inténtalo más tarde.",
  "errors.auth": "Falta la clave de IA del servidor o no es válida.",
  "errors.too_long": "Este vídeo es demasiado largo; el límite es de 10 minutos.",
  "errors.no_speech": "No se encontró voz en este vídeo.",
  "errors.select_failed": "No se pudieron elegir momentos, inténtalo de nuevo.",
  "errors.unreadable": "No se pudo leer este vídeo.",
  "errors.youtube_blocked": "YouTube está bloqueando el servidor ahora mismo. Prueba a subir el archivo.",
  "errors.youtube_unavailable": "Este vídeo es privado o no está disponible.",
  "errors.youtube_failed": "No se pudo obtener este vídeo de YouTube.",
  "errors.transcript_too_long":
    "La transcripción es demasiado larga para el plan gratuito. Prueba un vídeo más corto.",
  "errors.ai_error": "El servicio de IA devolvió un error, inténtalo de nuevo.",
  "errors.error": "Algo salió mal, inténtalo de nuevo.",
  "errors.bad_url": "Pega un enlace de vídeo de YouTube, como https://youtu.be/…",
  "errors.no_source": "Sube un vídeo o pega un enlace de YouTube.",
  "errors.too_big": "Los vídeos deben pesar menos de 500 MB.",
  "errors.expired": "Este resultado caducó, genera de nuevo.",
};

const DICTS: Record<Lang, Dict> = { en, pt, es };

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && saved in LANGS) return saved as Lang;
  } catch {
    // no storage
  }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  return "en";
}

// A tiny external store so every component re-renders when the language changes.
// The server snapshot is English; the browser snapshot is detected after hydration.
let current: Lang | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Lang {
  if (current === null) current = detectLang();
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLang(lang: Lang) {
  current = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // no storage; the choice just will not persist
  }
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>) {
  let text = DICTS[lang][key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

export function useT() {
  const lang = useLang();
  return (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
}

export class ApiError extends Error {
  code: string | null;
  constructor(message: string, code: string | null) {
    super(message);
    this.code = code;
  }
}

/** Text for an API failure: the translated code when known, else the server's message. */
export function errorText(lang: Lang, error: unknown, fallbackKey: string) {
  if (error instanceof ApiError && error.code && en[`errors.${error.code}`]) {
    return translate(lang, `errors.${error.code}`);
  }
  if (error instanceof Error && error.message) return error.message;
  return translate(lang, fallbackKey);
}

/** Text for a failed job: translated by its code, falling back to the server's message. */
export function jobErrorText(lang: Lang, code: string, message: string) {
  return code && en[`errors.${code}`] ? translate(lang, `errors.${code}`) : message;
}
