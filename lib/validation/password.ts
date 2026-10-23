/**
 * Admin Password Validation & Cryptographic Generator
 *
 * Enforces the 7 security conditions required for manual entry and automatic generation:
 * 1. At least 8 characters.
 * 2. At least one uppercase letter (A-Z).
 * 3. At least one lowercase letter (a-z).
 * 4. At least one number (0-9).
 * 5. At least one special character.
 * 6. No three or more consecutive ascending digits (e.g. 123, 234, 567, 789).
 * 7. No word or meaningful component derived from the administrator's name or email address.
 */

export interface PasswordRuleState {
  id: string;
  label: string;
  satisfied: boolean;
  isViolation?: boolean; // For negative rules like consecutive digits or name components
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noConsecutiveAscendingDigits: boolean;
    noIdentityComponents: boolean;
  };
}

export interface UserIdentityContext {
  name?: string | null;
  email?: string | null;
}

// Special characters accepted for password validation
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

// Generic email provider domain tokens to ignore to prevent false positives
const COMMON_EMAIL_DOMAINS = new Set([
  "gmail",
  "yahoo",
  "outlook",
  "hotmail",
  "icloud",
  "proton",
  "protonmail",
  "mail",
  "email",
  "live",
  "aol",
  "zoho",
]);

// Generic top-level domains to ignore
const COMMON_TLDS = new Set([
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "io",
  "co",
  "in",
  "info",
  "biz",
  "app",
  "dev",
  "ai",
  "me",
  "xyz",
]);

/**
 * Normalizes name and email into meaningful component tokens.
 * Extracts word tokens of length >= 3 while filtering generic domain fragments.
 */
