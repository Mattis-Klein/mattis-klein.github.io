import { describe, expect, it } from "vitest";
import { categories } from "../content";
import {
  DEMO_SUCCESS,
  hasInquiryErrors,
  inquiryLabel,
  validateInquiry,
} from "./inquiry";
const valid = {
  name: "Amina Cole",
  company: "",
  email: "amina@example.com",
  inquiryType: "wholesale",
  message: "Looking for video doorbells and locks.",
};

describe("validateInquiry", () => {
  it("accepts a complete inquiry with no company", () => {
    expect(validateInquiry(valid)).toEqual({});
  });

  it("accepts an optional company", () => {
    expect(validateInquiry({ ...valid, company: "North Hall" })).toEqual({});
  });

  it("requires name, email, type, and message", () => {
    const errors = validateInquiry({
      name: " ",
      company: "",
      email: "not-an-email",
      inquiryType: "",
      message: "short",
    });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.inquiryType).toBeTruthy();
    expect(errors.message).toBeTruthy();
    expect(hasInquiryErrors(errors)).toBe(true);
  });

  it("trims whitespace before checking", () => {
    expect(
      validateInquiry({
        ...valid,
        name: "  Jo  ",
        email: "  jo@example.com  ",
        message: "  Need routers for a small office.  ",
      }),
    ).toEqual({});
  });

  it("rejects an unknown inquiry type", () => {
    expect(validateInquiry({ ...valid, inquiryType: "partnership" }).inquiryType).toBeTruthy();
  });
});

describe("inquiry labels", () => {
  it("uses the published type names", () => {
    expect(inquiryLabel("wholesale")).toBe("Wholesale Purchasing");
    expect(inquiryLabel("business")).toBe("Business Sales");
    expect(inquiryLabel("general")).toBe("General Inquiry");
  });

  it("keeps the exact demo sentence available to the form", () => {
    expect(DEMO_SUCCESS).toBe("Demo only—your message has not been sent.");
  });
});

describe("categories", () => {
  it("publishes the five supply groups", () => {
    expect(categories.map((category) => category.title)).toEqual([
      "Surveillance & Security",
      "Networking & Connectivity",
      "Smart Home Technology",
      "Access Control",
      "Life Safety",
    ]);
  });
});
