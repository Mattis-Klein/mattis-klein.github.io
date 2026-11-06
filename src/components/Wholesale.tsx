import { ArrowIcon } from "./Icons";

type WholesaleProps = {
  onInquire: () => void;
};

export function Wholesale({ onInquire }: WholesaleProps) {
  return (
    <section className="section section-mist" id="wholesale" aria-labelledby="wholesale-title" data-reveal tabIndex={-1}>
      <div className="wholesale-grid">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Wholesale
          </p>
          <h2 id="wholesale-title">
            Your Business. Better Connected<span className="dot">.</span>
          </h2>
          <p className="lede">
            MHM Global welcomes commercial buyers and business purchasing inquiries for low-voltage
            technology. Describe what you need. Pricing, availability, and order details are handled in a
            direct conversation.
          </p>
          <p className="quiet">
            This page does not publish purchasing programs, order minimums, special pricing, or stock
            commitments.
          </p>
          <a
            className="btn btn-primary"
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              onInquire();
            }}
          >
            Contact Our Sales Team
            <ArrowIcon />
          </a>
        </div>
        <figure className="diagram">
          <svg viewBox="0 0 640 420" role="img" aria-label="Homes, businesses, and buildings sharing one supply line.">
            <rect x="36" y="286" width="568" height="22" fill="#F7F9FC" stroke="#DCE8F1" />
            <rect x="64" y="176" width="132" height="110" fill="#FFFFFF" stroke="#142B44" strokeWidth="1.6" />
            <path d="M80 214h28v22H80zM116 214h28v22H116zM152 214h28v22H152z" fill="#C9D8E6" />
            <path d="M80 186h28v18H80z" fill="#7EBFDF" />
            <path d="M152 186h28v18H152z" fill="#C9D8E6" />
            <rect x="246" y="118" width="156" height="168" fill="#FFFFFF" stroke="#142B44" strokeWidth="1.6" />
            <path d="M262 142h36v26h-36zM308 142h36v26h-36zM354 142h32v26h-32z" fill="#C9D8E6" />
            <path d="M262 178h36v26h-36zM308 178h36v26h-36z" fill="#C9D8E6" />
            <path d="M354 178h32v26h-32z" fill="#7EBFDF" />
            <path d="M262 214h36v26h-36zM308 214h36v26h-36zM354 214h32v26h-32z" fill="#C9D8E6" />
            <path d="M292 286v-40h32v40" fill="none" stroke="#142B44" strokeWidth="1.6" />
            <rect x="456" y="62" width="124" height="224" fill="#FFFFFF" stroke="#142B44" strokeWidth="1.6" />
            <path d="M472 84h30v26h-30zM512 84h30v26h-30zM552 84h12v26h-12z" fill="#C9D8E6" />
            <path d="M472 120h30v26h-30zM512 120h30v26h-30z" fill="#7EBFDF" />
            <path d="M552 120h12v26h-12zM472 156h30v26h-30zM512 156h30v26h-30zM552 156h12v26h-12z" fill="#C9D8E6" />
            <path d="M472 192h30v26h-30zM512 192h30v26h-30zM552 192h12v26h-12z" fill="#C9D8E6" />
            <path d="M492 286v-42h28v42" fill="none" stroke="#142B44" strokeWidth="1.6" />
            <path d="M40 286h560" stroke="#1688CE" strokeWidth="2.4" />
            <circle cx="324" cy="286" r="8" fill="#1688CE" />
            <text x="130" y="348" textAnchor="middle" className="diagram-label">
              Homes
            </text>
            <text x="324" y="348" textAnchor="middle" className="diagram-label">
              Businesses
            </text>
            <text x="518" y="348" textAnchor="middle" className="diagram-label">
              Buildings
            </text>
          </svg>
          <figcaption>Retail and wholesale supply, across the same kinds of spaces.</figcaption>
        </figure>
      </div>
    </section>
  );
}
