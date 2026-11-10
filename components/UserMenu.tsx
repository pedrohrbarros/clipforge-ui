"use client";

import { decodeProfile, setSession, useSession } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function UserMenu() {
  const t = useT();
  const session = useSession();
  const profile = session ? decodeProfile(session) : null;
  if (!profile) return null;
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
      <p className="font-display text-ink">{profile.name || profile.email}</p>
      <button
        type="button"
        onClick={() => setSession(null)}
        className="btn btn-quiet !py-2 text-xs"
      >
        {t("me.signout")}
      </button>
    </div>
  );
}
