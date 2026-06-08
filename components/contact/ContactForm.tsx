"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HeadlineMd, BodyMd, LabelCaps } from "@/src/components/ui/typography";
import { contactSchema, type ContactFormData } from "@/validation/contactSchema";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactForm() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError("");
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        setIsSuccess(true);
        reset();
      } else {
        // Map server-side field validation errors
        if (result.errors) {
          const firstError = Object.values(result.errors).flat()[0];
          setSubmitError(firstError || "Submission failed. Please check the form.");
        } else {
          setSubmitError("Failed to submit form. Please try again.");
        }
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  const scaleInVariants: Variants = {
    initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="w-full max-w-[700px] mx-auto">
      <div className="bg-white rounded-2xl border border-border/10 shadow-paper-lg p-8 md:p-12">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* Success Response State */
            <motion.div
              key="success-screen"
              variants={scaleInVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-col items-center text-center py-6"
            >
              <div className="size-12 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center mb-6">
                <Check className="size-6 stroke-[2.5]" />
              </div>
              <HeadlineMd className="text-foreground tracking-tight font-heading mb-4">
                Message Sent Successfully
              </HeadlineMd>
              <BodyMd className="text-muted-foreground font-light max-w-md leading-relaxed">
                Thank you for contacting The Journal. Our editorial team will review your message and get back to you shortly.
              </BodyMd>
              <Button
                variant="ghost"
                onClick={() => setIsSuccess(false)}
                className="mt-8 text-accent hover:text-accent/80 hover:bg-accent/5 font-semibold cursor-pointer"
              >
                Send another message
              </Button>
            </motion.div>
          ) : (
            /* Contact Form Input State */
            <motion.div
              key="form-screen"
              variants={scaleInVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
                {/* Submit-level error banner */}
                {submitError && (
                  <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/10 text-destructive text-sm rounded-lg p-4 font-medium">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Name field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name-input" className="form-label">
                    Name
                  </label>
                  <Input
                    id="name-input"
                    placeholder="Jane Doe"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name")}
                  />
                  {errors.name && (
                    <span id="name-error" className="text-destructive text-xs font-medium mt-1 flex items-center gap-1.5">
                      <AlertCircle className="size-3" /> {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Email address field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email-input" className="form-label">
                    Email Address
                  </label>
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="jane@example.com"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <span id="email-error" className="text-destructive text-xs font-medium mt-1 flex items-center gap-1.5">
                      <AlertCircle className="size-3" /> {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Message text area field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message-input" className="form-label">
                    Message
                  </label>
                  <Textarea
                    id="message-input"
                    placeholder="How can we help you today?"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className="min-h-[160px] resize-y px-4 py-3"
                    {...register("message")}
                  />
                  {errors.message && (
                    <span id="message-error" className="text-destructive text-xs font-medium mt-1 flex items-center gap-1.5">
                      <AlertCircle className="size-3" /> {errors.message.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-[#059669] hover:bg-[#059669]/90 text-white font-medium h-12 transition-all cursor-pointer rounded-md border-0 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
