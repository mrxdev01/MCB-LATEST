import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { listProductReviews, submitReview, getReviewSummary } from "@/lib/reviews.functions";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export function ReviewSummaryBadge({ productId }: { productId: string }) {
  const { data } = useQuery({
    queryKey: ["review-summary", productId],
    queryFn: () => getReviewSummary({ data: { productId } }),
  });
  if (!data || data.count === 0) return null;
  return (
    <div className="mt-2 inline-flex items-center gap-2 text-sm">
      <Stars value={data.average} />
      <span className="font-semibold text-brand-secondary">{data.average.toFixed(1)}</span>
      <span className="text-muted-foreground">({data.count} review{data.count === 1 ? "" : "s"})</span>
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => listProductReviews({ data: { productId } }),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      submitReview({
        data: { productId, name, email, rating, title: title || undefined, comment: comment || undefined },
      }),
    onSuccess: () => {
      toast.success("Review submitted — moderator ke approval ke baad show hoga.");
      setName(""); setEmail(""); setTitle(""); setComment(""); setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["review-summary", productId] });
    },
    onError: (e: Error) => toast.error(e.message || "Submission failed"),
  });

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-brand-secondary">Customer Reviews</h2>

      {reviews.length > 0 ? (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-brand-soft/60 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-secondary">{r.reviewer_name}</p>
                  <Stars value={r.rating} />
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              {r.title && <p className="mt-3 font-semibold text-brand-secondary">{r.title}</p>}
              {r.comment && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-brand-secondary/80">{r.comment}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Abhi tak koi review nahi. Sabse pehla review likhein!</p>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); if (!name) return toast.error("Naam zaroori hai"); mut.mutate(); }}
        className="mt-8 rounded-2xl border border-brand-soft/60 bg-gradient-to-br from-white to-brand-soft/20 p-5 shadow-soft"
      >
        <h3 className="text-lg font-bold text-brand-secondary">Apna review likhein</h3>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Rating</label>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
              >
                <Star className={`h-7 w-7 transition-colors ${n <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aapka naam *"
            className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
          />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="mt-3 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Aapka experience share karein…"
          className="mt-3 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={mut.isPending}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
        >
          {mut.isPending ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </section>
  );
}
