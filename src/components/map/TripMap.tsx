"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TripItem } from "@/lib/types";
import L from "leaflet";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Plane, Hotel, Utensils, MapPin, Car, Train, Bus, Ship, Ticket } from "lucide-react";

// Helper to get icon for item type
const getItemIcon = (type: string) => {
    const props = { size: 20, color: "white" };
    switch (type) {
        case 'flight': return <Plane {...props} />;
        case 'hotel': return <Hotel {...props} />;
        case 'restaurant': return <Utensils {...props} />;
        case 'activity': return <Ticket {...props} />;
        case 'transportation': return <Car {...props} />; // Generic transport
        default: return <MapPin {...props} />;
    }
};

const getItemColor = (type: string) => {
    switch (type) {
        case 'flight': return '#3b82f6'; // blue-500
        case 'hotel': return '#8b5cf6'; // violet-500
        case 'restaurant': return '#f97316'; // orange-500
        case 'activity': return '#10b981'; // emerald-500
        case 'transportation': return '#64748b'; // slate-500
        default: return '#ef4444'; // red-500
    }
};

const createCustomIcon = (type: string) => {
    const iconMarkup = renderToStaticMarkup(
        <div style={{
            backgroundColor: getItemColor(type),
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
            {getItemIcon(type)}
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32], // Bottom center
        popupAnchor: [0, -32]
    });
};

interface TripMapProps {
    items: TripItem[];
    focusedItem?: TripItem | null;
}

function MapUpdater({ items }: { items: TripItem[] }) {
    const map = useMap();

    useEffect(() => {
        if (items.length > 0) {
            // Filter out items without coordinates
            const validItems = items.filter(i => i.latitude && i.longitude);

            if (validItems.length > 0) {
                const points: L.LatLngExpression[] = validItems.map(i => [i.latitude!, i.longitude!]);

                // Add arrival points for flights
                items.forEach(i => {
                    if (i.type === 'flight' && i.arrivalLocationLat && i.arrivalLocationLng) {
                        points.push([i.arrivalLocationLat, i.arrivalLocationLng]);
                    }
                });

                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [items, map]);

    return null;
}

function FocusHandler({ focusedItem }: { focusedItem: TripItem | null }) {
    const map = useMap();

    useEffect(() => {
        if (focusedItem && focusedItem.latitude && focusedItem.longitude) {
            // If it's a flight with arrival coordinates, fit bounds to show both
            if (focusedItem.type === 'flight' && focusedItem.arrivalLocationLat && focusedItem.arrivalLocationLng) {
                const bounds = L.latLngBounds(
                    [focusedItem.latitude, focusedItem.longitude],
                    [focusedItem.arrivalLocationLat, focusedItem.arrivalLocationLng]
                );
                map.flyToBounds(bounds, {
                    padding: [50, 50],
                    duration: 1.5
                });
            } else {
                // Otherwise just fly to the location
                map.flyTo([focusedItem.latitude, focusedItem.longitude], 16, {
                    duration: 1.5
                });
            }
        }
    }, [focusedItem, map]);

    return null;
}

export default function TripMap({ items, focusedItem }: TripMapProps) {
    // Filter items with coordinates
    const validItems = items.filter(item => item.latitude && item.longitude);

    // Default center (e.g., Paris) if no items
    const center: [number, number] = validItems.length > 0
        ? [validItems[0].latitude!, validItems[0].longitude!]
        : [48.8566, 2.3522];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", minHeight: "400px", borderRadius: "0.5rem" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater items={validItems} />
            <FocusHandler focusedItem={focusedItem || null} />
            {/* Flight Paths */}
            {items.filter(i => i.type === 'flight' && i.latitude && i.longitude && i.arrivalLocationLat && i.arrivalLocationLng).map(item => (
                <Polyline
                    key={`path-${item.id}`}
                    positions={[
                        [item.latitude!, item.longitude!],
                        [item.arrivalLocationLat!, item.arrivalLocationLng!]
                    ]}
                    pathOptions={{ color: '#3b82f6', dashArray: '10, 10', weight: 2 }}
                />
            ))}
            {/* Markers */}
            {validItems.map((item) => (
                <Marker
                    key={item.id}
                    position={[item.latitude!, item.longitude!]}
                    icon={createCustomIcon(item.type)}
                >
                    <Popup>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{item.type}</div>
                        {item.address && <div className="text-xs mt-1">{item.address}</div>}
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                            Get Directions
                        </a>
                    </Popup>
                </Marker>
            ))}
            {/* Arrival Markers for Flights */}
            {items.filter(i => i.type === 'flight' && i.arrivalLocationLat && i.arrivalLocationLng).map(item => (
                <Marker
                    key={`arrival-${item.id}`}
                    position={[item.arrivalLocationLat!, item.arrivalLocationLng!]}
                    icon={createCustomIcon('flight')}
                >
                    <Popup>
                        <div className="font-semibold">Arrival: {item.name}</div>
                        <div className="text-sm text-gray-500">Flight {item.flightNumber}</div>
                        {item.arrivalLocationName && <div className="text-xs mt-1">{item.arrivalLocationName}</div>}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