export function extractIdentityTokens(identity?: UserIdentityContext): string[] {
  if (!identity) return [];

  const tokens = new Set<string>();

  // 1. Process name
  if (identity.name) {
    const rawName = identity.name.trim().toLowerCase();
    // Split by non-alphanumeric characters
    const nameParts = rawName.split(/[^a-z0-9]+/);
    for (const part of nameParts) {
      if (part.length >= 3) {
        tokens.add(part);
      }
    }
    // Also add full alphanumeric sequence of name if length >= 3
    const alphaName = rawName.replace(/[^a-z0-9]/g, "");
    if (alphaName.length >= 3) {
      tokens.add(alphaName);
    }
  }

  // 2. Process email
  if (identity.email) {
    const rawEmail = identity.email.trim().toLowerCase();
    const [localPart, domainPart] = rawEmail.split("@");

    if (localPart) {
      // Split local part by non-alphanumeric (dots, underscores, plus, etc.)
      const localTokens = localPart.split(/[^a-z0-9]+/);
      for (const token of localTokens) {
        if (token.length >= 3) {
          tokens.add(token);
        }
      }
      const alphaLocal = localPart.replace(/[^a-z0-9]/g, "");
      if (alphaLocal.length >= 3) {
        tokens.add(alphaLocal);
      }
    }

    if (domainPart) {
      const domainTokens = domainPart.split(/[^a-z0-9]+/);
      for (const token of domainTokens) {
        if (
          token.length >= 3 &&
          !COMMON_TLDS.has(token) &&
          !COMMON_EMAIL_DOMAINS.has(token)
        ) {
          tokens.add(token);
        }
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Checks if the password contains 3 or more consecutive ascending digits (e.g. 123, 234, 789).
 */
export function hasConsecutiveAscendingDigits(password: string): boolean {
  if (password.length < 3) return false;

  for (let i = 0; i <= password.length - 3; i++) {
    const c1 = password.charCodeAt(i);
    const c2 = password.charCodeAt(i + 1);
    const c3 = password.charCodeAt(i + 2);

    // ASCII 48 is '0', 57 is '9'
    if (
      c1 >= 48 &&
      c1 <= 57 &&
      c2 === c1 + 1 &&
      c3 === c2 + 1
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the password contains any meaningful component derived from name or email.
 */
export function containsIdentityComponents(
  password: string,
  identity?: UserIdentityContext
): boolean {
  if (!password || !identity) return false;

  const tokens = extractIdentityTokens(identity);
  if (tokens.length === 0) return false;

  const lowerPassword = password.toLowerCase();

  for (const token of tokens) {
    if (lowerPassword.includes(token)) {
      return true;
    }
  }

  return false;
}

/**
 * Full validator checking all 7 password conditions.
 */
export function validateAdminPassword(
  password: string,
  identity?: UserIdentityContext
): PasswordValidationResult {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(password);
  const noConsecutiveAscendingDigits = !hasConsecutiveAscendingDigits(password);
  const noIdentityComponents = !containsIdentityComponents(password, identity);

  const errors: string[] = [];

  if (!minLength) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least one number (0-9).");
  }
  if (!hasSpecial) {
    errors.push("Password must contain at least one special character (!@#$%^&*...).");
  }
  if (!noConsecutiveAscendingDigits) {
    errors.push("Password must not contain three or more consecutive ascending digits (e.g. 123, 234).");
  }
  if (!noIdentityComponents) {
    errors.push("Password must not contain components derived from your name or email address.");
  }

  return {
    valid: errors.length === 0,
    errors,
    rules: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      noConsecutiveAscendingDigits,
      noIdentityComponents,
    },
  };
}

/**
 * Returns checklist items for live UI validation rendering.
 */
export function getPasswordRuleChecklist(
  password: string,
  identity?: UserIdentityContext
): PasswordRuleState[] {
  const result = validateAdminPassword(password, identity);

  return [
    {
      id: "minLength",
      label: "At least 8 characters",
      satisfied: result.rules.minLength,
    },
    {
      id: "hasUppercase",
      label: "At least one uppercase letter (A-Z)",
      satisfied: result.rules.hasUppercase,
    },
    {
      id: "hasLowercase",
      label: "At least one lowercase letter (a-z)",
      satisfied: result.rules.hasLowercase,
    },
    {
      id: "hasNumber",
      label: "At least one number (0-9)",
      satisfied: result.rules.hasNumber,
    },
    {
      id: "hasSpecial",
      label: "At least one special character (!@#$%^&*)",
      satisfied: result.rules.hasSpecial,
    },
    {
      id: "noConsecutiveAscendingDigits",
      label: "No consecutive ascending digits (e.g. 123, 456)",
      satisfied: result.rules.noConsecutiveAscendingDigits,
      isViolation: !result.rules.noConsecutiveAscendingDigits && /[0-9]{3,}/.test(password),
    },
    {
      id: "noIdentityComponents",
      label: "No name or email parts",
      satisfied: result.rules.noIdentityComponents,
      isViolation: !result.rules.noIdentityComponents && password.length >= 3,
    },
  ];
}

/**
 * Generates a cryptographically secure random password meeting all 7 conditions.
 * Uses Web Crypto API (crypto.getRandomValues) for true randomness (never Math.random).
 */
export function generateSecureAdminPassword(identity?: UserIdentityContext): string {
  const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused I, O
  const LOWER = "abcdefghijkmnopqrstuvwxyz"; // exclude easily confused l
  const NUMBERS = "23456789"; // exclude 0, 1 for clarity and to prevent trivial sequences
  const SPECIALS = "!@#$%^&*-_=+";

  const ALL_CHARS = UPPER + LOWER + NUMBERS + SPECIALS;

  // Helper to pick random index using crypto
  const getRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  const MAX_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const length = 15; // 15 characters provides strong entropy well above 8 minimum
    const chars: string[] = [];

    // Guarantee minimums
    chars.push(UPPER[getRandomIndex(UPPER.length)]);
    chars.push(UPPER[getRandomIndex(UPPER.length)]);
    chars.push(LOWER[getRandomIndex(LOWER.length)]);
    chars.push(LOWER[getRandomIndex(LOWER.length)]);
    chars.push(NUMBERS[getRandomIndex(NUMBERS.length)]);
    chars.push(NUMBERS[getRandomIndex(NUMBERS.length)]);
    chars.push(SPECIALS[getRandomIndex(SPECIALS.length)]);
    chars.push(SPECIALS[getRandomIndex(SPECIALS.length)]);

    // Fill remaining positions
    while (chars.length < length) {
      chars.push(ALL_CHARS[getRandomIndex(ALL_CHARS.length)]);
    }

    // Fisher-Yates shuffle using cryptographically secure values
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getRandomIndex(i + 1);
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }

    const candidate = chars.join("");

    // Validate that candidate satisfies every single condition
    const validation = validateAdminPassword(candidate, identity);
    if (validation.valid) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a secure password satisfying all constraints. Please try again.");
}

/**
 * Formats credential sharing message for copy to clipboard.
 */
export function formatCredentialSharingMessage(
  adminName: string,
  adminEmail: string,
  temporaryPassword: string
): string {
  return [
    `E-Wakku Administrator Account`,
    ``,
    `Your administrator account has been created successfully.`,
    ``,
    `Login email: ${adminEmail}`,
    `Temporary password: ${temporaryPassword}`,
    ``,
    `Security Notice: These credentials are confidential. Share this message only with the intended administrator through a private communication channel. Do not share it publicly or forward it to anyone else.`,
  ].join("\n");
}
