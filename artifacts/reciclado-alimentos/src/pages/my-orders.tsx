import { Link } from "wouter";
import { ShoppingBag, MapPin, Clock, QrCode } from "lucide-react";
import { useListBuyerOrders, getListBuyerOrdersQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatARS, formatDate, paymentStatusLabel, deliveryStatusLabel } from "@/lib/format";

function statusColor(payment: string, delivery: string): string {
  if (delivery === "DELIVERED") return "bg-primary/10 text-primary";
  if (delivery === "CANCELLED") return "bg-destructive/10 text-destructive";
  if (payment === "PAID" && delivery === "READY") return "bg-accent/10 text-accent";
  if (payment === "PAID") return "bg-green-100 text-green-700";
  return "bg-muted text-muted-foreground";
}

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useListBuyerOrders({});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Mis compras</h1>
          <p className="text-muted-foreground">Historial y estado de tus pedidos</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aún no tenés compras</h3>
            <p className="text-muted-foreground mb-6">Explorá el catálogo y encontrá tu primera oferta</p>
            <Link href="/products">
              <Button className="bg-primary text-white" data-testid="button-explore">Explorar productos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    {order.product?.imageUrl ? (
                      <img src={order.product.imageUrl} alt={order.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">{order.product?.category?.icon ?? "🛒"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground truncate">{order.product?.name}</p>
                        <p className="text-sm text-muted-foreground">{order.merchant?.businessName} · {order.merchant?.city}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground">{formatARS(order.total)}</p>
                        <p className="text-xs text-muted-foreground">x{order.quantity}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge className={`text-xs ${statusColor(order.paymentStatus, order.deliveryStatus)}`}>
                        {paymentStatusLabel(order.paymentStatus)}
                      </Badge>
                      <Badge className={`text-xs ${statusColor(order.paymentStatus, order.deliveryStatus)}`}>
                        {deliveryStatusLabel(order.deliveryStatus)}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Link href={`/orders/${order.id}/success`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid={`button-view-order-${order.id}`}>
                          <QrCode className="w-3.5 h-3.5" />
                          Ver comprobante
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
