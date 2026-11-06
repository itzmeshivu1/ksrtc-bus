import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Clock, 
  Gauge, 
  Radio, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw, 
  AlertTriangle,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
  HardDriveDownload,
  Database
} from 'lucide-react';
import { LiveBusTracking, KSRTCRoute, BusStop, Language } from '../types';
import { getT } from '../data/translations';
import { LiveMap } from './LiveMap';
import { OfflineMapCanvas } from './OfflineMapCanvas';
import { getCategoryBadgeClass } from '../utils/geoUtils';
import { 
  preCacheRouteCorridor, 
  getCachedTilesCount, 
  clearTileCache 
} from '../services/tileCacheService';

interface LiveTrackingViewProps {
  buses: LiveBusTracking[];
  routes: KSRTCRoute[];
  stops: BusStop[];
  selectedBusNumber?: string;
  onSelectBusNumber: (busNumber: string) => void;
  lang: Language;
  onSimulateTick?: (busNumber: string) => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  buses,
  routes,
  stops,
  selectedBusNumber,
  onSelectBusNumber,
  lang,
  onSimulateTick
}) => {
  const t = getT(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'both' | 'timeline' | 'map'>('both');

  // Cached tile & offline connectivity state
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [cachedTilesCount, setCachedTilesCount] = useState<number>(0);
  const [isPreCaching, setIsPreCaching] = useState<boolean>(false);
  const [cacheStatusMsg, setCacheStatusMsg] = useState<string | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'cached'>('google');

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setIsSystemOnline(true);
    const handleOffline = () => setIsSystemOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial cache count lookup
    getCachedTilesCount().then(setCachedTilesCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute effective offline status
  const isOffline = !isSystemOnline || isSimulatedOffline || mapEngine === 'cached';

  // Currently active selected bus
  const currentBus = useMemo(() => {
    if (selectedBusNumber) {
      const found = buses.find((b) => b.busNumber.toLowerCase() === selectedBusNumber.toLowerCase());
      if (found) return found;
    }
    return buses[0];
  }, [buses, selectedBusNumber]);

  // Current route associated with the selected bus
  const currentRoute = useMemo(() => {
    if (!currentBus) return routes[0];
    return routes.find((r) => r.id === currentBus.routeId) || routes[0];
  }, [currentBus, routes]);

  // Coordinates for the route map polyline
  const routePolylineCoords = useMemo(() => {
    if (!currentRoute) return [];
    return currentRoute.stops.map((s) => [s.lat, s.lng] as [number, number]);
  }, [currentRoute]);

  // Filtered bus list
  const filteredBuses = useMemo(() => {
    if (!searchQuery.trim()) return buses;
    const q = searchQuery.toLowerCase();
    return buses.filter(
      (b) =>
        b.busNumber.toLowerCase().includes(q) ||
        b.fleetNumber.toLowerCase().includes(q) ||
        b.routeNumber.toLowerCase().includes(q) ||
        b.routeNameEn.toLowerCase().includes(q) ||
        b.destinationNameEn.toLowerCase().includes(q)
    );
  }, [buses, searchQuery]);

  const badgeStyle = getCategoryBadgeClass(currentBus.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Compass className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.whereIsMyBus}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.whereIsMyBusSubtitle}
            </p>
          </div>

          {/* Quick Bus Search input */}
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={t.enterBusNo}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'both' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'timeline' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'map' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Bus Selector Carousel */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Active Buses:
          </span>
          {filteredBuses.map((bus) => {
            const isSelected = bus.busNumber === currentBus.busNumber;
            return (
              <button
                key={bus.busNumber}
                onClick={() => onSelectBusNumber(bus.busNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20 scale-102'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{bus.busNumber}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected ? 'bg-red-800 text-red-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {bus.routeNumber}
                </span>
                {bus.isVillageBus && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'}`}>
                    Grama
                  </span>
                )}
                {bus.isGpsLive && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'} animate-pulse`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bus Live Telemetry Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {currentBus.busNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badgeStyle.badge}`}>
                {currentBus.category}
              </span>
              {currentBus.isVillageBus && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50 flex items-center gap-1">
                  Grama Sarige Feeder: {lang === 'kn' ? (currentBus.villageNameKn || currentBus.villageNameEn) : currentBus.villageNameEn}
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Fleet: {currentBus.fleetNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                {t.gpsVerified}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
              {lang === 'kn' ? currentBus.routeNameKn : currentBus.routeNameEn}
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">{t.speed}</div>
              <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1 font-mono">
                <Gauge className="w-4 h-4 text-red-500" />
                {currentBus.speedKmh} <span className="text-xs font-normal">km/h</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">{t.nextStop}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                {lang === 'kn' ? currentBus.nextStopNameKn : currentBus.nextStopNameEn}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">{t.distanceToNext}</div>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                {currentBus.distanceToNextStopKm} <span className="text-xs font-normal">km</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">{t.estimatedDelay}</div>
              <div className={`text-xs font-black ${currentBus.delayMinutes === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentBus.delayMinutes === 0 ? t.onTime : `${t.delayedBy} ${currentBus.delayMinutes} min`}
              </div>
            </div>
          </div>
        </div>

        {/* Simulator Helper Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {t.lastPing}: <strong className="text-slate-700 dark:text-slate-300 font-mono">{currentBus.lastUpdatedSecondsAgo}s ago</strong>
            </span>
            <span>• Driver: {currentBus.driverPhone}</span>
          </div>
          {onSimulateTick && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSimulateTick(currentBus.busNumber)}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Advance bus along road coordinates to simulate real-time GPS"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate GPS Movement</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Split Timeline & Live Map */}
      <div className={`grid gap-6 ${activeTab === 'both' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: "Where Is My Train" Style Stop Progression Timeline */}
        {(activeTab === 'both' || activeTab === 'timeline') && (
          <div className={activeTab === 'both' ? 'lg:col-span-6 xl:col-span-5' : 'w-full'}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  {t.stopTimeline}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {currentRoute.totalDistanceKm} km total
                </span>
              </div>

              {/* Station vertical line track */}
              <div className="relative pl-6 space-y-6">
                {/* Continuous vertical track background */}
                <div className="absolute left-[13px] top-3 bottom-3 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                {currentRoute.stops.map((stop, idx) => {
                  const isCurrentTarget = stop.stopId === currentBus.nextStopId;
                  const isPassed = idx < currentBus.currentSegmentIndex;
                  const isUpcoming = idx > currentBus.currentSegmentIndex;

                  return (
                    <div key={stop.stopId} className="relative group">
                      {/* Station Node Marker */}
                      <div
                        className={`absolute -left-6 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                          isPassed
                            ? 'bg-emerald-600 border-white text-white shadow'
                            : isCurrentTarget
                            ? 'bg-red-600 border-amber-300 text-white shadow-lg scale-110 ring-4 ring-red-400/20 animate-pulse'
                            : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-400'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ${isCurrentTarget ? 'bg-white' : 'bg-slate-400'}`} />
                        )}
                      </div>

                      {/* Station Details Card */}
                      <div
                        className={`ml-3 p-3 rounded-xl border transition-all ${
                          isCurrentTarget
                            ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900 shadow-sm'
                            : isPassed
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-75'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {lang === 'kn' ? stop.stopNameKn : stop.stopNameEn}
                              </span>
                              {stop.bayNumber && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {stop.bayNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {stop.distanceFromStartKm} km from origin
                            </div>
                          </div>

                          {/* Timings */}
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {stop.scheduledArrival}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {isPassed ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Departed</span>
                              ) : isCurrentTarget ? (
                                <span className="text-red-600 dark:text-red-400 font-bold">
                                  Arriving in {currentBus.estimatedArrivalNextStopMinutes}m
                                </span>
                              ) : (
                                <span>Expected</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* If between this stop and the next, display active bus traveling banner */}
                        {isCurrentTarget && (
                          <div className="mt-2.5 p-2 rounded-lg bg-red-600 text-white flex items-center justify-between text-xs font-semibold shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 animate-spin" />
                              <span>Bus is currently en route to this stop</span>
                            </div>
                            <span className="font-mono bg-red-800 px-1.5 py-0.5 rounded text-[11px]">
                              {currentBus.speedKmh} km/h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Live Map (Google Maps Online / Cached Tile Canvas Offline) */}
        {(activeTab === 'both' || activeTab === 'map') && (
          <div className={activeTab === 'both' ? 'lg:col-span-6 xl:col-span-7' : 'w-full'}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t.liveMap}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    ({lang === 'kn' ? currentBus.routeNameKn : currentBus.routeNameEn})
                  </span>
                </div>

                {/* Connectivity & Cache Engine Selector */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => {
                        setIsSimulatedOffline(false);
                        setMapEngine('google');
                      }}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        !isOffline
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                      title="Stream real-time Google Maps"
                    >
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      <span>Google Maps</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsSimulatedOffline(true);
                        setMapEngine('cached');
                      }}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        isOffline
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                      title="Simulate low / intermittent network connectivity using cached tiles"
                    >
                      <WifiOff className="w-3 h-3" />
                      <span>Cached / Offline</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Offline Tile Pre-Cache Toolbar */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Offline Cache: <strong className="text-slate-900 dark:text-white font-mono">{cachedTilesCount}</strong> tiles stored
                  </span>
                  {cacheStatusMsg && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      • {cacheStatusMsg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setIsPreCaching(true);
                      setCacheStatusMsg('Pre-caching route tiles...');
                      const res = await preCacheRouteCorridor(routePolylineCoords);
                      const count = await getCachedTilesCount();
                      setCachedTilesCount(count);
                      setIsPreCaching(false);
                      setCacheStatusMsg(`Saved ${res.count} corridor tiles to offline storage!`);
                      setTimeout(() => setCacheStatusMsg(null), 4000);
                    }}
                    disabled={isPreCaching}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:bg-slate-400"
                    title="Pre-cache map tiles along this KSRTC highway corridor for offline travel in ghats and rural areas"
                  >
                    <HardDriveDownload className={`w-3.5 h-3.5 ${isPreCaching ? 'animate-bounce' : ''}`} />
                    <span>{isPreCaching ? 'Caching...' : 'Pre-cache Corridor'}</span>
                  </button>

                  {cachedTilesCount > 0 && (
                    <button
                      onClick={async () => {
                        await clearTileCache();
                        setCachedTilesCount(0);
                        setCacheStatusMsg('Cache cleared');
                        setTimeout(() => setCacheStatusMsg(null), 2500);
                      }}
                      className="text-slate-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Map Canvas: Switches to OfflineMapCanvas if offline or simulated intermittent connection */}
              <div className="flex-1 min-h-[460px] relative rounded-xl overflow-hidden">
                {isOffline ? (
                  <OfflineMapCanvas
                    buses={buses}
                    stops={stops}
                    selectedBusNumber={currentBus.busNumber}
                    onSelectBus={(busNo) => onSelectBusNumber(busNo)}
                    center={[currentBus.currentLat, currentBus.currentLng]}
                    zoom={10}
                    routeCoordinates={routePolylineCoords}
                  />
                ) : (
                  <LiveMap
                    buses={buses}
                    stops={stops}
                    selectedBusNumber={currentBus.busNumber}
                    onSelectBus={(busNo) => onSelectBusNumber(busNo)}
                    center={[currentBus.currentLat, currentBus.currentLng]}
                    zoom={10}
                    routeCoordinates={routePolylineCoords}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
