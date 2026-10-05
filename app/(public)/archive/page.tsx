import { redirect } from "next/navigation";

export default function ArchivePageRedirect() {
  redirect("/allIssues");
}
