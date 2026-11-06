import React, { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { LiveBusTracking, BusStop } from '../types';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

interface LiveMapProps {
  buses: LiveBusTracking[];
  stops: BusStop[];
  selectedBusNumber?: string;
  onSelectBus?: (busNumber: string) => void;
  center?: [number, number];
  zoom?: number;
  routeCoordinates?: [number, number][];
}

// Google Maps Polyline renderer for bus routes
function GoogleMapPolyline({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length < 2 || typeof google === 'undefined') return;

    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#dc2626', // KSRTC Red
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: map
    });

    // Auto-fit bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  return null;
}

// Map camera controller to smoothly pan when center coordinates change
function MapCameraController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (map && center.lat && center.lng) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);

  return null;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  buses,
  stops,
  selectedBusNumber,
  onSelectBus,
  center = [12.9716, 77.5946],
  zoom = 9,
  routeCoordinates
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyAHn8vG7dci5QW7tbDJKTZOtiEQvtTntjs';

  const [activeInfoWindow, setActiveInfoWindow] = useState<{
    type: 'bus' | 'stop';
    data: LiveBusTracking | BusStop;
    position: { lat: number; lng: number };
  } | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Convert polyline coordinates to Google Maps LatLngLiterals
  const googlePath = (routeCoordinates || []).map(([lat, lng]) => ({ lat, lng }));

  // Find center bus coordinate if selected
  const selectedBus = buses.find((b) => b.busNumber === selectedBusNumber);
  const currentCenter = selectedBus
    ? { lat: selectedBus.currentLat, lng: selectedBus.currentLng }
    : { lat: center[0], lng: center[1] };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900">
      <APIProvider 
        apiKey={apiKey} 
        libraries={['marker', 'routes', 'places']}
      >
        <Map
          style={{ width: '100%', height: '100%', minHeight: '460px' }}
          defaultCenter={currentCenter}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Smooth camera sync */}
          <MapCameraController center={currentCenter} />

          {/* Route path polyline */}
          {googlePath.length > 1 && <GoogleMapPolyline path={googlePath} />}

          {/* 1. Bus Stop Advanced Markers */}
          {stops.map((stop) => (
            <AdvancedMarker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={stop.nameEn}
              onClick={() =>
                setActiveInfoWindow({
                  type: 'stop',
                  data: stop,
                  position: { lat: stop.lat, lng: stop.lng }
                })
              }
            >
              <div className="group relative flex items-center justify-center cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white shadow-lg border-2 border-white flex items-center justify-center transition-transform group-hover:scale-125">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {/* 2. Live Moving KSRTC Buses with Advanced Markers */}
          {buses.map((bus) => {
            const isSelected = bus.busNumber === selectedBusNumber;

            return (
              <AdvancedMarker
                key={bus.busNumber}
                position={{ lat: bus.currentLat, lng: bus.currentLng }}
                title={`${bus.busNumber} - ${bus.routeNameEn}`}
                onClick={() => {
                  onSelectBus?.(bus.busNumber);
                  setActiveInfoWindow({
                    type: 'bus',
                    data: bus,
                    position: { lat: bus.currentLat, lng: bus.currentLng }
                  });
                }}
              >
                <div className="relative flex flex-col items-center cursor-pointer">
                  {/* Bus Pin Icon */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl shadow-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white border-amber-300 scale-125 z-30 ring-4 ring-red-500/30'
                        : 'bg-red-600 text-white border-white hover:scale-110 z-20'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 6v6" />
                      <path d="M15 6v6" />
                      <path d="M2 12h19.6" />
                      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                      <circle cx="7" cy="18" r="2" />
                      <path d="M9 18h5" />
                      <circle cx="16" cy="18" r="2" />
                    </svg>

                    {/* Live AIS-140 GPS pulsing status pip */}
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        bus.isGpsLive
                          ? 'bg-emerald-400 border border-white animate-pulse'
                          : 'bg-amber-400 border border-white'
                      }`}
                    />
                  </div>

                  {/* Number Plate Tag */}
                  <div className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white whitespace-nowrap shadow-md">
                    {bus.busNumber} • {bus.speedKmh} km/h
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow on Click */}
          {activeInfoWindow && (
            <InfoWindow
              position={activeInfoWindow.position}
              onCloseClick={() => setActiveInfoWindow(null)}
              maxWidth={260}
            >
              {activeInfoWindow.type === 'bus' ? (
                (() => {
                  const bus = activeInfoWindow.data as LiveBusTracking;
                  return (
                    <div className="p-1 text-slate-900">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1">
                        <span className="text-xs font-bold text-red-600 font-mono">
                          {bus.busNumber}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {bus.isGpsLive ? 'AIS-140 GPS' : 'Estimated'}
                        </span>
                      </div>
                      <div className="font-bold text-sm leading-snug">{bus.routeNameEn}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Category: <strong className="text-slate-800">{bus.category}</strong>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Next: <strong className="text-slate-900">{bus.nextStopNameEn}</strong>
                      </div>
                      <div className="text-xs text-slate-600">
                        Speed: <strong className="text-red-600 font-mono">{bus.speedKmh} km/h</strong>
                      </div>
                      <div className="text-xs text-slate-600">
                        Est. Arrival: <strong className="text-emerald-700 font-semibold">{bus.estimatedArrivalNextStopMinutes} mins</strong>
                      </div>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const stop = activeInfoWindow.data as BusStop;
                  return (
                    <div className="p-1 text-slate-900">
                      <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        {stop.stationType} Station
                      </div>
                      <div className="font-bold text-sm mt-0.5">{stop.nameEn}</div>
                      <div className="text-xs text-slate-500">{stop.nameKn}</div>
                      <div className="text-[11px] text-slate-600 mt-1">{stop.addressEn}</div>
                      {stop.platformBays && (
                        <div className="mt-1 text-[11px] font-bold text-slate-800">
                          Platform Bays: {stop.platformBays}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Controls: Map Style Toggle & Legend */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mapType === 'roadmap'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mapType === 'satellite'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            mapType === 'terrain'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Floating map legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600 border border-white" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Google Maps Live Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">AIS-140 GPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-white" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">KSRTC Station</span>
        </div>
      </div>
    </div>
  );
};
