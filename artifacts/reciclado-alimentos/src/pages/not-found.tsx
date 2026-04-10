import { Link } from "wouter";
import { ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-3">404</h1>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-3">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          La página que estás buscando no existe o fue movida.
        </p>
        <Link href="/">
          <Button className="bg-primary text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
