import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(100, { message: "Name must be less than 100 characters." }),
  email: z
    .string()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please enter a valid email address." }),
  message: z
    .string()
    .min(1, { message: "Message is required." })
    .min(10, { message: "Message must be at least 10 characters." })
    .max(5000, { message: "Message must be less than 5000 characters." }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
