import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useListProducts, useListMerchants } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const RADII = [
  { label: "1 km", value: 1 },
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
];

const merchantIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 14);
    }
  }, [lat, lng, map]);

  return null;
}

export default function NearbyPage() {
  const [radius, setRadius] = useState(5);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const { data, isLoading } = useListProducts({
    lat: userLat ?? undefined,
    lng: userLng ?? undefined,
    radius,
    limit: 12,
  });

  const { data: productsData, isLoading: productsLoading } = useListProducts({
    lat: userLat ?? undefined,
    lng: userLng ?? undefined,
    radius,
    limit: 12,
  });

  const { data: merchants, isLoading: merchantsLoading } = useListMerchants();

  console.log("Merchats: ", merchants);

  const merchantMarkers =
    merchants?.filter((m) => m.latitude && m.longitude) ?? [];

  const mapCenter: [number, number] =
    userLat && userLng
      ? [userLat, userLng]
      : merchantMarkers.length > 0
        ? [
            Number(merchantMarkers[0].latitude),
            Number(merchantMarkers[0].longitude),
          ]
        : [-24.7821, -65.4232];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setLocationEnabled(true);
        },
        () => setLocationEnabled(false),
      );
    }
  };
 

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
            Cerca de mí
          </h1>
          <p className="text-muted-foreground">
            Encontrá productos en comercios de tu zona
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map visual */}
          <div className="lg:w-1/2">
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
              {/* Filters */}
              <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  Radio:
                </span>
                {RADII.map((r) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 ml-auto"
                    onClick={handleGetLocation}
                    data-testid="button-get-location"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Usar mi ubicación
                  </Button>
                )}
              </div>

              {/* Mapa */}

              <div className="h-80 w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterMap lat={userLat} lng={userLng} />

                  {locationEnabled && userLat && userLng && (
                    <>
                      <Marker position={[userLat, userLng]} icon={merchantIcon}>
                        <Popup>Tu ubicación</Popup>
                      </Marker>

                      <Circle
                        center={[userLat, userLng]}
                        radius={radius * 1000}
                      />
                    </>
                  )}

                  {merchantMarkers.map((m) => (
                    <Marker
                      key={m.id}
                      position={[Number(m.latitude), Number(m.longitude)]}
                      icon={merchantIcon}
                    >
                      <Popup>
                        <div>
                          <strong>{m.businessName}</strong>
                          <br />
                          {m.category}
                          <br />
                          {m.addressLine}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Market list */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                {merchantsLoading
                  ? "Cargando..."
                  : `${merchants?.length ?? 0} negocios encontrados`}
              </h2>
            </div>

            {merchantsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : merchants?.length === 0 ? (
              <div className="text-center py-12 bg-card border border-card-border rounded-2xl">
                <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">
                  Sin negocios en esta zona
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Ampliá el radio de búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {merchants?.map((m) => (
                  <div
                    key={m.id}
                    className="bg-card border border-card-border rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      {m.logoUrl && (
                        <img
                          src={m.logoUrl}
                          alt={m.businessName}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {m.businessName}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {m.category}
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                          {m.addressLine}
                        </p>

                        <div className="mt-2">
                          <Badge variant={m.isOpen ? "default" : "secondary"}>
                            {m.isOpen ? "Abierto" : "Cerrado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products list */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                {isLoading
                  ? "Cargando..."
                  : `${data?.total ?? 0} productos encontrados`}
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="text-center py-12 bg-card border border-card-border rounded-2xl">
                <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">
                  Sin productos en esta zona
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Ampliá el radio de búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {data?.products?.map((p) => (
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
