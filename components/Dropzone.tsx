"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

export const MAX_MB = 500;

type Props = {
  file: File | null;
  onFile: (file: File | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

export function Dropzone({ file, onFile, onError, disabled }: Props) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!candidate.type.startsWith("video/")) {
      onError(t("drop.notVideo"));
      return;
    }
    if (candidate.size > MAX_MB * 1024 * 1024) {
      onError(t("drop.tooBig", { mb: MAX_MB }));
      return;
    }
    onFile(candidate);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={file ? t("drop.selected", { name: file.name }) : t("drop.choose")}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) accept(e.dataTransfer.files[0]);
      }}
      className={[
        "phone relative flex items-center justify-center overflow-hidden text-center outline-none",
        "focus-visible:ring-4 focus-visible:ring-ember/40",
        over ? "border-ember bg-ember/5" : "border-ink",
        disabled ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      <input
        ref={input}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {preview ? (
        <video src={preview} muted playsInline className="h-full w-full object-cover" />
      ) : (
        <p className="px-8 font-display text-xl leading-snug text-ink">
          {t("drop.title")}
          <span className="mt-2 block font-body text-sm text-steel">{t("drop.sub")}</span>
        </p>
      )}
    </div>
  );
}
