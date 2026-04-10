import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, MapPin, Clock, Tag, ShoppingCart, Store, AlertCircle } from "lucide-react";
import { useGetProduct, getGetProductQueryKey, useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatARS, formatDate } from "@/lib/format";
import type { Order } from "@workspace/api-client-react";

export default function ProductDetailPage() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id ?? "";
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const [quantity, setQuantity] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-64 bg-muted rounded-2xl mb-6" />
          <div className="h-8 bg-muted rounded w-1/2 mb-3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
          <Link href="/products"><Button variant="outline">Ver todos los productos</Button></Link>
        </div>
      </div>
    );
  }

  const BUYER_FEE_RATE = 0.05;
  const subtotal = product.salePrice * quantity;
  const buyerFee = Math.round(subtotal * BUYER_FEE_RATE * 100) / 100;
  const total = subtotal + buyerFee;

  const handleBuy = () => {
    if (!user) {
      toast({ title: "Iniciá sesión", description: "Necesitás estar logueado para comprar", variant: "destructive" });
      setLocation("/login");
      return;
    }
    if (user.role !== "BUYER") {
      toast({ title: "Solo compradores", description: "Esta acción es solo para compradores", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: (order: Order) => {
          toast({ title: "Orden creada", description: "Procedé al pago para completar tu compra" });
          setLocation(`/orders/${order.id}/success`);
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al crear la orden";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 text-muted-foreground hover:text-foreground" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-muted h-80 lg:h-96">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                  <span className="text-7xl">{product.category?.icon ?? "🛒"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs text-primary border-primary/30">{product.category?.name}</Badge>
                <Badge className="bg-accent text-accent-foreground text-xs font-bold">-{product.discountPercent}%</Badge>
                {product.isFeatured && <Badge className="bg-primary text-white text-xs">Destacado</Badge>}
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground text-sm mt-2">{product.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{product.merchant?.businessName}</span>
            </div>

            {product.pickupAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">{product.pickupAddress}</p>
                  {product.merchant?.pickupHours && (
                    <p className="text-xs text-muted-foreground mt-0.5">{product.merchant.pickupHours}</p>
                  )}
                </div>
              </div>
            )}

            {product.pickupDeadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Retirar antes del <strong className="text-foreground">{formatDate(product.pickupDeadline)}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">{product.quantityAvailable} {product.unit ?? "unidades"} disponibles</span>
            </div>

            {/* Price breakdown */}
            <div className="bg-muted rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Precio original</span>
                <span className="line-through">{formatARS(product.originalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Precio con descuento</span>
                <span className="font-bold text-primary">{formatARS(product.salePrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tasa de servicio (5%)</span>
                <span>{formatARS(buyerFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border font-bold text-foreground">
                <span>Total estimado</span>
                <span className="text-lg">{formatARS(total)}</span>
              </div>
            </div>

            {/* Quantity & CTA */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  className="px-4 py-2.5 text-foreground hover:bg-muted transition-colors"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  data-testid="button-decrease-qty"
                >-</button>
                <span className="px-4 py-2.5 text-sm font-semibold min-w-[3rem] text-center" data-testid="text-quantity">{quantity}</span>
                <button
                  className="px-4 py-2.5 text-foreground hover:bg-muted transition-colors"
                  onClick={() => setQuantity(q => Math.min(product.quantityAvailable, q + 1))}
                  data-testid="button-increase-qty"
                >+</button>
              </div>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2 h-11"
                onClick={handleBuy}
                disabled={createOrder.isPending || product.status !== "AVAILABLE"}
                data-testid="button-buy"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.status !== "AVAILABLE" ? "No disponible" : createOrder.isPending ? "Procesando..." : "Comprar"}
              </Button>
            </div>

            {!user && (
              <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-3 text-sm text-primary">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <Link href="/login" className="font-medium underline">Iniciá sesión</Link> para comprar este producto
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
