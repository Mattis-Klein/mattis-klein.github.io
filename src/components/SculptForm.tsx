import { useId } from "react";
import type { CategoryId } from "../content";

type SculptFormProps = {
  id: CategoryId;
};

export function SculptForm({ id }: SculptFormProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className="sculpt" viewBox="0 0 220 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4eef6" />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#f7fbfe" />
          <stop offset="1" stopColor="#d5e4ef" />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7e5f0" />
          <stop offset="1" stopColor="#a9c0d2" />
        </linearGradient>
        <radialGradient id={`${uid}-glass`} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#d7f1ff" />
          <stop offset="42%" stopColor="#1688ce" />
          <stop offset="100%" stopColor="#0b3a58" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c5d7e6" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="168" rx="74" ry="14" fill="#142b44" opacity="0.08" />
      {id === "surveillance" ? <Camera uid={uid} /> : null}
      {id === "networking" ? <Network uid={uid} /> : null}
      {id === "smart-home" ? <Thermostat uid={uid} /> : null}
      {id === "access" ? <Lock uid={uid} /> : null}
      {id === "safety" ? <Detector uid={uid} /> : null}
    </svg>
  );
}

function Camera({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M34 92 78 112 78 146 34 126Z" fill={`url(#${uid}-side)`} />
      <path d="M78 112 168 78 168 116 78 150Z" fill={`url(#${uid}-front)`} />
      <path d="M34 92 124 58 168 78 78 112Z" fill={`url(#${uid}-top)`} />
      <path d="M34 92 124 58 168 78 78 112Z" fill="none" stroke="#142b44" strokeOpacity="0.28" strokeWidth="1.2" />
      <path d="M78 112 168 78 168 116 78 150Z" fill="none" stroke="#142b44" strokeOpacity="0.2" strokeWidth="1.1" />
      <circle cx="154" cy="104" r="20" fill="#10283c" />
      <circle cx="154" cy="104" r="16" fill={`url(#${uid}-glass)`} />
      <circle cx="148" cy="98" r="5" fill="#ffffff" opacity="0.55" />
      <circle cx="92" cy="78" r="3.2" fill="#1688ce" />
    </g>
  );
}

function Network({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M28 108 70 128 70 152 28 132Z" fill={`url(#${uid}-side)`} />
      <path d="M70 128 188 86 188 112 70 154Z" fill={`url(#${uid}-front)`} />
      <path d="M28 108 146 66 188 86 70 128Z" fill={`url(#${uid}-top)`} />
      <path d="M28 108 146 66 188 86 70 128Z" fill="none" stroke="#142b44" strokeOpacity="0.25" strokeWidth="1.2" />
      <path d="M86 124h18M110 118h18M134 112h18M158 106h16" stroke="#8eabbf" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="118" cy="96" r="5" fill="#1688ce" />
      <circle cx="116" cy="94" r="1.6" fill="#ffffff" opacity="0.8" />
    </g>
  );
}

function Thermostat({ uid }: { uid: string }) {
  return (
    <g>
      <ellipse cx="110" cy="128" rx="58" ry="22" fill={`url(#${uid}-side)`} />
      <ellipse cx="110" cy="112" rx="58" ry="22" fill={`url(#${uid}-rim)`} />
      <ellipse cx="110" cy="108" rx="46" ry="16" fill={`url(#${uid}-top)`} />
      <ellipse cx="110" cy="108" rx="46" ry="16" fill="none" stroke="#142b44" strokeOpacity="0.2" />
      <path d="M110 108 132 100" stroke="#1688ce" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="110" cy="108" r="3.4" fill="#1688ce" />
      <path d="M110 94v6M110 116v6M94 108h6M120 108h6" stroke="#8eabbf" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Lock({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M78 58 98 70 98 142 78 130Z" fill={`url(#${uid}-side)`} />
      <path d="M98 70 150 52 150 124 98 142Z" fill={`url(#${uid}-front)`} />
      <path d="M78 58 130 40 150 52 98 70Z" fill={`url(#${uid}-top)`} />
      <path d="M78 58 130 40 150 52 98 70Z" fill="none" stroke="#142b44" strokeOpacity="0.25" strokeWidth="1.2" />
      <circle cx="124" cy="96" r="14" fill="#10283c" />
      <circle cx="124" cy="96" r="10" fill={`url(#${uid}-glass)`} />
      <circle cx="121" cy="93" r="3" fill="#ffffff" opacity="0.45" />
      <path d="M150 96h16" stroke="#1688ce" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Detector({ uid }: { uid: string }) {
  return (
    <g>
      <ellipse cx="110" cy="132" rx="70" ry="24" fill={`url(#${uid}-side)`} />
      <ellipse cx="110" cy="118" rx="70" ry="24" fill={`url(#${uid}-rim)`} />
      <ellipse cx="110" cy="114" rx="52" ry="16" fill={`url(#${uid}-top)`} />
      <ellipse cx="110" cy="114" rx="28" ry="9" fill="none" stroke="#142b44" strokeOpacity="0.25" />
      <ellipse cx="110" cy="114" rx="52" ry="16" fill="none" stroke="#142b44" strokeOpacity="0.18" />
      <circle cx="110" cy="114" r="6" fill={`url(#${uid}-glass)`} />
      <path d="M110 100v6M110 122v6M96 114h6M118 114h6" stroke="#8eabbf" strokeWidth="1.7" strokeLinecap="round" />
    </g>
  );
}
