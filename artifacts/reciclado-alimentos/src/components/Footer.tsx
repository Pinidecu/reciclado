import { Link } from "wouter";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">Rescaté</span>
            </div>
            <p className="text-background/60 text-sm max-w-sm">
              26Conectamos comercios con compradores para recuperar el valor de productos que estaban destinados al desperdicio. Argentina, 2025.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Plataforma</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-background/60 hover:text-background text-sm transition-colors">Ver productos</Link></li>
              <li><Link href="/nearby" className="text-background/60 hover:text-background text-sm transition-colors">Cerca de mí</Link></li>
              <li><Link href="/register/merchant" className="text-background/60 hover:text-background text-sm transition-colors">Para comercios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Sobre el proyecto</a></li>
              <li><a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Contacto</a></li>
              <li><a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-background/40 text-xs">
          © 2025 Rescaté — Menos desperdicio. Más ahorro. Argentina.
        </div>
      </div>
    </footer>
  );
}
