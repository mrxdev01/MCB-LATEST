import { createFileRoute, useRouter } from "@tanstack/react-router";
import { BlogEditor } from "@/components/BlogEditor";

export const Route = createFileRoute("/_authenticated/admin/blog/new")({
  component: NewBlogPost,
});

function NewBlogPost() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-secondary">New blog post</h1>
      <BlogEditor onSaved={() => router.navigate({ to: "/admin/blog" })} />
    </div>
  );
}
