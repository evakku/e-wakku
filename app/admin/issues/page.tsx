import { redirect } from "next/navigation";

/**
 * /admin/issues → redirect to the manage page.
 * This also catches the redirect from AddIssueForm after a successful publish.
 */
export default function IssuesIndexPage() {
  redirect("/admin/issues/manage");
}
