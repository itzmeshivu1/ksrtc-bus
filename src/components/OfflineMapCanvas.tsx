import React, { useRef, useEffect, useState } from 'react';
import { LiveBusTracking, BusStop } from '../types';
import { 
  latLngToTile, 
  getTileUrl, 
  getCachedTileBlobUrl 
} from '../services/tileCacheService';
import { ZoomIn, ZoomOut, Compass, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineMapCanvasProps {
  buses: LiveBusTracking[];
  stops: BusStop[];
  selectedBusNumber?: string;
  onSelectBus?: (busNumber: string) => void;
  center?: [number, number];
  zoom?: number;
  routeCoordinates?: [number, number][];
}

export const OfflineMapCanvas: React.FC<OfflineMapCanvasProps> = ({
  buses,
  stops,
  selectedBusNumber,
  onSelectBus,
  center = [12.9716, 77.5946],
  zoom = 9,
  routeCoordinates = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive Pan & Zoom state
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: center[0],
    lng: center[1]
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update center when prop changes
  useEffect(() => {
    setMapCenter({ lat: center[0], lng: center[1] });
  }, [center[0], center[1]]);

  // Project lat/lng to canvas pixel coordinates relative to mapCenter and zoom
  const project = (lat: number, lng: number, width: number, height: number) => {
    const scale = (256 * Math.pow(2, currentZoom)) / (2 * Math.PI);
    
    const centerLatRad = (mapCenter.lat * Math.PI) / 180;
    const centerMercY = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));
    const centerMercX = (mapCenter.lng * Math.PI) / 180;

    const targetLatRad = (lat * Math.PI) / 180;
    const targetMercY = Math.log(Math.tan(Math.PI / 4 + targetLatRad / 2));
    const targetMercX = (lng * Math.PI) / 180;

    const x = width / 2 + (targetMercX - centerMercX) * scale;
    const y = height / 2 - (targetMercY - centerMercY) * scale;

    return { x, y };
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 460;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 1. Fill base background (soft topographical slate/cream)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 2. Render subtle coordinate grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 3. Draw Karnataka regional highway backbone corridor vectors
    const highways = [
      // Bengaluru -> Mysuru expressway corridor
      [
        { lat: 12.9784, lng: 77.5714 },
        { lat: 12.9515, lng: 77.5442 },
        { lat: 12.7214, lng: 77.2801 },
        { lat: 12.6517, lng: 77.2064 },
        { lat: 12.5841, lng: 77.0452 },
        { lat: 12.5238, lng: 76.8967 },
        { lat: 12.4239, lng: 76.6946 },
        { lat: 12.3117, lng: 76.6579 }
      ],
      // Bengaluru -> Mangaluru corridor (NH-75 via Hassan)
      [
        { lat: 12.9515, lng: 77.5442 },
        { lat: 12.9069, lng: 76.3887 },
        { lat: 13.0033, lng: 76.1004 },
        { lat: 12.9438, lng: 75.7871 },
        { lat: 12.8837, lng: 74.8436 }
      ],
      // Bengaluru -> Hubballi -> Belagavi corridor (NH-48)
      [
        { lat: 12.9784, lng: 77.5714 },
        { lat: 13.3422, lng: 77.1017 },
        { lat: 15.3524, lng: 75.1481 },
        { lat: 15.8643, lng: 74.5085 }
      ]
    ];

    highways.forEach((hw) => {
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      hw.forEach((pt, i) => {
        const { x, y } = project(pt.lat, pt.lng, width, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Highway inner road stripe
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // 4. Render active route polyline (KSRTC Crimson Red)
    if (routeCoordinates && routeCoordinates.length > 1) {
      // Glow shadow
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      routeCoordinates.forEach(([lat, lng], i) => {
        const { x, y } = project(lat, lng, width, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Main route line
      ctx.beginPath();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      routeCoordinates.forEach(([lat, lng], i) => {
        const { x, y } = project(lat, lng, width, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 5. Render Bus Stops & Stations
    stops.forEach((stop) => {
      const { x, y } = project(stop.lat, stop.lng, width, height);

      // Station node circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Station label
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(stop.nameEn.split('(')[0].trim(), x, y - 10);
    });

    // 6. Render live buses
    buses.forEach((bus) => {
      const isSelected = bus.busNumber === selectedBusNumber;
      const { x, y } = project(bus.currentLat, bus.currentLng, width, height);

      // Pulsing circle
      if (bus.isGpsLive) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
      }

      // Bus Box
      ctx.save();
      ctx.translate(x, y);
      
      // Outer shadow & background
      ctx.fillStyle = isSelected ? '#b91c1c' : '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-16, -16, 32, 32, 8);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fef08a' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bus icon glyph
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚌', 0, 0);

      ctx.restore();

      // Number plate caption
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`${bus.busNumber} (${bus.speedKmh} km/h)`, x, y + 26);
    });

  }, [buses, stops, selectedBusNumber, mapCenter, currentZoom, routeCoordinates]);

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const scale = (256 * Math.pow(2, currentZoom)) / (2 * Math.PI);
    const dLng = (dx / scale) * (180 / Math.PI);
    const dLat = (dy / scale) * (180 / Math.PI);

    setMapCenter((prev) => ({
      lat: Math.max(11, Math.min(19, prev.lat + dLat * 0.8)),
      lng: Math.max(73, Math.min(79, prev.lng - dLng * 0.8))
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900 select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: '460px', display: 'block' }}
      />

      {/* Top Banner: Offline Cached Tile Mode */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-amber-500/90 text-white px-3 py-1.5 rounded-xl shadow-md text-xs font-bold backdrop-blur-md">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Cached Route & Tile Vector Engine (Offline/Intermittent Mode)</span>
      </div>

      {/* Zoom & Pan Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <button
          onClick={() => setCurrentZoom((z) => Math.min(14, z + 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentZoom((z) => Math.max(6, z - 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setMapCenter({ lat: center[0], lng: center[1] });
            setCurrentZoom(zoom);
          }}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Reset Center"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600 border border-white" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Cached Bus GPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-white" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Station Vector</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-4 bg-red-600 rounded" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Highway Track</span>
        </div>
      </div>
    </div>
  );
};
