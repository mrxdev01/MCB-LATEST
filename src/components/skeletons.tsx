import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/** Single product card placeholder — mirrors ProductCard shape */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-brand-primary/10">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Category / collection tile placeholder */
export function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-brand-primary/10">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

/** Product grid — used for /products, category routes, collection pages */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Category grid */
export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Section headline + grid used for homepage sections while loading */
export function SectionSkeleton({
  variant = "product",
  count = 8,
}: {
  variant?: "product" | "category";
  count?: number;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      {variant === "product" ? (
        <ProductGridSkeleton count={count} />
      ) : (
        <CategoryGridSkeleton count={count} />
      )}
    </section>
  );
}

/** Full listing page skeleton (with Header/Footer chrome) */
export function ListingPageSkeleton({
  title = true,
  variant = "product",
  count = 8,
}: {
  title?: boolean;
  variant?: "product" | "category";
  count?: number;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {title && <Skeleton className="h-9 w-52" />}
        <div className="mt-6">
          {variant === "product" ? (
            <ProductGridSkeleton count={count} />
          ) : (
            <CategoryGridSkeleton count={count} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Product detail page skeleton */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Homepage skeleton — hero placeholder + a couple of sections */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="space-y-5">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-12 w-3/5" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-3/4 max-w-md" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-48 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-[4/5] w-full max-w-md justify-self-end rounded-[28px]" />
        </section>
        <SectionSkeleton variant="category" count={8} />
        <SectionSkeleton variant="product" count={8} />
      </main>
      <Footer />
    </div>
  );
}

/** Admin table row placeholder */
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-t border-brand-primary/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}
