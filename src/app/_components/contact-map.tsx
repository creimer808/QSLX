"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const { data: mapData, isLoading } = api.contact.getMapData.useQuery();

  useEffect(() => {
    // Dynamically import Leaflet only on the client side
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current || isInitializingRef.current) return;
      
      isInitializingRef.current = true;

      try {
        const L = await import("leaflet");

        // Fix for default marker icons in Next.js
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Clean up any existing Leaflet instance from the container
        // This handles cases where the component remounts but the DOM element persists
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
          // Clear the container's innerHTML to remove any Leaflet-related DOM elements
          mapRef.current.innerHTML = "";
          delete (mapRef.current as any)._leaflet_id;
        }

        // Initialize map with error handling
        let map;
        try {
          map = L.map(mapRef.current).setView([40.7128, -74.006], 2);
        } catch (initError: any) {
          // If initialization fails due to "already initialized" error,
          // clear the container and try again (this handles edge cases)
          if (initError.message?.includes("already initialized") && mapRef.current) {
            mapRef.current.innerHTML = "";
            delete (mapRef.current as any)._leaflet_id;
            map = L.map(mapRef.current).setView([40.7128, -74.006], 2);
          } else {
            throw initError;
          }
        }

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (error: any) {
        // Suppress "already initialized" errors - they're harmless and often occur
        // due to React Strict Mode double-mounting or navigation remounting
        if (!error?.message?.includes("already initialized")) {
          console.error("Error initializing map:", error);
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initMap();
    }, 0);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
        mapInstanceRef.current = null;
        setMapReady(false);
      }
      // Clear Leaflet's internal reference from the DOM element
      if (mapRef.current) {
        if ((mapRef.current as any)._leaflet_id) {
          delete (mapRef.current as any)._leaflet_id;
        }
        // Clear the container's content to ensure clean state
        mapRef.current.innerHTML = "";
      }
      isInitializingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !mapReady) return;

    const addMarkers = async () => {
      const L = await import("leaflet");
      const map = mapInstanceRef.current;
      
      // Clear existing markers
      map.eachLayer((layer: any) => {
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
    };

    addMarkers();
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
};

export function ContactMap() {
  return <MapComponent />;
}

