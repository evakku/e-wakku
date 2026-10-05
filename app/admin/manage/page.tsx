import { redirect } from "next/navigation";

/**
 * /admin/manage -> redirect to /admin/issues/manage
 */
export default function AdminManageRedirect() {
  redirect("/admin/issues/manage");
}
