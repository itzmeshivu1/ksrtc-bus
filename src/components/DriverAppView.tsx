import React, { useState } from 'react';
import { 
  Smartphone, 
  Play, 
  Square, 
  Gauge, 
  MapPin, 
  Radio, 
  AlertOctagon, 
  CheckCircle2, 
  Wifi, 
  Compass,
  Bus,
  QrCode
} from 'lucide-react';
import { LiveBusTracking, KSRTCRoute, Language } from '../types';
import { getT } from '../data/translations';

interface DriverAppViewProps {
  buses: LiveBusTracking[];
  routes: KSRTCRoute[];
  onUpdateBusTelemetry: (busNumber: string, speedKmh: number, nextStopId: string) => void;
  lang: Language;
  onOpenQRScanner?: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  buses,
  routes,
  onUpdateBusTelemetry,
  lang,
  onOpenQRScanner
}) => {
  const t = getT(lang);

  const [selectedBusNumber, setSelectedBusNumber] = useState<string>(buses[0].busNumber);
  const [isTripActive, setIsTripActive] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(buses[0].speedKmh);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);

  const activeBus = buses.find((b) => b.busNumber === selectedBusNumber) || buses[0];
  const activeRoute = routes.find((r) => r.id === activeBus.routeId) || routes[0];

  const handleSpeedChange = (newSpeed: number) => {
    setCurrentSpeed(newSpeed);
    onUpdateBusTelemetry(activeBus.busNumber, newSpeed, activeBus.nextStopId);
  };

  const handleStationCheckIn = (stopName: string, stopId: string) => {
    setCheckInMsg(`Checked in at ${stopName}. Broadcasted to passenger live tracker.`);
    onUpdateBusTelemetry(activeBus.busNumber, currentSpeed, stopId);
    setTimeout(() => setCheckInMsg(null), 4000);
  };

  const handleTriggerSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Driver Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                KSRTC Sarige Driver Telematics Terminal
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {lang === 'kn' ? 'ಚಾಲಕರ ಜಿಪಿಎಸ್ ಕನ್ಸೋಲ್' : 'Driver GPS & Station Check-In'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              AIS-140 GPS Active
            </span>
          </div>
        </div>
      </div>

      {/* Select Assigned Bus & Active Route */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Assigned KSRTC Bus Number
            </label>
            <select
              value={selectedBusNumber}
              onChange={(e) => {
                setSelectedBusNumber(e.target.value);
                const found = buses.find((b) => b.busNumber === e.target.value);
                if (found) setCurrentSpeed(found.speedKmh);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            >
              {buses.map((bus) => (
                <option key={bus.busNumber} value={bus.busNumber}>
                  {bus.busNumber} ({bus.category} - {bus.routeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Operating Route
            </label>
            <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {activeBus.routeNameEn}
            </div>
          </div>
        </div>

        {/* Trip Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTripActive(!isTripActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isTripActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isTripActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTripActive ? 'Trip in Progress' : 'Start Scheduled Trip'}</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Trip ID: KSRTC-TRIP-{activeBus.busNumber.slice(-4)}
            </span>
          </div>

          {/* Emergency SOS button */}
          <button
            onClick={handleTriggerSos}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              sosSent
                ? 'bg-amber-600 text-white animate-bounce'
                : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{sosSent ? 'SOS Dispatched to Depot!' : 'Emergency SOS Alert'}</span>
          </button>
        </div>
      </div>

      {checkInMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{checkInMsg}</span>
        </div>
      )}

      {/* Conductor ETM & Passenger QR Boarding Verification */}
      <div className="bg-gradient-to-r from-red-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-red-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-300">
              Conductor ETM Station & On-Bus Verification
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {lang === 'kn' ? 'ಪ್ರಯಾಣಿಕರ ಕ್ಯೂಆರ್ ಟಿಕೆಟ್ ಸ್ಕ್ಯಾನರ್' : 'Passenger Ticket QR Scanner'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Scan passenger AWATAR mobile tickets via camera to verify seat reservation and update boarding status.
            </p>
          </div>
        </div>

        {onOpenQRScanner && (
          <button
            onClick={onOpenQRScanner}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್ ಪ್ರಾರಂಭಿಸಿ' : 'Open Boarding Scanner'}</span>
          </button>
        )}
      </div>

      {/* Speedometer & Live Telemetry Transmitter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Current Cruising Speed</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {currentSpeed} <span className="text-xs font-normal">km/h</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={currentSpeed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value, 10))}
            className="w-full accent-red-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0 km/h (Halt)</span>
            <span>40 km/h (Ghat/Town)</span>
            <span>70 km/h (Expressway)</span>
            <span>90 km/h (Speed Governor Cap)</span>
          </div>
        </div>

        {/* Station Check-In Buttons for the Route */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Next Stop / Station Check-In Affordance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeRoute.stops.map((stop) => {
              const isTarget = stop.stopId === activeBus.nextStopId;
              return (
                <button
                  key={stop.stopId}
                  onClick={() => handleStationCheckIn(stop.stopNameEn, stop.stopId)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isTarget
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-500 font-bold text-red-900 dark:text-red-200 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{stop.stopNameEn}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Sched: {stop.scheduledArrival}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    {isTarget ? 'Current Target' : 'Check-In'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
