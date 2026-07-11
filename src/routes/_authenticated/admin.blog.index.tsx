import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusSquare, Trash2, Pencil } from "lucide-react";
import { listAllBlogPostsAdmin, deleteBlogPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  component: BlogAdminList,
});

function BlogAdminList() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: posts = [] } = useQuery({ queryKey: ["admin", "blog"], queryFn: () => listAllBlogPostsAdmin() });
  const del = useMutation({
    mutationFn: (id: string) => deleteBlogPost({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "blog"] }); toast.success("Deleted"); },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-secondary">Blog Posts</h1>
        <button
          onClick={() => router.navigate({ to: "/admin/blog/new" })}
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
        >
          <PlusSquare className="h-4 w-4" /> New post
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length === 0 && <p className="rounded-xl border border-dashed border-brand-soft/70 p-6 text-center text-sm text-muted-foreground">Koi blog post nahi. Pehla likhein!</p>}
        {posts.map((p) => (
          <article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-soft/60 bg-white p-4 shadow-soft">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-semibold text-brand-secondary">{p.title}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">/{p.slug} · {new Date(p.updated_at).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/blog/edit/$id"
                params={{ id: p.id }}
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft/70 px-3 py-1.5 text-xs font-semibold text-brand-secondary hover:bg-brand-soft"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              <button
                onClick={() => { if (confirm("Delete post?")) del.mutate(p.id); }}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
