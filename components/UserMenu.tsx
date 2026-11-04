"use client";

import type { Me } from "@/lib/api";
import { decodeProfile, setCredential, useCredential } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function UserMenu({ me }: { me: Me | null }) {
  const t = useT();
  const credential = useCredential();
  const profile = credential ? decodeProfile(credential) : null;
  if (!profile) return null;
  const left = me ? Math.max(0, me.limit - me.used_today) : null;
  return (
    <div className="flex items-center gap-3 text-sm">
      {profile.picture && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.picture}
          alt=""
          className="h-9 w-9 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="leading-tight">
        <p className="font-display text-ink">{profile.name || profile.email}</p>
        <p className="text-steel">
          {left == null
            ? profile.email
            : t("me.left", { n: left, limit: me!.limit })}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setCredential(null)}
        className="btn btn-quiet !py-2 text-xs"
      >
        {t("me.signout")}
      </button>
    </div>
  );
}
