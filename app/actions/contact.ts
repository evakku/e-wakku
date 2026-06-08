"use server";

import { contactSchema } from "@/validation/contactSchema";

export async function submitContactForm(formData: {
  name: string;
  email: string;
  message: string;
}) {
  // 1. Server-side validation using Zod
  const result = contactSchema.safeParse(formData);

  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: errorMap,
    };
  }

  const { name, email, message } = result.data;

  // 2. Log submission securely
  console.log(`[CONTACT SUBMISSION] [${new Date().toISOString()}]`);
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Message Length: ${message.length} chars`);
  console.log(`Message Content:\n---\n${message}\n---`);

  // Future integration (e.g., SendGrid, AWS SES, or DB) can be wired here.

  // Simulate server/network latency for a premium feedback transition
  await new Promise((resolve) => setTimeout(resolve, 800));

  return { success: true };
}
