import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const markerShadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Provider Icon
const activeProviderIcon = L.divIcon({
    html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-red-600/30 rounded-full animate-ping"></div>
            <div class="relative bg-red-600 p-2.5 rounded-full border-2 border-white shadow-[0_0_20px_#dc2626] z-10 transition-transform hover:scale-125">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
                </svg>
            </div>
           </div>`,
    className: 'custom-active-provider',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

// Component to handle map resizing when container becomes visible
const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }, [map]);
    return null;
};

interface ActiveTracking {
    booking_id: string;
    customer_name: string;
    provider_name: string;
    status: string;
    latitude: number;
    longitude: number;
    pickup_location: string;
    updated_at: string;
}

interface GlobalLogisticsMapProps {
    activeNodes: ActiveTracking[];
}

const GlobalLogisticsMap: React.FC<GlobalLogisticsMapProps> = ({ activeNodes }) => {
    const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default center (India)

    useEffect(() => {
        if (activeNodes.length > 0) {
            // Center on the first active node if available
            setCenter([activeNodes[0].latitude, activeNodes[0].longitude]);
        }
    }, [activeNodes]);

    return (
        <div className="w-full h-full min-h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
            <MapContainer 
                center={center} 
                zoom={5} 
                className="w-full h-full"
                scrollWheelZoom={true}
            >
                <ResizeMap />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {activeNodes.map((node) => (
                    <Marker 
                        key={node.booking_id} 
                        position={[node.latitude, node.longitude]} 
                        icon={activeProviderIcon}
                    >
                        <Popup className="admin-map-popup">
                            <div className="p-2 min-w-[200px] font-sans">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Active Mission</p>
                                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">{node.booking_id.substring(0,8)}...</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Provider:</span>
                                        <span className="font-bold text-gray-800">{node.provider_name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Customer:</span>
                                        <span className="font-bold text-gray-800">{node.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Location:</span>
                                        <span className="font-bold text-gray-800 truncate ml-2">{node.pickup_location}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-50 text-[9px] font-black text-gray-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span>LAST SIGNAL: {new Date(node.updated_at).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
                <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Fleet Overview</h5>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse border border-white/20" />
                    <span className="text-xs text-gray-300 font-medium">Active Transit ({activeNodes.length})</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalLogisticsMap;
