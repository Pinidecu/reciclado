import { Link } from "wouter";
import { Plus, Edit, Trash2, PauseCircle, PlayCircle, Package } from "lucide-react";
import { useListMerchantProducts, getListMerchantProductsQueryKey, useUpdateProduct, useDeleteProduct } from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatARS, formatDate, productStatusLabel } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

function statusBadgeColor(status: string) {
  if (status === "AVAILABLE") return "bg-primary/10 text-primary";
  if (status === "PAUSED") return "bg-yellow-100 text-yellow-700";
  if (status === "SOLD_OUT") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

export default function MerchantProductsPage() {
  const { data: products, isLoading } = useListMerchantProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "AVAILABLE" ? "PAUSED" : "AVAILABLE";
    updateProduct.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMerchantProductsQueryKey() });
          toast({ title: "Producto actualizado" });
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMerchantProductsQueryKey() });
          toast({ title: "Producto eliminado" });
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  const activeProducts = products?.filter(p => p.status !== "DELETED") ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Mis productos</h1>
              <p className="text-muted-foreground text-sm mt-1">{activeProducts.length} productos publicados</p>
            </div>
            <Link href="/merchant/products/new">
              <Button className="bg-primary text-white gap-2" data-testid="button-new-product">
                <Plus className="w-4 h-4" /> Nuevo producto
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Sin productos aún</h3>
              <p className="text-muted-foreground mb-6">Publicá tu primer producto para empezar a vender</p>
              <Link href="/merchant/products/new">
                <Button className="bg-primary text-white" data-testid="button-first-product">Publicar producto</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Producto</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Precio original</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Precio venta</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Vence</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-right px-5 py-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeProducts.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-product-${p.id}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">{p.category?.icon ?? "🛒"}</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground line-through">{formatARS(p.originalPrice)}</td>
                        <td className="px-3 py-3 font-semibold text-primary">{formatARS(p.salePrice)}</td>
                        <td className="px-3 py-3">{p.quantityAvailable} {p.unit ?? "u."}</td>
                        <td className="px-3 py-3 text-muted-foreground">{formatDate(p.expiryDate)}</td>
                        <td className="px-3 py-3">
                          <Badge className={`text-xs ${statusBadgeColor(p.status)}`}>{productStatusLabel(p.status)}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/merchant/products/${p.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`button-edit-${p.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {(p.status === "AVAILABLE" || p.status === "PAUSED") && (
                              <Button
                                variant="ghost" size="sm" className="h-8 w-8 p-0"
                                onClick={() => handleToggleStatus(p.id, p.status)}
                                data-testid={`button-toggle-${p.id}`}
                              >
                                {p.status === "AVAILABLE" ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(p.id)}
                              data-testid={`button-delete-${p.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
