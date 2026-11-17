import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  center: { lat: number; lng: number };
  zoom: number;
  routeCoordinates?: [number, number][];
  userLocation?: { lat: number; lng: number } | null;
}

export function MapController({ center, zoom, routeCoordinates, userLocation }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.5 });
    } else if (routeCoordinates && routeCoordinates.length >= 2) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 1.2 });
    }
  }, [center.lat, center.lng, zoom, routeCoordinates, userLocation, map]);

  return null;
}

