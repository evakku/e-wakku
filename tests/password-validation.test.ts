import { describe, it, expect } from "vitest";
import {
  validateAdminPassword,
  hasConsecutiveAscendingDigits,
  containsIdentityComponents,
  extractIdentityTokens,
  generateSecureAdminPassword,
  formatCredentialSharingMessage,
  getPasswordRuleChecklist,
} from "@/lib/validation/password";

describe("Admin Password Validation & Generator (Section 8 & 9)", () => {
  const identity = {
    name: "Anu Thomas",
    email: "anu.thomas@example.com",
  };

  describe("1. Length requirements", () => {
    it("rejects passwords with fewer than 8 characters", () => {
      const res = validateAdminPassword("Ab1!xyz");
      expect(res.valid).toBe(false);
      expect(res.rules.minLength).toBe(false);
      expect(res.errors).toContain("Password must be at least 8 characters long.");
    });

    it("accepts passwords with 8 or more characters", () => {
      const res = validateAdminPassword("Ab1!xyz8", identity);
      expect(res.rules.minLength).toBe(true);
    });
  });

  describe("2. Character composition requirements", () => {
    it("rejects password missing uppercase letter", () => {
      const res = validateAdminPassword("password1!a", identity);
      expect(res.rules.hasUppercase).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("rejects password missing lowercase letter", () => {
      const res = validateAdminPassword("PASSWORD1!A", identity);
      expect(res.rules.hasLowercase).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("rejects password missing number", () => {
      const res = validateAdminPassword("Password!A", identity);
      expect(res.rules.hasNumber).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("rejects password missing special character", () => {
      const res = validateAdminPassword("Password1A", identity);
      expect(res.rules.hasSpecial).toBe(false);
      expect(res.valid).toBe(false);
    });
  });

  describe("3. Consecutive ascending digits rule", () => {
    it("detects and rejects '123'", () => {
      expect(hasConsecutiveAscendingDigits("Secr123!Ab")).toBe(true);
      const res = validateAdminPassword("Secr123!Ab", identity);
      expect(res.rules.noConsecutiveAscendingDigits).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("detects and rejects '234'", () => {
      expect(hasConsecutiveAscendingDigits("Secr234!Ab")).toBe(true);
    });

    it("detects and rejects '567'", () => {
      expect(hasConsecutiveAscendingDigits("Secr567!Ab")).toBe(true);
    });

    it("detects and rejects '789'", () => {
      expect(hasConsecutiveAscendingDigits("Secr789!Ab")).toBe(true);
    });

    it("detects and rejects '012'", () => {
      expect(hasConsecutiveAscendingDigits("Secr012!Ab")).toBe(true);
    });

    it("detects and rejects longer ascending sequence '1234'", () => {
      expect(hasConsecutiveAscendingDigits("Secr1234!Ab")).toBe(true);
    });

    it("allows descending digits like '321' or '987'", () => {
      expect(hasConsecutiveAscendingDigits("Secr321!Ab")).toBe(false);
      expect(hasConsecutiveAscendingDigits("Secr987!Ab")).toBe(false);
    });

    it("allows identical digits like '111' or non-consecutive digits like '135'", () => {
      expect(hasConsecutiveAscendingDigits("Secr111!Ab")).toBe(false);
      expect(hasConsecutiveAscendingDigits("Secr135!Ab")).toBe(false);
    });
  });

  describe("4. Identity component exclusion rule", () => {
    it("extracts meaningful name and email tokens", () => {
      const tokens = extractIdentityTokens(identity);
      expect(tokens).toContain("anu");
      expect(tokens).toContain("thomas");
      expect(tokens).toContain("example");
      expect(tokens).not.toContain("com"); // Filtered TLD
    });

    it("rejects password containing first name (case-insensitive)", () => {
      expect(containsIdentityComponents("KeralAnu!92", identity)).toBe(true);
      expect(containsIdentityComponents("keralanu!92", identity)).toBe(true);
      expect(containsIdentityComponents("KeralANU!92", identity)).toBe(true);
      const res = validateAdminPassword("KeralAnu!92", identity);
      expect(res.rules.noIdentityComponents).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("rejects password containing last name (case-insensitive)", () => {
      expect(containsIdentityComponents("KeralThomas!92", identity)).toBe(true);
      expect(containsIdentityComponents("keralthomas!92", identity)).toBe(true);
      const res = validateAdminPassword("KeralThomas!92", identity);
      expect(res.rules.noIdentityComponents).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("rejects password containing custom domain name 'example'", () => {
      expect(containsIdentityComponents("MyExample#92A", identity)).toBe(true);
      const res = validateAdminPassword("MyExample#92A", identity);
      expect(res.rules.noIdentityComponents).toBe(false);
      expect(res.valid).toBe(false);
    });

    it("does not reject password merely for common TLD or generic provider words", () => {
      const genericEmailUser = {
        name: "Rahul Nair",
        email: "rahul@gmail.com",
      };
      // Password containing "com" should not trigger false positive:
      expect(containsIdentityComponents("Company#91A", genericEmailUser)).toBe(false);
    });
  });

  describe("5. Cryptographically secure password generation", () => {
    it("generates passwords that strictly satisfy all 7 conditions", () => {
      for (let i = 0; i < 20; i++) {
        const generated = generateSecureAdminPassword(identity);
        expect(generated.length).toBeGreaterThanOrEqual(8);
        const res = validateAdminPassword(generated, identity);
        expect(res.valid).toBe(true);
        expect(res.errors).toEqual([]);
      }
    });

    it("ensures generated password has no consecutive ascending digits and no identity tokens", () => {
      for (let i = 0; i < 20; i++) {
        const generated = generateSecureAdminPassword(identity);
        expect(hasConsecutiveAscendingDigits(generated)).toBe(false);
        expect(containsIdentityComponents(generated, identity)).toBe(false);
      }
    });
  });

  describe("6. Checklist helper", () => {
    it("provides accurate live checklist status", () => {
      const checklist = getPasswordRuleChecklist("Weak", identity);
      expect(checklist.find((c) => c.id === "minLength")?.satisfied).toBe(false);
      expect(checklist.find((c) => c.id === "hasUppercase")?.satisfied).toBe(true);
      expect(checklist.find((c) => c.id === "hasLowercase")?.satisfied).toBe(true);
      expect(checklist.find((c) => c.id === "hasNumber")?.satisfied).toBe(false);
      expect(checklist.find((c) => c.id === "hasSpecial")?.satisfied).toBe(false);
    });
  });

  describe("7. Credential-sharing message formatting", () => {
    it("formats a clean message including name, email, password, and security notice", () => {
      const message = formatCredentialSharingMessage("Anu Thomas", "anu@e-wakku.com", "Secret#948K");
      expect(message).toContain("E-Wakku Administrator Account");
      expect(message).toContain("Login email: anu@e-wakku.com");
      expect(message).toContain("Temporary password: Secret#948K");
      expect(message).toContain("Security Notice:");
      expect(message).toContain("These credentials are confidential");
    });
  });
});
