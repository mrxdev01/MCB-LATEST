import { createFileRoute } from "@tanstack/react-router";
import { BulkProductForm } from "@/components/BulkProductForm";

export const Route = createFileRoute("/_authenticated/admin/bulk")({
  component: BulkAdd,
});

function BulkAdd() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-secondary">Bulk Add Products</h1>
      <BulkProductForm />
    </div>
  );
}
