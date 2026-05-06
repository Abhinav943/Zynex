import { describe, test, expect } from "vitest";
import { checkEmail } from "../index.js";

describe("EmailValidator", () => {
  describe(".checkSyntax()", () => {
    test("should pass for a valid email format", () => {
      const result = checkEmail("user@example.com").checkSyntax().execute();
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test("should fail for an invalid email format", () => {
      const result = checkEmail("invalid-email").checkSyntax().execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("invalid_syntax");
    });
  });

  describe(".checkTypos()", () => {
    test("should pass when no typo is detected in the domain", () => {
      const result = checkEmail("user@gmail.com").checkTypos().execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail and suggest correction when typo is detected", () => {
      const result = checkEmail("user@gamil.com").checkTypos().execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("possible_typo");
      expect(result.errors[0].suggestion).toBe("user@gmail.com");
    });
  });

  describe(".checkDisposable()", () => {
    test("should pass for a standard domain", () => {
      const result = checkEmail("user@gmail.com").checkDisposable().execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail for a known disposable domain", () => {
      const result = checkEmail("test@mailinator.com")
        .checkDisposable()
        .execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("disposable_email");
    });
  });

  describe(".checkRoleBased()", () => {
    test("should pass for a standard personal name", () => {
      const result = checkEmail("abhinav@example.com")
        .checkRoleBased()
        .execute();
      expect(result.isValid).toBe(true);
    });

    test("should fail for a role-based prefix", () => {
      const result = checkEmail("admin@example.com").checkRoleBased().execute();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("role_based_email");
    });
  });

  describe(".checkDNS() [ASYNC]", () => {
    test("should pass for a domain with active MX records", async () => {
      const result = await checkEmail("test@google.com")
        .checkDNS()
        .executeAsync();
      expect(result.isValid).toBe(true);
    });

    test("should fail for a non-existent domain", async () => {
      // Using a guaranteed fake domain
      const result = await checkEmail("test@thisdomaindoesnotexist12345.com")
        .checkDNS()
        .executeAsync();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].type).toBe("dns_mx_error");
    });
  });
});
