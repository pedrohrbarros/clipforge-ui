"use client";

import { useSyncExternalStore } from "react";

export const LANGS = { en: "English", pt: "Português", es: "Español" } as const;
export type Lang = keyof typeof LANGS;
export const LANG_KEY = "clipforge-lang";

type Dict = Record<string, string>;

const en: Dict = {
  "sidebar.show": "Show my videos",
  "sidebar.hide": "Hide my videos",
  "plan.label": "How many shorts, and how long?",
  "plan.count": "How many",
  "plan.of": "shorts of",
  "plan.min": "Minimum seconds",
  "plan.to": "to",
  "plan.max": "Maximum seconds",
  "plan.seconds": "seconds",
  "plan.remove": "Remove this row",
  "plan.add": "Add another length",
  "plan.total":
    "{n} of {max} shorts per video. {sec} seconds is the longest a short can be.",
  "mode.label": "What kind of shorts?",
  "mode.best": "Best moments",
  "mode.best.hint": "The AI picks the strongest moments anywhere in the video.",
  "mode.split": "Split into parts",
  "mode.split.hint":
    "The whole video, cut in order into parts of the lengths above.",
  "errors.bad_plan":
    "The shorts plan is invalid. Keep at most 10 shorts and 5 to 60 seconds each.",
  "errors.bad_mode": "Unknown shorts mode.",
  "aspect.label": "Shape",
  "aspect.9:16": "9:16 Shorts",
  "aspect.4:5": "4:5 Feed",
  "aspect.1:1": "1:1 Square",
  "aspect.16:9": "16:9 Wide",
  "history.new": "New video",
  "history.note": "Your videos stay here for 180 days.",
  "history.title": "Your videos",
  "history.empty":
    "Nothing yet. Your jobs will show up here, and you can come back any time to check on them.",
  "history.view": "View",
  "history.expired": "Links expired",
  "status.queued": "Queued",
  "status.transcribing": "Transcribing",
  "status.selecting": "Picking moments",
  "status.rendering": "Rendering",
  "status.done": "Done",
  "status.failed": "Failed",
  "resume.note":
    "A job of yours is still running; you can close this page and come back later.",
  "signin.body":
    "ClipForge uses your Google account to keep a fair daily limit and to remember your videos, so you can come back later to collect them.",
  "signin.title": "Sign in to make shorts",
  "signin.unconfigured": "Google sign-in is not configured on this site.",
  "me.left": "{n} of {limit} videos left today",
  "me.signout": "Sign out",
  "errors.daily_limit":
    "You have used your videos for today. It resets at midnight UTC.",
  "errors.unauthorized": "Your sign-in expired. Please sign in again.",
  "errors.auth_unconfigured": "Google sign-in is not configured on the server.",
  "theme.toggle": "Switch between dark and light theme",
  "lang.label": "Language",
  "usage.title": "Uses left today",
  "usage.chat": "Picking moments",
  "usage.whisper": "Transcribing",
  "usage.left": "{remaining} of {limit} left",
  "usage.na": "not available",
  "usage.resets": "Resets in {time}",
  "usage.aria": "{label}, {pct}% of today's uses left",
  "hero.title": "One long video in. Up to five shorts out.",
  "hero.body":
    "ClipForge listens to your video, finds the moments worth posting, and cuts them to 9:16 with captions burned in. Videos up to 10 minutes. Nothing is stored; results disappear after an hour.",
  captions: "Burn captions into each short",
  "btn.make": "Make shorts",
  "btn.uploading": "Uploading…",
  "btn.forging": "Forging…",
  sending: "Sending the file to the server…",
  "drop.title": "Drop a video here",
  "drop.sub": "or click to choose one",
  "drop.choose": "Choose a video",
  "drop.selected": "Selected {name}. Choose a different video",
  "drop.notVideo": "That is not a video file.",
  "drop.tooBig": "Videos must be under {mb} MB.",
  "steps.transcribing": "Transcribing the audio",
  "steps.selecting": "Picking the best moments",
  "steps.rendering": "Cutting and captioning",
  "results.one": "One short ready",
  "results.many": "{n} shorts ready",
  "results.downloadAll": "Download all",
  "results.again": "Start another",
  "results.noZip": "Too big for one file, download each short",
  "short.download": "Download",
  "errors.lostContact": "Lost contact with the server.",
  "errors.uploadFailed": "Upload failed.",
  "errors.quota": "The free AI quota is used up for now. Try again later.",
  "errors.auth": "The server's AI key is missing or invalid.",
  "errors.too_long": "This video is too long; the limit is 10 minutes.",
  "errors.no_speech": "No speech found in this video.",
  "errors.select_failed": "Could not pick moments, try again.",
  "errors.unreadable": "Could not read this video.",
  "errors.transcript_too_long":
    "The transcript is too long for the free tier. Try a shorter video.",
  "errors.ai_error": "The AI service returned an error, try again.",
  "errors.error": "Something went wrong, try again.",
  "errors.no_source": "Choose a video to upload.",
  "errors.too_big": "Videos must be under 500 MB.",
  "errors.expired": "This result expired, generate again.",
};

