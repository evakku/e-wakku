"use client";

import { LabelCaps } from "@/src/components/ui/typography";

interface DirectContactProps {
  label?: string;
  email: string;
}

export default function DirectContact({
  label = "Prefer direct email?",
  email,
}: DirectContactProps) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <LabelCaps className="text-muted-foreground/80 mb-2.5 tracking-wider block font-semibold">
        {label}
      </LabelCaps>
      <a
        href={`mailto:${email}`}
        className={[
          "font-heading text-xl md:text-2xl text-foreground",
          "relative py-1 border-b border-border/40 hover:border-accent",
          "transition-all duration-300 ease-in-out hover:text-accent",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
        ].join(" ")}
      >
        {email}
      </a>
    </div>
  );
}
