import { describe, expect, it } from "vitest";
import { categories } from "../content";
import {
  DEMO_SUCCESS,
  hasInquiryErrors,
  inquiryLabel,
  validateInquiry,
} from "./inquiry";
import { buildScene } from "./sceneModel";

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

describe("hero scene", () => {
  it("places five separated supply points inside the drawing", () => {
    const scene = buildScene();
    expect(scene.hotspots).toHaveLength(5);
    expect(scene.width).toBeGreaterThan(200);
    expect(scene.height / scene.width).toBeGreaterThan(0.7);
    expect(scene.height / scene.width).toBeLessThan(1.35);

    for (const spot of scene.hotspots) {
      expect(spot.x).toBeGreaterThan(8);
      expect(spot.x).toBeLessThan(92);
      expect(spot.y).toBeGreaterThan(8);
      expect(spot.y).toBeLessThan(92);
    }

    const mobileWidth = 300;
    const mobileHeight = mobileWidth * (scene.height / scene.width);
    for (let i = 0; i < scene.hotspots.length; i += 1) {
      for (let j = i + 1; j < scene.hotspots.length; j += 1) {
        const a = scene.hotspots[i];
        const b = scene.hotspots[j];
        const dx = ((a.x - b.x) / 100) * mobileWidth;
        const dy = ((a.y - b.y) / 100) * mobileHeight;
        expect(Math.hypot(dx, dy)).toBeGreaterThan(46);
      }
    }
  });
});
