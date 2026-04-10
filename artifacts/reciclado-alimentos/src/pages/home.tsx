import { Link } from "wouter";
import { ArrowRight, Store, ShoppingBag, Leaf, TrendingDown, Users, MapPin, Shield, CheckCircle2, Sprout, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetPublicStats, useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { formatARS } from "@/lib/format";

function StatCard({ value, label, sublabel }: { value: string | number; label: string; sublabel?: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-primary mb-1">{value}</div>
      <div className="text-foreground font-medium">{label}</div>
      {sublabel && <div className="text-muted-foreground text-sm mt-0.5">{sublabel}</div>}
    </div>
  );
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-primary">{num}</span>
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const { data: stats } = useGetPublicStats();
  const { data: featuredData } = useListProducts({ featured: true, limit: 3 });
  const { data: productsData } = useListProducts({ limit: 6 });

  const displayProducts = featuredData?.products?.length ? featuredData.products : productsData?.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sprout className="w-4 h-4" />
              Menos desperdicio. Más ahorro.
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
              Productos frescos<br />
              <span className="text-primary">a precios reales.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mb-8">
              Conectamos comercios con compradores para recuperar el valor de productos próximos a vencer. Bueno para tu bolsillo, mejor para el planeta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register/merchant">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 h-12 px-6 text-base" data-testid="button-cta-merchant">
                  <Store className="w-5 h-5" />
                  Registrá tu comercio
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="gap-2 h-12 px-6 text-base border-2" data-testid="button-cta-explore">
                  <ShoppingBag className="w-5 h-5" />
                  Explorar productos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              value={stats ? `${stats.kgRescued.toFixed(0)} kg` : "0 kg"}
              label="Alimentos rescatados"
              sublabel="de la basura"
            />
            <StatCard
              value={stats?.totalOrders ?? 0}
              label="Compras realizadas"
              sublabel="por compradores"
            />
            <StatCard
              value={stats?.merchantsCount ?? 0}
              label="Comercios adheridos"
              sublabel="en Argentina"
            />
            <StatCard
              value={stats ? `${stats.co2Avoided.toFixed(1)} kg` : "0 kg"}
              label="CO₂ evitado"
              sublabel="estimado"
            />
          </div>
        </div>
      </section>

      {/* Featured products */}
      {displayProducts.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Productos disponibles</h2>
              <p className="text-muted-foreground mt-1">Descuentos reales en comercios de tu zona</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="gap-2 text-primary" data-testid="link-ver-todos">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Benefits merchants */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-primary font-semibold mb-2 text-sm uppercase tracking-widest">Para comercios</p>
            <h2 className="text-4xl font-serif font-bold mb-4">Convertí el stock que expira en ingresos reales</h2>
            <p className="text-background/70">Publicá tus productos cerca de vencerse y llegá a cientos de compradores activos. Sin complicaciones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CircleDollarSign, title: "Recuperá dinero", desc: "Cada producto vendido es un ingreso real en lugar de una pérdida directa." },
              { icon: Users, title: "Nuevos clientes", desc: "Llegá a compradores que no te conocían, que luego vuelven." },
              { icon: TrendingDown, title: "Gestión simple", desc: "Publicá, pausá y gestioná tu stock desde cualquier dispositivo." },
              { icon: Leaf, title: "Impacto positivo", desc: "Mostrá a tus clientes que tu comercio cuida el ambiente." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-background/5 rounded-2xl p-5 border border-background/10">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-background/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/register/merchant">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2" data-testid="button-merchant-register">
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits buyers */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-accent font-semibold mb-2 text-sm uppercase tracking-widest">Para compradores</p>
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Ahorros reales en productos que funcionan</h2>
          <p className="text-muted-foreground">Encontrá ofertas de comercios cercanos, comprá en segundos y retirá con tu código QR. Sin sorpresas.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          {[
            { icon: TrendingDown, title: "Descuentos de verdad", desc: "Los descuentos van del 30% al 70% sobre el precio original. Nada de marketing engañoso." },
            { icon: MapPin, title: "Cerca tuyo", desc: "Filtrá por distancia y encontrá comercios a pocos minutos de donde estás." },
            { icon: Shield, title: "Compra segura", desc: "Pagás online y retirás mostrando tu QR. Simple, rápido y sin efectivo." },
            { icon: Leaf, title: "Con propósito", desc: "Cada compra evita que ese alimento termine en la basura. El ambiente te lo agradece." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-card border border-card-border rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/register/buyer">
            <Button size="lg" variant="outline" className="gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white" data-testid="button-buyer-register">
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Cómo funciona</p>
            <h2 className="text-4xl font-serif font-bold text-foreground">Cuatro pasos. Sin complicaciones.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard num={1} title="El comercio publica" desc="Carga sus productos con foto, precio y fecha límite de retiro." />
            <StepCard num={2} title="Vos encontrás" desc="Explorás el catálogo o el mapa y elegís lo que te interesa." />
            <StepCard num={3} title="Comprás online" desc="Pagás con tarjeta y recibís tu comprobante con código QR." />
            <StepCard num={4} title="Retirás en el local" desc="Mostrás tu QR en el comercio y te llevás el producto." />
          </div>
        </div>
      </section>

      {/* Environmental impact */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Impacto ambiental
            </div>
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Cada compra salva algo más que plata</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              El desperdicio alimentario genera el 8% de las emisiones globales de gases de efecto invernadero. Con Rescaté, cada producto vendido es un producto que no va al relleno sanitario.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Menos alimentos en rellenos sanitarios",
                "Menor producción de metano por descomposición",
                "Más conciencia en productores y consumidores",
              ].map(text => (
                <div key={text} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">{stats ? `${stats.kgRescued.toFixed(0)}` : "0"}</div>
              <div className="text-xs text-muted-foreground mt-1">kg rescatados</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-accent">{stats?.totalOrders ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">compras</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-foreground">{stats?.merchantsCount ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">comercios</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">{stats ? `${stats.co2Avoided.toFixed(1)}` : "0"}</div>
              <div className="text-xs text-muted-foreground mt-1">kg CO₂ evitado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Sumáte al movimiento</h2>
          <p className="text-white/80 mb-8 text-lg">
            Somos una comunidad que cree que los alimentos tienen valor hasta el último día. Unite a los comercios y compradores que ya forman parte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/merchant">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 font-semibold" data-testid="button-final-merchant">
                <Store className="w-5 h-5" />
                Soy un comercio
              </Button>
            </Link>
            <Link href="/register/buyer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2 font-semibold" data-testid="button-final-buyer">
                <ShoppingBag className="w-5 h-5" />
                Quiero comprar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
