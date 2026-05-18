import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({ value }: { value: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView(value, 16);
  }, [value, map]);

  return null;
}

export function LocationPicker({ value, onChange }: any) {
  const position = value || {
    lat: -24.7821,
    lng: -65.4232,
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        onChange({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });

    return null;
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap value={value} />
        <MapClickHandler />

        <Marker position={position} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
