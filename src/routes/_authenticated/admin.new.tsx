import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductForm } from "@/components/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/new")({
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-secondary">Add Product</h1>
      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <ProductForm onSaved={() => navigate({ to: "/admin" })} />
      </div>
    </div>
  );
}
