import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Leaf, ShoppingBag, Store } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-foreground">Rescaté</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Inicio</Link>
            <Link href="/products" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Productos</Link>
            <Link href="/nearby" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Cerca de mí</Link>
            {!user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Registrarse</Button>
                </Link>
              </>
            )}
            {user?.role === "MERCHANT" && (
              <>
                <Link href="/merchant">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Store className="w-4 h-4" />
                    Mi comercio
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
              </>
            )}
            {user?.role === "BUYER" && (
              <>
                <Link href="/my-orders">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Mis compras
                  </Button>
                </Link>
                <Link href="/buyer">
                  <Button variant="ghost" size="sm">Mi cuenta</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setOpen(!open)} data-testid="button-mobile-menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          <Link href="/" onClick={() => setOpen(false)} className="text-sm font-medium py-2">Inicio</Link>
          <Link href="/products" onClick={() => setOpen(false)} className="text-sm font-medium py-2">Productos</Link>
          <Link href="/nearby" onClick={() => setOpen(false)} className="text-sm font-medium py-2">Cerca de mí</Link>
          {!user && (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button className="w-full bg-primary text-white">Registrarse</Button>
              </Link>
            </>
          )}
          {user?.role === "MERCHANT" && (
            <>
              <Link href="/merchant" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Mi comercio</Button>
              </Link>
              <Button variant="ghost" className="w-full" onClick={handleLogout}>Salir</Button>
            </>
          )}
          {user?.role === "BUYER" && (
            <>
              <Link href="/my-orders" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Mis compras</Button>
              </Link>
              <Link href="/buyer" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Mi cuenta</Button>
              </Link>
              <Button variant="ghost" className="w-full" onClick={handleLogout}>Salir</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
