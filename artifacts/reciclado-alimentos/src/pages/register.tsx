import { Link } from "wouter";
import { Store, ShoppingBag, ArrowRight, Leaf } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Creá tu cuenta</h1>
          <p className="text-muted-foreground">Elegí cómo querés participar en Rescaté</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link href="/register/merchant">
            <div className="bg-card border-2 border-primary/20 hover:border-primary rounded-2xl p-7 cursor-pointer transition-all hover:shadow-md group" data-testid="card-register-merchant">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Soy un comercio</h2>
              <p className="text-muted-foreground text-sm mb-4">Publicá tus productos próximos a vencer y recibí ingresos que de otra forma perderías.</p>
              <div className="flex items-center gap-1 text-primary font-medium text-sm">
                Registrar comercio <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/register/buyer">
            <div className="bg-card border-2 border-border hover:border-accent rounded-2xl p-7 cursor-pointer transition-all hover:shadow-md group" data-testid="card-register-buyer">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <ShoppingBag className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Quiero comprar</h2>
              <p className="text-muted-foreground text-sm mb-4">Encontrá productos con descuentos reales en comercios cerca tuyo y ayudá al ambiente.</p>
              <div className="flex items-center gap-1 text-accent font-medium text-sm">
                Crear cuenta de comprador <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">Iniciá sesión</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
