import { Link } from "wouter";
import { Package, ShoppingCart, TrendingUp, Users, DollarSign, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useGetMerchantStats, getGetMerchantStatsQueryKey } from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { formatARS } from "@/lib/format";
import { Button } from "@/components/ui/button";

function StatCard({ icon: Icon, label, value, sublabel, color = "primary" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: "primary" | "accent" | "green" | "orange";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
    </div>
  );
}

export default function MerchantDashboard() {
  const { data: stats, isLoading } = useGetMerchantStats();

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <MerchantSidebar />
        <main className="flex-1 p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Resumen de tu actividad</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Package} label="Productos publicados" value={stats?.totalProducts ?? 0} />
            <StatCard icon={CheckCircle2} label="Productos activos" value={stats?.activeProducts ?? 0} color="green" />
            <StatCard icon={AlertTriangle} label="Agotados" value={stats?.soldOutProducts ?? 0} color="orange" />
            <StatCard icon={Clock} label="Pendientes de retiro" value={stats?.pendingPickup ?? 0} color="accent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Ventas de hoy</p>
              <p className="text-3xl font-bold text-foreground">{formatARS(stats?.revenueToday ?? 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{stats?.totalOrdersToday ?? 0} órdenes</p>
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Ventas del mes</p>
              <p className="text-3xl font-bold text-primary">{formatARS(stats?.revenueMonth ?? 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{stats?.totalOrdersMonth ?? 0} órdenes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Entregas completadas</p>
              <p className="text-2xl font-bold text-foreground">{stats?.delivered ?? 0}</p>
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Comisión plataforma</p>
              <p className="text-2xl font-bold text-foreground">{formatARS(stats?.platformCommission ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">este mes</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/merchant/products/new">
              <Button className="bg-primary text-white gap-2" data-testid="button-new-product">
                <Package className="w-4 h-4" />
                Publicar producto
              </Button>
            </Link>
            <Link href="/merchant/orders">
              <Button variant="outline" className="gap-2" data-testid="button-view-orders">
                <ShoppingCart className="w-4 h-4" />
                Ver órdenes
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
