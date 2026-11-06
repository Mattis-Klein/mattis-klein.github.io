import type { MouseEvent } from "react";

type LogoProps = {
  variant?: "color" | "mono";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function LogoMark({ variant = "color" }: LogoProps) {
  const ink = variant === "color" ? "#142B44" : "currentColor";
  const joint = variant === "color" ? "#1688CE" : "currentColor";
  return (
    <svg className="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
      <path fill={ink} d="M8 8h9v48H8z" />
      <path fill={ink} d="M47 8h9v48H47z" />
      <path fill={ink} d="M27.5 8h9v21h-9z" />
      <path fill={ink} d="M27.5 43h9v13h-9z" />
      <path fill={joint} d="M3 35h58v2H3z" />
      <circle fill={joint} cx="32" cy="36" r="8" />
    </svg>
  );
}

export function Logo({ variant = "color", onClick }: LogoProps) {
  return (
    <a className={`logo logo-${variant}`} href="#top" onClick={onClick}>
      <LogoMark variant={variant} />
      <span className="logo-type">
        <span className="logo-name">MHM</span>
        <span className="logo-global">Global</span>
      </span>
    </a>
  );
}
