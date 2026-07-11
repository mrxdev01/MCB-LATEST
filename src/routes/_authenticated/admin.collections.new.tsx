import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CollectionForm } from "@/components/CollectionForm";

export const Route = createFileRoute("/_authenticated/admin/collections/new")({
  validateSearch: (s) => z.object({ parent: z.string().uuid().optional() }).parse(s),
  component: NewCollection,
});

function NewCollection() {
  const navigate = useNavigate();
  const { parent } = Route.useSearch();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Collections</p>
        <h1 className="mt-1 text-3xl font-black text-brand-secondary">{parent ? "Add sub-category" : "Add collection"}</h1>
      </header>
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-primary/10">
        <CollectionForm initial={{ parent_id: parent ?? null }} onSaved={() => navigate({ to: "/admin/collections" })} />
      </div>
    </div>
  );
}
