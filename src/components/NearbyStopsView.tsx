import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Clock, 
  Bus, 
  Footprints, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Building,
  ArrowRight
} from 'lucide-react';
import { BusStop, LiveBusTracking, Language } from '../types';
import { getT } from '../data/translations';
import { calculateDistanceKm, formatDistance, estimateWalkingTimeMinutes } from '../utils/geoUtils';

interface NearbyStopsViewProps {
  stops: BusStop[];
  buses: LiveBusTracking[];
  onSelectBus: (busNumber: string) => void;
  lang: Language;
}

export const NearbyStopsView: React.FC<NearbyStopsViewProps> = ({
  stops,
  buses,
  onSelectBus,
  lang
}) => {
  const t = getT(lang);

  // User coordinate (default to Bengaluru Majestic area)
  const [userCoord, setUserCoord] = useState<{ lat: number; lng: number }>({
    lat: 12.9750,
    lng: 77.5680
  });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string>(stops[0].id);

  // Trigger GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoord({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsError('Location access was denied or timed out. Showing Kempegowda Majestic Hub.');
        setIsDetectingGps(false);
      },
      { timeout: 8000 }
    );
  };

  // Sort stops by distance to user
  const sortedStops = useMemo(() => {
    return stops
      .map((stop) => {
        const distKm = calculateDistanceKm(userCoord.lat, userCoord.lng, stop.lat, stop.lng);
        const walkMins = estimateWalkingTimeMinutes(distKm);
        return {
          ...stop,
          distKm,
          walkMins
        };
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [stops, userCoord]);

  // Active selected stop
  const activeStop = useMemo(() => {
    return sortedStops.find((s) => s.id === selectedStopId) || sortedStops[0];
  }, [sortedStops, selectedStopId]);

  // Find incoming buses whose next stop matches active stop
  const incomingBuses = useMemo(() => {
    return buses.filter((b) => b.nextStopId === activeStop.id);
  }, [buses, activeStop]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.nearbyTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.nearbySubtitle}
          </p>
        </div>

        <button
          onClick={handleDetectLocation}
          disabled={isDetectingGps}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'Locating...' : t.useMyGps}</span>
        </button>
      </div>

      {gpsError && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Grid: Nearest Stations List (Left) and Station Radar / Arrivals (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sorted list of stations */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Stations Ranked by Proximity
          </h2>

          <div className="space-y-2.5">
            {sortedStops.slice(0, 8).map((stop) => {
              const isSelected = stop.id === activeStop.id;
              return (
                <button
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 dark:border-red-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'kn' ? stop.nameKn : stop.nameEn}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[240px]">
                      {stop.addressEn}
                    </div>
                    {stop.platformBays && (
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {stop.platformBays} Departure Bays
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-red-600 dark:text-red-400 font-mono">
                      {formatDistance(stop.distKm)}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Footprints className="w-3 h-3" />
                      <span>~{stop.walkMins} min walk</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Station Detail & Upcoming Bus Arrivals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  {activeStop.stationType} Station
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {lang === 'kn' ? activeStop.nameKn : activeStop.nameEn}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeStop.addressEn}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {formatDistance(activeStop.distKm)}
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeStop.walkMins} mins walking distance
                </div>
              </div>
            </div>

            {/* Amenities badges */}
            {activeStop.amenities && activeStop.amenities.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Station Amenities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeStop.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming Buses Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {t.incomingBuses} ({incomingBuses.length})
              </h4>

              {incomingBuses.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No active buses en route to this stop in the next 15 minutes.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Regular scheduled services continue according to official division timetables.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {incomingBuses.map((bus) => (
                    <div
                      key={bus.busNumber}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 bg-white dark:bg-slate-800"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                            {bus.busNumber}
                          </span>
                          <span className="text-xs font-semibold text-red-600">
                            {bus.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[240px]">
                          {bus.routeNameEn}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Current Speed: {bus.speedKmh} km/h • {bus.distanceToNextStopKm} km away
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ETA {bus.estimatedArrivalNextStopMinutes} mins
                        </div>
                        <button
                          onClick={() => onSelectBus(bus.busNumber)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Track Bus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
