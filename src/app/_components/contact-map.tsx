"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function ContactMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { data: mapData, isLoading } = api.contact.getMapData.useQuery();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.006], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !mapReady) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each contact
    mapData.forEach((contact) => {
      if (contact.latitude && contact.longitude) {
        const marker = L.marker([contact.latitude, contact.longitude]).addTo(map);
        const popupContent = `
          <div class="p-2">
            <strong>${contact.callsign}</strong><br/>
            ${contact.date ? new Date(contact.date).toLocaleDateString() : ""}<br/>
            ${contact.band ? `Band: ${contact.band}` : ""}<br/>
            ${contact.mode ? `Mode: ${contact.mode}` : ""}<br/>
            ${contact.country ? `Country: ${contact.country}` : ""}
          </div>
        `;
        marker.bindPopup(popupContent);
      }
    });

    // Fit map to show all markers
    if (mapData.length > 0 && mapData.some((c) => c.latitude && c.longitude)) {
      const bounds = L.latLngBounds(
        mapData
          .filter((c) => c.latitude && c.longitude)
          .map((c) => [c.latitude!, c.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapData, mapReady]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (!mapData || mapData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">No location data available. Add contacts with coordinates to see them on the map.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Contact Locations</h3>
        <p className="text-sm text-gray-500">{mapData.length} contacts with location data</p>
      </div>
      <div ref={mapRef} className="h-96 w-full rounded-b-lg" />
    </div>
  );
}

