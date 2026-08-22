import type { Metadata } from "next";
import { AddIssueForm } from "@/components/magazine/AddIssueForm";

export const metadata: Metadata = {
  title: "Add Issue | E-Wakku Admin",
};

export default function NewIssuePage() {
  return <AddIssueForm />;
}
