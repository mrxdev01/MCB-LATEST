import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductForm, type ProductFormValue } from "@/components/ProductForm";
import { getProductForAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/edit/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => getProductForAdmin({ data: { id } }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return <p>Not found</p>;

  type Row = typeof data & {
    product_images?: { url: string; sort_order: number }[];
    product_collections?: { collection_id: string }[];
    tag_ids?: string[];
  };
  const row = data as Row;
  const initial: Partial<ProductFormValue> = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description,
    description: row.description,
    price: Number(row.price),
    mrp: row.mrp ? Number(row.mrp) : null,
    sku: row.sku,
    stock_status: row.stock_status,
    category_id: row.category_id,
    sizes: (row.sizes as string[] | null) ?? [],
    tags: row.tags ?? [],
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    is_featured: row.is_featured,
    is_bestseller: row.is_bestseller,
    is_new_arrival: row.is_new_arrival,
    images: (row.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url),
    collection_ids: (row.product_collections ?? []).map((c) => c.collection_id),
    tag_ids: row.tag_ids ?? [],
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-secondary">Edit Product</h1>
      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <ProductForm initial={initial} onSaved={() => navigate({ to: "/admin" })} />
      </div>
    </div>
  );
}
