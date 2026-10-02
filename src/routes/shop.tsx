import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Shell } from "@/components/store/layout";
import { EmptyState, LoadingGrid, ProductCard, Status } from "@/components/store/ui";
import { listCollections, listProducts } from "@/lib/store/catalog";
import type { ProductSort } from "@/lib/store/types";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop menswear — UV" },
      {
        name: "description",
        content: "Shop UV's collection of modern menswear. Considered essentials, outerwear and everyday layers.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const params = Route.useSearch();
  const [search, setSearch] = useState(params.q || "");
  const [category, setCategory] = useState(params.category || "");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCategory(params.category || "");
  }, [params.category]);
  useEffect(() => {
    setSearch(params.q || "");
  }, [params.q]);
  useEffect(() => {
    setPage(1);
  }, [search, category, size, color, minPrice, maxPrice, sort]);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      size: size || undefined,
      color: color || undefined,
      minPrice: minPrice === "" ? undefined : Number(minPrice),
      maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
      sort,
      page,
      pageSize: 12 as const,
    }),
    [search, category, size, color, minPrice, maxPrice, sort, page],
  );

  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts({ data: filters }),
    placeholderData: (previous) => previous,
  });
  const collections = useQuery({ queryKey: ["collections"], queryFn: () => listCollections() });
  const facets = useQuery({
    queryKey: ["products", { page: 1, pageSize: 48 }],
    queryFn: () => listProducts({ data: { page: 1, pageSize: 48 } }),
  });
  const availableSizes = [...new Set((facets.data?.items ?? []).flatMap((product) => product.sizes))].sort();
  const availableColors = [...new Set((facets.data?.items ?? []).flatMap((product) => product.colors))].sort();
  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setSize("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
  };
  const result = query.data?.items || [];

  return (
    <Shell>
      <main className="shop-page">
        <div className="page-title">
          <span className="eyebrow">THE UV WARDROBE</span>
          <h1>
            Shop <em>all.</em>
          </h1>
          <p>Considered pieces. Everyday possibility.</p>
        </div>
        <div className="catalog-toolbar">
          <span>{query.data?.total ?? "—"} pieces</span>
          <button className="filter-toggle" onClick={() => setMobileFilters(!mobileFilters)}>
            <SlidersHorizontal size={15} /> Filters
          </button>
          <label className="search-control">
            <Search size={16} />
            <input
              aria-label="Search the collection"
              placeholder="Search the collection"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-product-search"
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </label>
          <label className="sort-control">
            Sort{" "}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </div>
        <div className="catalog-layout">
          <aside className={`filter-panel ${mobileFilters ? "filters-open" : ""}`}>
            <div className="filter-head">
              Refine{" "}
              <button onClick={clearFilters} className="clear-filter">
                Clear all
              </button>
            </div>
            <div className="filter-group">
              <h3>Category</h3>
              <button className={!category ? "filter-option selected" : "filter-option"} onClick={() => setCategory("")}>
                All pieces
              </button>
              {(collections.data ?? []).map((c) => (
                <button
                  key={c.slug}
                  className={category === c.slug ? "filter-option selected" : "filter-option"}
                  onClick={() => setCategory(category === c.slug ? "" : c.slug)}
                >
                  {c.name}
                  <span>{c.productCount}</span>
                </button>
              ))}
            </div>
            <div className="filter-group">
              <h3>Size</h3>
              <select aria-label="Filter by size" className="filter-input" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">All sizes</option>
                {availableSizes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <h3>Colour</h3>
              <select
                aria-label="Filter by colour"
                className="filter-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                <option value="">All colours</option>
                {availableColors.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <h3>Price range</h3>
              <div className="price-filter">
                <label>
                  <span>Min ₹</span>
                  <input className="filter-input" type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </label>
                <label>
                  <span>Max ₹</span>
                  <input className="filter-input" type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </label>
              </div>
            </div>
            <div className="filter-note">A wardrobe is built one good decision at a time.</div>
          </aside>
          <div className="catalog-results">
            {query.isLoading ? (
              <LoadingGrid />
            ) : query.isError ? (
              <Status error={query.error} retry={() => query.refetch()} />
            ) : result.length ? (
              <>
                <div className="product-grid">
                  {result.map((p) => (
                    <ProductCard product={p} key={p.id} />
                  ))}
                </div>
                {query.data && query.data.total > 12 && (
                  <div className="pagination">
                    <span>
                      Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, query.data.total)} of {query.data.total}
                    </span>
                    <div>
                      <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
                        <ArrowLeft size={16} />
                      </button>
                      <span>{page}</span>
                      <button
                        disabled={page * 12 >= query.data.total}
                        onClick={() => setPage(page + 1)}
                        aria-label="Next page"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No pieces found."
                copy="Try another search or clear your filters."
                action={
                  <button className="text-link" onClick={clearFilters}>
                    Clear filters <X size={14} />
                  </button>
                }
              />
            )}
          </div>
        </div>
      </main>
    </Shell>
  );
}
