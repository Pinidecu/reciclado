import { useState } from "react";
import { QrCode, CheckCircle2, Clock, Package } from "lucide-react";
import { useListMerchantOrders, getListMerchantOrdersQueryKey } from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatARS, formatDate, paymentStatusLabel, deliveryStatusLabel } from "@/lib/format";

function statusBg(payment: string, delivery: string) {
  if (delivery === "DELIVERED") return "bg-primary/10 text-primary";
  if (delivery === "CANCELLED") return "bg-destructive/10 text-destructive";
  if (payment === "PAID" && delivery === "READY") return "bg-accent/10 text-accent";
  if (payment === "PAID") return "bg-green-100 text-green-700";
  return "bg-muted text-muted-foreground";
}

export default function MerchantOrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: orders, isLoading } = useListMerchantOrders({
    status: filter === "all" ? undefined : filter,
  });

  const FILTERS = [
    { value: "all", label: "Todas" },
    { value: "PAID", label: "Pagadas" },
    { value: "PENDING", label: "Pendientes" },
    { value: "DELIVERED", label: "Entregadas" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Órdenes de compra</h1>
              <p className="text-muted-foreground text-sm mt-1">{orders?.length ?? 0} órdenes en total</p>
            </div>
            <Link href="/merchant/orders/scan">
              <Button className="bg-primary text-white gap-2" data-testid="button-scan-qr">
                <QrCode className="w-4 h-4" /> Validar QR
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map(f => (
              <Badge
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                className={`cursor-pointer py-1.5 px-3 ${filter === f.value ? "bg-primary text-white" : "hover:border-primary hover:text-primary"}`}
                onClick={() => setFilter(f.value)}
                data-testid={`filter-${f.value}`}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : !orders?.length ? (
            <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Sin órdenes</h3>
              <p className="text-muted-foreground">Cuando alguien compre tus productos, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Orden</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Producto</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Comprador</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Total</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left px-3 py-3 font-medium text-muted-foreground">Código</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-order-${order.id}`}>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-foreground">{order.product?.name}</p>
                          <p className="text-xs text-muted-foreground">x{order.quantity}</p>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {order.buyer?.firstName} {order.buyer?.lastName}
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground">{formatARS(order.total)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <Badge className={`text-xs w-fit ${statusBg(order.paymentStatus, order.deliveryStatus)}`}>
                              {paymentStatusLabel(order.paymentStatus)}
                            </Badge>
                            <Badge className={`text-xs w-fit ${statusBg(order.paymentStatus, order.deliveryStatus)}`}>
                              {deliveryStatusLabel(order.deliveryStatus)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {order.pickupCode ? (
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded" data-testid={`pickup-code-${order.id}`}>
                              {order.pickupCode}
                            </span>
                          ) : "—"}
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