const pt: Dict = {
  "sidebar.show": "Mostrar meus vídeos",
  "sidebar.hide": "Ocultar meus vídeos",
  "plan.label": "Quantos shorts, e de que duração?",
  "plan.count": "Quantos",
  "plan.of": "shorts de",
  "plan.min": "Mínimo de segundos",
  "plan.to": "a",
  "plan.max": "Máximo de segundos",
  "plan.seconds": "segundos",
  "plan.remove": "Remover esta linha",
  "plan.add": "Adicionar outra duração",
  "plan.total":
    "{n} de {max} shorts por vídeo. {sec} segundos é o máximo de um short.",
  "mode.label": "Que tipo de shorts?",
  "mode.best": "Melhores momentos",
  "mode.best.hint":
    "A IA escolhe os momentos mais fortes em qualquer parte do vídeo.",
  "mode.split": "Dividir em partes",
  "mode.split.hint":
    "O vídeo inteiro, cortado em ordem em partes com as durações acima.",
  "errors.bad_plan":
    "O plano de shorts é inválido. No máximo 10 shorts, de 5 a 60 segundos cada.",
  "errors.bad_mode": "Tipo de shorts desconhecido.",
  "aspect.label": "Formato",
  "aspect.9:16": "9:16 Shorts",
  "aspect.4:5": "4:5 Feed",
  "aspect.1:1": "1:1 Quadrado",
  "aspect.16:9": "16:9 Largo",
  "history.new": "Novo vídeo",
  "history.note": "Seus vídeos ficam aqui por 180 dias.",
  "history.title": "Seus vídeos",
  "history.empty":
    "Nada ainda. Seus trabalhos aparecerão aqui, e você pode voltar quando quiser para conferir.",
  "history.view": "Ver",
  "history.expired": "Links expirados",
  "status.queued": "Na fila",
  "status.transcribing": "Transcrevendo",
  "status.selecting": "Escolhendo momentos",
  "status.rendering": "Renderizando",
  "status.done": "Concluído",
  "status.failed": "Falhou",
  "resume.note":
    "Um trabalho seu ainda está em andamento; você pode fechar esta página e voltar depois.",
  "signin.body":
    "O ClipForge usa sua conta Google para manter um limite diário justo e lembrar seus vídeos, para você voltar depois e buscá-los.",
  "signin.title": "Entre para criar shorts",
  "signin.unconfigured": "O login com Google não está configurado neste site.",
  "me.left": "{n} de {limit} vídeos restantes hoje",
  "me.signout": "Sair",
  "errors.daily_limit":
    "Você já usou seus vídeos de hoje. Renova à meia-noite UTC.",
  "errors.unauthorized": "Seu login expirou. Entre de novo.",
  "errors.auth_unconfigured":
    "O login com Google não está configurado no servidor.",
  "theme.toggle": "Alternar entre tema escuro e claro",
  "lang.label": "Idioma",
  "usage.title": "Usos restantes hoje",
  "usage.chat": "Momentos",
  "usage.whisper": "Transcrição",
  "usage.left": "{remaining} de {limit} restantes",
  "usage.na": "indisponível",
  "usage.resets": "Renova em {time}",
  "usage.aria": "{label}, {pct}% dos usos de hoje restantes",
  "hero.title": "Um vídeo longo entra. Até cinco shorts saem.",
  "hero.body":
    "O ClipForge ouve o seu vídeo, encontra os momentos que valem um post e corta em 9:16 com legendas gravadas. Vídeos de até 10 minutos. Nada é armazenado; os resultados somem após uma hora.",
  captions: "Gravar legendas em cada short",
  "btn.make": "Criar shorts",
  "btn.uploading": "Enviando…",
  "btn.forging": "Forjando…",
  sending: "Enviando o arquivo para o servidor…",
  "drop.title": "Solte um vídeo aqui",
  "drop.sub": "ou clique para escolher um",
  "drop.choose": "Escolher um vídeo",
  "drop.selected": "Selecionado {name}. Escolher outro vídeo",
  "drop.notVideo": "Isso não é um arquivo de vídeo.",
  "drop.tooBig": "Os vídeos precisam ter menos de {mb} MB.",
  "steps.transcribing": "Transcrevendo o áudio",
  "steps.selecting": "Escolhendo os melhores momentos",
  "steps.rendering": "Cortando e legendando",
  "results.one": "Um short pronto",
  "results.many": "{n} shorts prontos",
  "results.downloadAll": "Baixar todos",
  "results.again": "Começar outro",
  "results.noZip": "Grande demais para um arquivo só, baixe cada short",
  "short.download": "Baixar",
  "errors.lostContact": "Perdemos contato com o servidor.",
  "errors.uploadFailed": "Falha no envio.",
  "errors.quota":
    "A cota gratuita de IA acabou por enquanto. Tente mais tarde.",
  "errors.auth": "A chave de IA do servidor está ausente ou inválida.",
  "errors.too_long": "Este vídeo é longo demais; o limite é de 10 minutos.",
  "errors.no_speech": "Nenhuma fala encontrada neste vídeo.",
  "errors.select_failed": "Não foi possível escolher momentos, tente de novo.",
  "errors.unreadable": "Não foi possível ler este vídeo.",
  "errors.transcript_too_long":
    "A transcrição é longa demais para o plano gratuito. Tente um vídeo mais curto.",
  "errors.ai_error": "O serviço de IA retornou um erro, tente de novo.",
  "errors.error": "Algo deu errado, tente de novo.",
  "errors.no_source": "Escolha um vídeo para enviar.",
  "errors.too_big": "Os vídeos precisam ter menos de 500 MB.",
  "errors.expired": "Este resultado expirou, gere de novo.",
};

