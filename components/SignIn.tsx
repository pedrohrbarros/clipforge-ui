"use client";

import { GoogleLogin } from "@react-oauth/google";
import { LogoMark } from "@/components/Logo";
import { setCredential } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function SignIn() {
  const t = useT();
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
              if (res.credential) setCredential(res.credential);
            }}
            onError={() => undefined}
            shape="pill"
            text="continue_with"
          />
        ) : (
          <p className="text-sm text-ember-deep">{t("signin.unconfigured")}</p>
        )}
      </div>
    </section>
  );
}
