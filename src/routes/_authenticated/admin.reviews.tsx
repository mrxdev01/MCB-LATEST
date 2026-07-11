import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Trash2, Star } from "lucide-react";
import { listAllReviewsAdmin, setReviewApproval, deleteReview } from "@/lib/reviews.functions";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => listAllReviewsAdmin() });

  const approve = useMutation({
    mutationFn: (v: { id: string; approved: boolean }) => setReviewApproval({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); toast.success("Updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); toast.success("Deleted"); },
  });

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-secondary">Reviews Moderation</h1>
      <p className="mt-1 text-sm text-muted-foreground">Approve karo taaki product page pr show ho aur AggregateRating schema count ho.</p>

      <Section title={`Pending (${pending.length})`}>
        {pending.length === 0 && <Empty text="Koi pending review nahi" />}
        {pending.map((r) => (
          <ReviewRow key={r.id} r={r} onApprove={() => approve.mutate({ id: r.id, approved: true })} onDelete={() => del.mutate(r.id)} />
        ))}
      </Section>

      <Section title={`Approved (${approved.length})`}>
        {approved.length === 0 && <Empty text="Koi approved review nahi" />}
        {approved.map((r) => (
          <ReviewRow
            key={r.id}
            r={r}
            approved
            onApprove={() => approve.mutate({ id: r.id, approved: false })}
            onDelete={() => del.mutate(r.id)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-brand-soft/70 p-4 text-center text-sm text-muted-foreground">{text}</p>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReviewRow({ r, approved, onApprove, onDelete }: { r: any; approved?: boolean; onApprove: () => void; onDelete: () => void }) {
  return (
    <article className="rounded-2xl border border-brand-soft/60 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-secondary">{r.reviewer_name} <span className="text-xs font-normal text-muted-foreground">· {r.product_title ?? r.product_id}</span></p>
          <div className="mt-1 flex items-center gap-1">
            {[1,2,3,4,5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
            <span className="ml-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onApprove} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${approved ? "bg-yellow-100 text-yellow-800" : "bg-green-600 text-white"}`}>
            {approved ? <><X className="h-3.5 w-3.5" /> Unapprove</> : <><Check className="h-3.5 w-3.5" /> Approve</>}
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
      {r.title && <p className="mt-3 font-semibold text-brand-secondary">{r.title}</p>}
      {r.comment && <p className="mt-1 whitespace-pre-line text-sm text-brand-secondary/80">{r.comment}</p>}
      {r.reviewer_email && <p className="mt-2 text-[11px] text-muted-foreground">{r.reviewer_email}</p>}
    </article>
  );
}
