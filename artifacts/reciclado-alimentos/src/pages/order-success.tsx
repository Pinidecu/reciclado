import { useRoute, Link } from "wouter";
import { CheckCircle2, MapPin, Clock, Download, ShoppingBag, AlertTriangle } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey, usePayOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatARS, formatDate, paymentStatusLabel, deliveryStatusLabel } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderSuccessPage() {
  const [, params] = useRoute("/orders/:id/success");
  const id = params?.id ?? "";
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) } });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const payMutation = usePayOrder();

  const handlePay = () => {
    payMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Pago simulado exitosamente", description: "Tu pedido está listo para retirar" });
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al procesar el pago";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse">
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-2">Orden no encontrada</h2>
          <Link href="/my-orders"><Button variant="outline">Ver mis compras</Button></Link>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          {isPaid ? (
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-primary" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-9 h-9 text-accent" />
            </div>
          )}
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {isPaid ? "Compra confirmada" : "Orden pendiente de pago"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Orden #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-5">
          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${order.paymentStatus === "PAID" ? "bg-primary" : "bg-muted text-muted-foreground"} text-xs`}>
              Pago: {paymentStatusLabel(order.paymentStatus)}
            </Badge>
            <Badge className={`${order.deliveryStatus === "READY" ? "bg-accent" : "bg-muted text-muted-foreground"} text-xs`}>
              Retiro: {deliveryStatusLabel(order.deliveryStatus)}
            </Badge>
          </div>

          {/* Product */}
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
              {order.product?.imageUrl ? (
                <img src={order.product.imageUrl} alt={order.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">{order.product?.category?.icon ?? "🛒"}</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{order.product?.name}</p>
              <p className="text-sm text-muted-foreground">x{order.quantity} {order.product?.unit ?? "u."}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{order.merchant?.businessName}</p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><span>{formatARS(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tasa de servicio</span><span>{formatARS(order.buyerFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span><span>{formatARS(order.total)}</span>
            </div>
          </div>

          {/* QR Code */}
          {isPaid && (
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">Tu código QR</p>
              <div className="w-32 h-32 mx-auto bg-foreground rounded-xl flex items-center justify-center mb-3 p-2">
                <div className="grid grid-cols-7 gap-0.5 w-full h-full">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? "bg-white" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
              <div className="bg-muted rounded-xl px-4 py-3 font-mono text-sm text-foreground font-bold tracking-widest" data-testid="text-pickup-code">
                {order.pickupCode}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Mostrá este código al retirar tu pedido</p>
            </div>
          )}

          {/* Pickup info */}
          <div className="space-y-3">
            {order.merchant?.addressLine && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">{order.merchant.businessName}</p>
                  <p className="text-sm text-muted-foreground">{order.merchant.addressLine}, {order.merchant.city}</p>
                </div>
              </div>
            )}
            {order.merchant?.pickupHours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">{order.merchant.pickupHours}</p>
              </div>
            )}
          </div>

          {/* Payment section */}
          {!isPaid && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">MODO DEMO — No se realizará ningún cobro real</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Esta es una versión de demostración. Al hacer clic se simulará un pago exitoso.</p>
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={handlePay}
                disabled={payMutation.isPending}
                data-testid="button-pay"
              >
                {payMutation.isPending ? "Procesando..." : "Pagar con Mercado Pago (DEMO)"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <Link href="/my-orders" className="flex-1">
            <Button variant="outline" className="w-full gap-2" data-testid="link-my-orders">
              <ShoppingBag className="w-4 h-4" /> Ver mis compras
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full bg-primary text-white" data-testid="link-more-products">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
