import { describe, test, expect } from "vitest";
import { checkURL } from "../url.js";

describe("URLValidator", () => {
  describe(".isValid()", () => {
    test("should pass for a properly formatted URL", () => {
      const result = checkURL("https://github.com").isValid().execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail for a malformed string", () => {
      const result = checkURL("not-a-valid-url").isValid().execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("invalid_url");
    });
  });

  describe(".requireHTTPS()", () => {
    test("should pass when the protocol is HTTPS", () => {
      const result = checkURL("https://github.com")
        .isValid()
        .requireHTTPS()
        .execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail when the protocol is HTTP", () => {
      const result = checkURL("http://github.com")
        .isValid()
        .requireHTTPS()
        .execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("insecure_protocol");
    });
  });

  describe(".allowedDomains()", () => {
    test("should pass when domain is in the allowed list", () => {
      const result = checkURL("https://github.com/Abhinav943")
        .isValid()
        .allowedDomains(["github.com", "linkedin.com"])
        .execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail when domain is not in the allowed list", () => {
      const result = checkURL("https://evil-phishing-site.com")
        .isValid()
        .allowedDomains(["github.com", "linkedin.com"])
        .execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("domain_not_allowed");
    });
  });

  describe(".checkDNS() [ASYNC]", () => {
    test("should pass when the hostname resolves successfully", async () => {
      const result = await checkURL("https://google.com")
        .isValid()
        .checkDNS()
        .executeAsync();
      expect(result.isValid).toBe(true);
    });

    test("should fail when the hostname does not exist", async () => {
      const result = await checkURL("https://thisdomaindoesnotexist12345.xyz")
        .isValid()
        .checkDNS()
        .executeAsync();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("dns_resolution_error");
    });
  });
});
