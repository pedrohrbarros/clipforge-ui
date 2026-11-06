"use client";

import { GoogleLogin } from "@react-oauth/google";
import { LogoMark } from "@/components/Logo";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { errorText, useLang, useT } from "@/lib/i18n";

export function SignIn() {
  const t = useT();
  const lang = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return (
    <section className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
      <LogoMark className="h-16 w-auto text-ink" />
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
        {t("signin.title")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-steel">{t("signin.body")}</p>
      <div className="mt-8">
        {configured ? (
          <GoogleLogin
            onSuccess={(res) => {
              if (!res.credential) return;
              setBusy(true);
              setError(null);
              signInWithGoogle(res.credential)
                .catch((e) =>
                  setError(errorText(lang, e, "errors.lostContact")),
                )
                .finally(() => setBusy(false));
            }}
            onError={() => undefined}
            shape="pill"
            text="continue_with"
          />
        ) : (
          <p className="text-sm text-ember-deep">{t("signin.unconfigured")}</p>
        )}
      </div>
      {busy && (
        <div className="mt-4">
          <Spinner />
        </div>
      )}
      {error && (
        <p className="mt-4 text-sm text-ember-deep" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
