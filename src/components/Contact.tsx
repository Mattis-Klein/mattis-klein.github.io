import { useRef, useState, type FormEvent } from "react";
import {
  DEMO_SUCCESS,
  hasInquiryErrors,
  inquiryLabel,
  validateInquiry,
  type InquiryKind,
} from "../lib/inquiry";

type ContactProps = {
  inquiryType: InquiryKind | "";
  setInquiryType: (value: InquiryKind | "") => void;
  regarding: string;
  setRegarding: (value: string) => void;
};

export function Contact({ inquiryType, setInquiryType, regarding, setRegarding }: ContactProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateInquiry>>({});
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"ok" | "err" | "">("");
  const statusRef = useRef<HTMLDivElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validateInquiry({ name, company, email, inquiryType, message });
    setErrors(next);
    if (hasInquiryErrors(next)) {
      setStatusKind("err");
      setStatus("Some fields need attention before this inquiry can be previewed. Nothing was sent.");
      const first = (["name", "email", "inquiry-type", "message"] as const).find((id) => {
        if (id === "inquiry-type") return Boolean(next.inquiryType);
        return Boolean(next[id]);
      });
      if (first) document.getElementById(first)?.focus();
      return;
    }
    const label = inquiryLabel(inquiryType);
    const about = regarding ? ` regarding ${regarding}` : "";
    setStatusKind("ok");
    setStatus(`${DEMO_SUCCESS} The preview covered a ${label} inquiry${about}. Nothing was saved or delivered.`);
    setName("");
    setCompany("");
    setEmail("");
    setMessage("");
    window.setTimeout(() => statusRef.current?.focus(), 0);
  }

  return (
    <section className="section" id="contact" aria-labelledby="contact-title" data-scrub tabIndex={-1}>
      <div className="contact-arrive" aria-hidden="true">
        <span />
      </div>
      <div className="contact-grid">
        <div className="contact-sticky">
          <div className="contact-copy">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Contact
          </p>
          <h2 id="contact-title">
            <span className="mask">
              <span className="mask-inner">
                Inquire about the range<span className="dot">.</span>
              </span>
            </span>
          </h2>
          <p className="lede">
            Shape a purchasing or product question here. Direct contact details for MHM Global are still
            to be confirmed, so this form cannot deliver a message.
          </p>
          <dl className="confirm-list">
            <div>
              <dt>Address</dt>
              <dd>To be confirmed</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>To be confirmed</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>To be confirmed</dd>
            </div>
          </dl>
          <p className="quiet contact-note">
            Until those details are confirmed, use the preview to organize an inquiry. It stays in the
            browser.
          </p>
          </div>
        </div>

        <form className="inquiry" noValidate onSubmit={onSubmit}>
          <div className="demo-notice" role="note">
            <p className="demo-kicker">Demo only</p>
            <p>
              Submitting this form does not send, store, or deliver your message. It only previews how an
              inquiry would be structured.
            </p>
          </div>

          {regarding ? (
            <p className="regarding">
              Regarding: {regarding}
              <button type="button" onClick={() => setRegarding("")}>
                Remove
              </button>
            </p>
          ) : null}

          <div className="field-row">
            <div className="field">
              <label htmlFor="name">
                Name <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                value={name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.name ? (
                <p id="name-error" className="field-error">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="company">
                Company <span className="optional">(optional)</span>
              </label>
              <input
                id="company"
                name="company"
                autoComplete="organization"
                maxLength={160}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">
              Email <span className="req" aria-hidden="true">*</span>
              <span className="sr-only">required</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={160}
              value={email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? (
              <p id="email-error" className="field-error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="inquiry-type">
              Inquiry type <span className="req" aria-hidden="true">*</span>
              <span className="sr-only">required</span>
            </label>
            <select
              id="inquiry-type"
              name="inquiry-type"
              required
              value={inquiryType}
              aria-invalid={errors.inquiryType ? true : undefined}
              aria-describedby={errors.inquiryType ? "inquiry-type-error" : undefined}
              onChange={(event) => setInquiryType(event.target.value as InquiryKind | "")}
            >
              <option value="">Select an inquiry type</option>
              <option value="wholesale">Wholesale Purchasing</option>
              <option value="business">Business Sales</option>
              <option value="general">General Inquiry</option>
            </select>
            {errors.inquiryType ? (
              <p id="inquiry-type-error" className="field-error">
                {errors.inquiryType}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="message">
              Message <span className="req" aria-hidden="true">*</span>
              <span className="sr-only">required</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={2000}
              rows={5}
              value={message}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "message-error" : undefined}
              onChange={(event) => setMessage(event.target.value)}
            />
            {errors.message ? (
              <p id="message-error" className="field-error">
                {errors.message}
              </p>
            ) : null}
          </div>

          <div
            ref={statusRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className={status ? `form-status form-status-${statusKind}` : "form-status"}
          >
            {status}
          </div>

          <button className="btn btn-primary" type="submit">
            Preview inquiry
          </button>
        </form>
      </div>
    </section>
  );
}
