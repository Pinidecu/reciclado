import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RADII = [
  { label: "1 km", value: 1 },
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
];

export default function NearbyPage() {
  const [radius, setRadius] = useState(5);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const { data, isLoading } = useListProducts({ lat: userLat ?? undefined, lng: userLng ?? undefined, radius, limit: 12 });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setLocationEnabled(true);
        },
        () => setLocationEnabled(false)
      );
    }
  };

  // Mock map markers from products
  const markers = data?.products?.slice(0, 8) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Cerca de mí</h1>
          <p className="text-muted-foreground">Encontrá productos en comercios de tu zona</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map visual */}
          <div className="lg:w-1/2">
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
              {/* Filters */}
              <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">Radio:</span>
                {RADII.map(r => (
                  <Badge
                    key={r.value}
                    variant={radius === r.value ? "default" : "outline"}
                    className={`cursor-pointer ${radius === r.value ? "bg-primary text-white" : "hover:border-primary hover:text-primary"}`}
                    onClick={() => setRadius(r.value)}
                    data-testid={`badge-radius-${r.value}`}
                  >
                    {r.label}
                  </Badge>
                ))}
                {!locationEnabled && (
                  <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={handleGetLocation} data-testid="button-get-location">
                    <Navigation className="w-3.5 h-3.5" />
                    Usar mi ubicación
                  </Button>
                )}
              </div>

              {/* Mock map */}
              <div className="relative h-80 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full h-px bg-primary/30" style={{ top: `${i * 14}%` }} />
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full w-px bg-primary/30" style={{ left: `${i * 14}%` }} />
                  ))}
                </div>

                {/* Mock streets */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/3 w-full h-2 bg-gray-400 rounded" />
                  <div className="absolute top-2/3 w-full h-2 bg-gray-400 rounded" />
                  <div className="absolute left-1/4 h-full w-2 bg-gray-400 rounded" />
                  <div className="absolute left-3/4 h-full w-2 bg-gray-400 rounded" />
                </div>

                {/* Radius circle */}
                <div className="absolute w-56 h-56 rounded-full border-2 border-primary/30 bg-primary/5" />
                <div className="absolute w-32 h-32 rounded-full border border-primary/20 bg-primary/5" />

                {/* User position */}
                {locationEnabled && (
                  <div className="absolute z-10 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg" title="Tu ubicación" />
                )}

                {/* Product markers */}
                {markers.map((p, i) => {
                  const x = 20 + (i % 4) * 18 + Math.sin(i) * 8;
                  const y = 20 + Math.floor(i / 4) * 30 + Math.cos(i) * 8;
                  return (
                    <div
                      key={p.id}
                      className="absolute z-10 w-8 h-8 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={p.name}
                      data-testid={`marker-product-${p.id}`}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  );
                })}

                {!locationEnabled && (
                  <div className="relative z-20 text-center p-4">
                    <MapPin className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Activá tu ubicación para ver comercios cercanos</p>
                    <Button size="sm" className="mt-2 bg-primary text-white" onClick={handleGetLocation} data-testid="button-enable-location">
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      Activar ubicación
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products list */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                {isLoading ? "Cargando..." : `${data?.total ?? 0} productos encontrados`}
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="text-center py-12 bg-card border border-card-border rounded-2xl">
                <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">Sin productos en esta zona</p>
                <p className="text-muted-foreground text-sm mt-1">Ampliá el radio de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {data?.products?.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
