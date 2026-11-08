type RingMarkProps = {
  className?: string;
};

export function RingMark({ className }: RingMarkProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="78" fill="none" stroke="#142b44" strokeWidth="1.35" />
      <path
        data-arc=""
        d="M100 22a78 78 0 1 1-55 23"
        fill="none"
        stroke="#1688ce"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path data-cross="" d="M100 38v124M38 100h124" fill="none" stroke="#1688ce" strokeWidth="1" />
      <circle cx="100" cy="100" r="3.6" fill="#1688ce" />
      <g data-crops="" opacity="0">
        <path d="M14 28h18M14 28v18M168 28h18M186 28v18M14 172v18M14 190h18M186 172v18M168 190h18" stroke="#1688ce" strokeWidth="1.4" />
      </g>
    </svg>
  );
}