const es: Dict = {
  "sidebar.show": "Mostrar mis vídeos",
  "sidebar.hide": "Ocultar mis vídeos",
  "plan.label": "¿Cuántos shorts y de qué duración?",
  "plan.count": "Cuántos",
  "plan.of": "shorts de",
  "plan.min": "Segundos mínimos",
  "plan.to": "a",
  "plan.max": "Segundos máximos",
  "plan.seconds": "segundos",
  "plan.remove": "Quitar esta fila",
  "plan.add": "Añadir otra duración",
  "plan.total":
    "{n} de {max} shorts por vídeo. {sec} segundos es lo máximo que dura un short.",
  "mode.label": "¿Qué tipo de shorts?",
  "mode.best": "Mejores momentos",
  "mode.best.hint":
    "La IA elige los momentos más fuertes en cualquier parte del vídeo.",
  "mode.split": "Dividir en partes",
  "mode.split.hint":
    "El vídeo completo, cortado en orden en partes con las duraciones de arriba.",
  "errors.bad_plan":
    "El plan de shorts no es válido. Como máximo 10 shorts, de 5 a 60 segundos cada uno.",
  "errors.bad_mode": "Tipo de shorts desconocido.",
  "aspect.label": "Formato",
  "aspect.9:16": "9:16 Shorts",
  "aspect.4:5": "4:5 Feed",
  "aspect.1:1": "1:1 Cuadrado",
  "aspect.16:9": "16:9 Ancho",
  "history.new": "Nuevo vídeo",
  "history.note": "Tus vídeos se quedan aquí durante 180 días.",
  "history.title": "Tus vídeos",
  "history.empty":
    "Nada todavía. Tus trabajos aparecerán aquí y puedes volver cuando quieras a comprobarlos.",
  "history.view": "Ver",
  "history.expired": "Enlaces caducados",
  "status.queued": "En cola",
  "status.transcribing": "Transcribiendo",
  "status.selecting": "Eligiendo momentos",
  "status.rendering": "Renderizando",
  "status.done": "Listo",
  "status.failed": "Falló",
  "resume.note":
    "Un trabajo tuyo sigue en marcha; puedes cerrar esta página y volver más tarde.",
  "signin.body":
    "ClipForge usa tu cuenta de Google para mantener un límite diario justo y recordar tus vídeos, para que vuelvas luego a recogerlos.",
  "signin.title": "Inicia sesión para crear shorts",
  "signin.unconfigured":
    "El inicio de sesión con Google no está configurado en este sitio.",
  "me.left": "{n} de {limit} vídeos restantes hoy",
  "me.signout": "Cerrar sesión",
  "errors.daily_limit":
    "Ya usaste tus vídeos de hoy. Se renueva a medianoche UTC.",
  "errors.unauthorized": "Tu sesión caducó. Inicia sesión de nuevo.",
  "errors.auth_unconfigured":
    "El inicio de sesión con Google no está configurado en el servidor.",
  "theme.toggle": "Cambiar entre tema oscuro y claro",
  "lang.label": "Idioma",
  "usage.title": "Usos restantes hoy",
  "usage.chat": "Momentos",
  "usage.whisper": "Transcripción",
  "usage.left": "{remaining} de {limit} restantes",
  "usage.na": "no disponible",
  "usage.resets": "Se renueva en {time}",
  "usage.aria": "{label}, {pct}% de los usos de hoy restantes",
  "hero.title": "Entra un vídeo largo. Salen hasta cinco shorts.",
  "hero.body":
    "ClipForge escucha tu vídeo, encuentra los momentos que merecen publicarse y los corta en 9:16 con subtítulos grabados. Vídeos de hasta 10 minutos. No se guarda nada; los resultados desaparecen en una hora.",
  captions: "Grabar subtítulos en cada short",
  "btn.make": "Crear shorts",
  "btn.uploading": "Subiendo…",
  "btn.forging": "Forjando…",
  sending: "Enviando el archivo al servidor…",
  "drop.title": "Suelta un vídeo aquí",
  "drop.sub": "o haz clic para elegir uno",
  "drop.choose": "Elegir un vídeo",
  "drop.selected": "Seleccionado {name}. Elegir otro vídeo",
  "drop.notVideo": "Eso no es un archivo de vídeo.",
  "drop.tooBig": "Los vídeos deben pesar menos de {mb} MB.",
  "steps.transcribing": "Transcribiendo el audio",
  "steps.selecting": "Eligiendo los mejores momentos",
  "steps.rendering": "Cortando y subtitulando",
  "results.one": "Un short listo",
  "results.many": "{n} shorts listos",
  "results.downloadAll": "Descargar todos",
  "results.again": "Empezar otro",
  "results.noZip": "Demasiado grande para un solo archivo, descarga cada short",
  "short.download": "Descargar",
  "errors.lostContact": "Se perdió el contacto con el servidor.",
  "errors.uploadFailed": "La subida falló.",
  "errors.quota":
    "La cuota gratuita de IA se agotó por ahora. Inténtalo más tarde.",
  "errors.auth": "Falta la clave de IA del servidor o no es válida.",
  "errors.too_long":
    "Este vídeo es demasiado largo; el límite es de 10 minutos.",
  "errors.no_speech": "No se encontró voz en este vídeo.",
  "errors.select_failed": "No se pudieron elegir momentos, inténtalo de nuevo.",
  "errors.unreadable": "No se pudo leer este vídeo.",
  "errors.transcript_too_long":
    "La transcripción es demasiado larga para el plan gratuito. Prueba un vídeo más corto.",
  "errors.ai_error": "El servicio de IA devolvió un error, inténtalo de nuevo.",
  "errors.error": "Algo salió mal, inténtalo de nuevo.",
  "errors.no_source": "Elige un vídeo para subir.",
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
  const nav = (
    typeof navigator !== "undefined" ? navigator.language : "en"
  ).toLowerCase();
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

export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
) {
  let text = DICTS[lang][key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars))
      text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

export function useT() {
  const lang = useLang();
  return (key: string, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
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
  if (error instanceof ApiError) {
    if (error.code && en[`errors.${error.code}`])
      return translate(lang, `errors.${error.code}`);
    if (error.message) return error.message;
  }
  // Network failures and the like carry browser-language text; use our own instead.
  return translate(lang, fallbackKey);
}

/** Text for a failed job: translated by its code, falling back to the server's message. */
export function jobErrorText(lang: Lang, code: string, message: string) {
  return code && en[`errors.${code}`]
    ? translate(lang, `errors.${code}`)
    : message;
}
