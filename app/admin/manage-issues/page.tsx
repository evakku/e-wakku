import { redirect } from "next/navigation";

/**
 * /admin/manage-issues -> redirect to /admin/issues/manage
 */
export default function AdminManageIssuesRedirect() {
  redirect("/admin/issues/manage");
}
