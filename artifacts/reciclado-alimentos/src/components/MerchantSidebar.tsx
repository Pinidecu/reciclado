import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, QrCode, User, Leaf, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/merchant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant/products", label: "Productos", icon: Package },
  { href: "/merchant/orders", label: "Órdenes", icon: ShoppingCart },
  { href: "/merchant/orders/scan", label: "Validar QR", icon: QrCode },
  { href: "/merchant/profile", label: "Mi Perfil", icon: User },
];

export function MerchantSidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-lg font-bold text-sidebar-foreground">Rescaté</span>
        </Link>
        <p className="text-xs text-sidebar-foreground/50 mt-1 ml-10">Panel de Comercio</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href || (href !== "/merchant" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`} data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => { logout(); setLocation("/"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
