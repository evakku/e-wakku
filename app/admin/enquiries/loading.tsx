import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export default function Loading() {
  return (
    <AdminTableSkeleton
      title="Enquiries"
      subtitle="All messages submitted through the public contact form."
      showActionButton={false}
    />
  );
}
