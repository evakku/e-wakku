import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export default function Loading() {
  return (
    <AdminTableSkeleton
      title="Manage Publications"
      subtitle="Review and update editorial publications, toggle draft status, and remove issues."
      showActionButton={true}
    />
  );
}
