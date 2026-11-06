import type { ReactNode } from "react";
import type { CategoryId } from "../content";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg className="glyph" viewBox="0 0 64 64" aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: "#142B44",
  strokeWidth: 1.7,
  strokeLinejoin: "miter" as const,
  strokeLinecap: "square" as const,
};

export function CategoryIcon({ id }: { id: CategoryId }) {
  if (id === "surveillance") {
    return (
      <Frame>
        <path {...stroke} d="M8 50V18h24v32" />
        <path {...stroke} d="M14 50V28h12v22" />
        <path {...stroke} d="M8 18h24" />
        <circle cx="44" cy="24" r="5" fill="none" stroke="#1688CE" strokeWidth="1.7" />
        <path d="M39 24H32" stroke="#1688CE" strokeWidth="1.7" />
        <path d="M44 19V12" stroke="#1688CE" strokeWidth="1.7" />
        <circle cx="44" cy="24" r="1.6" fill="#1688CE" />
      </Frame>
    );
  }
  if (id === "networking") {
    return (
      <Frame>
        <rect x="8" y="14" width="16" height="36" {...stroke} />
        <rect x="40" y="14" width="16" height="36" {...stroke} />
        <path d="M24 26h16M24 38h16" stroke="#DCE8F1" strokeWidth="1.7" />
        <path d="M24 32h16" stroke="#1688CE" strokeWidth="1.7" />
        <circle cx="32" cy="32" r="3.2" fill="#1688CE" />
      </Frame>
    );
  }
  if (id === "smart-home") {
    return (
      <Frame>
        <path {...stroke} d="M10 30 32 12l22 18v24H10V30z" />
        <path {...stroke} d="M26 54V38h12v16" />
        <circle cx="32" cy="30" r="3" fill="#1688CE" />
      </Frame>
    );
  }
  if (id === "access") {
    return (
      <Frame>
        <path {...stroke} d="M16 10h32v46H16z" />
        <path {...stroke} d="M32 10v46" />
        <path d="M16 10h32" stroke="#1688CE" strokeWidth="1.7" />
        <circle cx="38" cy="32" r="2.1" fill="#1688CE" />
      </Frame>
    );
  }
  return (
    <Frame>
      <path {...stroke} d="M8 18h48" />
      <path {...stroke} d="M32 18v8" />
      <circle cx="32" cy="38" r="10" {...stroke} />
      <circle cx="32" cy="38" r="2.5" fill="#1688CE" />
    </Frame>
  );
}

export function ArrowIcon() {
  return (
    <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8h12M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
