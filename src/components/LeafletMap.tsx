import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PORDENONE_CENTER, polygonCenter, type LatLng } from "@/lib/geo";

export type MapMode = "view" | "draw" | "pick";

export interface LeafletMapProps {
  mode: MapMode;
  polygon: LatLng[];
  marker?: LatLng | null | undefined;
  points?: LatLng[] | undefined;
  onPolygonChange?: ((polygon: LatLng[]) => void) | undefined;
  onMarkerChange?: ((marker: LatLng | null) => void) | undefined;
  className?: string | undefined;
}


export default function LeafletMap({
  mode,
  polygon,
  marker = null,
  points = [],
  onPolygonChange,
  onMarkerChange,
  className,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const handlersRef = useRef({ mode, polygon, onPolygonChange, onMarkerChange });

  handlersRef.current = { mode, polygon, onPolygonChange, onMarkerChange };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: PORDENONE_CENTER,
      zoom: 14,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on("click", (e: L.LeafletMouseEvent) => {
      const current = handlersRef.current;
      const p: LatLng = [e.latlng.lat, e.latlng.lng];
      if (current.mode === "draw") {
        current.onPolygonChange?.([...current.polygon, p]);
      } else if (current.mode === "pick") {
        current.onMarkerChange?.(p);
      }
    });

    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (polygon.length >= 2) {
      const shape =
        polygon.length >= 3
          ? L.polygon(polygon, {
              color: "#f5b700",
              weight: 3,
              fillColor: "#1a9ad7",
              fillOpacity: 0.18,
            })
          : L.polyline(polygon, { color: "#f5b700", weight: 3 });
      shape.addTo(layer);
    }

    if (mode === "draw") {
      polygon.forEach(([lat, lng], i) => {
        L.circleMarker([lat, lng], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: "#e63946",
          fillOpacity: 1,
        })
          .bindTooltip(String(i + 1))
          .addTo(layer);
      });
    }

    if (marker) {
      L.circleMarker(marker, {
        radius: 9,
        color: "#ffffff",
        weight: 3,
        fillColor: "#e63946",
        fillOpacity: 1,
      }).addTo(layer);
    }

    points.forEach((p) => {
      L.circleMarker(p, {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: "#e63946",
        fillOpacity: 0.9,
      }).addTo(layer);
    });

    const all: LatLng[] = [...polygon, ...points, ...(marker ? [marker] : [])];
    if (all.length >= 2) {
      map.fitBounds(L.latLngBounds(all).pad(0.25), { animate: false });
    } else if (all.length === 1) {
      map.setView(all[0]!, 16, { animate: false });
    } else {
      map.setView(polygonCenter(polygon), 14, { animate: false });
    }
  }, [polygon, marker, points, mode]);

  return <div ref={containerRef} className={className} />;
}
