export const INQUIRY_KINDS = ["wholesale", "business", "general"] as const;

export type InquiryKind = (typeof INQUIRY_KINDS)[number];

export type InquiryInput = {
  name: string;
  company: string;
  email: string;
  inquiryType: string;
  message: string;
};

export type InquiryField = "name" | "email" | "inquiryType" | "message";

export type InquiryErrors = Partial<Record<InquiryField, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateInquiry(input: InquiryInput): InquiryErrors {
  const errors: InquiryErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";
  if (!INQUIRY_KINDS.includes(input.inquiryType as InquiryKind)) {
    errors.inquiryType = "Select an inquiry type.";
  }
  if (message.length < 10) errors.message = "Enter a message of at least 10 characters.";

  return errors;
}

export function hasInquiryErrors(errors: InquiryErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function inquiryLabel(kind: string): string {
  switch (kind) {
    case "wholesale":
      return "Wholesale Purchasing";
    case "business":
      return "Business Sales";
    case "general":
      return "General Inquiry";
    default:
      return "";
  }
}

export const DEMO_SUCCESS = "Demo only—your message has not been sent.";
