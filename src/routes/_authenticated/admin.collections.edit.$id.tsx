import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CollectionForm } from "@/components/CollectionForm";
import { listCollections } from "@/lib/collections.functions";

export const Route = createFileRoute("/_authenticated/admin/collections/edit/$id")({
  component: EditCollection,
});

function EditCollection() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["collections"], queryFn: () => listCollections() });
  const c = data?.find((x) => x.id === id);
  if (!c) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-secondary">Edit Collection</h1>
      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <CollectionForm initial={c} onSaved={() => navigate({ to: "/admin/collections" })} />
      </div>
    </div>
  );
}
