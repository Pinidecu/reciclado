import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params = {
    search: search || undefined,
    categoryId: selectedCategory || undefined,
    page,
    limit: 12,
  };

  const { data, isLoading } = useListProducts(params);
  const { data: categories } = useListCategories();

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryToggle = (id: string) => {
    setSelectedCategory(prev => prev === id ? null : id);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setPage(1);
  };

  const hasFilters = !!search || !!selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Catálogo de productos</h1>
          <p className="text-muted-foreground">Encontrá productos frescos con descuentos reales</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2 shrink-0" data-testid="button-clear-filters">
              <X className="w-4 h-4" /> Limpiar filtros
            </Button>
          )}
        </div>

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${selectedCategory === cat.id ? "bg-primary text-white" : "hover:border-primary hover:text-primary"}`}
                onClick={() => handleCategoryToggle(cat.id)}
                data-testid={`badge-category-${cat.slug}`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sin resultados</h3>
            <p className="text-muted-foreground">No encontramos productos con esos filtros. Probá cambiando la búsqueda.</p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4" data-testid="button-reset-search">
                Ver todos los productos
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {data?.total} producto{data?.total !== 1 ? "s" : ""} encontrado{data?.total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data?.products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.total > data.limit && (
              <div className="flex justify-center gap-2 mt-10">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">Anterior</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">Página {page} de {Math.ceil(data.total / data.limit)}</span>
                <Button variant="outline" disabled={page * data.limit >= data.total} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">Siguiente</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
