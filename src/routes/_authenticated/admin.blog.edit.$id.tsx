import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getBlogPostByIdAdmin } from "@/lib/blog.functions";
import { BlogEditor } from "@/components/BlogEditor";

export const Route = createFileRoute("/_authenticated/admin/blog/edit/$id")({
  component: EditBlogPost,
});

function EditBlogPost() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: () => getBlogPostByIdAdmin({ data: { id } }),
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!post) return <p className="text-sm text-muted-foreground">Post not found</p>;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-secondary">Edit blog post</h1>
      <BlogEditor initial={post} onSaved={() => router.navigate({ to: "/admin/blog" })} />
    </div>
  );
}
