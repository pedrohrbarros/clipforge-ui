export function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id="cf-upper">
          <polygon points="0,0 36,0 36,25 0,41" />
        </clipPath>
        <clipPath id="cf-lower">
          <polygon points="0,41 36,25 36,64 0,64" />
        </clipPath>
      </defs>
      <rect
        x="2"
        y="2"
        width="32"
        height="60"
        rx="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <polygon
        points="13,21 27,32 13,43"
        fill="#F2542D"
        clipPath="url(#cf-upper)"
      />
      <polygon
        points="13,21 27,32 13,43"
        fill="#F2542D"
        clipPath="url(#cf-lower)"
        transform="translate(2.5 1.5)"
      />
    </svg>
  );
}
