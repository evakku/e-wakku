import type { Metadata } from "next";
import { AddIssueForm } from "@/components/magazine/AddIssueForm";
import { getNextEditionMonthAndYear } from "@/lib/utils/edition";

export const metadata: Metadata = {
  title: "Add Issue — Admin",
};

export default function NewIssuePage() {
  const nextEdition = getNextEditionMonthAndYear();
  return (
    <AddIssueForm
      defaultMonth={nextEdition.month}
      defaultYear={String(nextEdition.year)}
    />
  );
}
