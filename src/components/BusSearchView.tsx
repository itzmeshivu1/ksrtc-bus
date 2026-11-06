import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowRightLeft, 
  Clock, 
  IndianRupee, 
  Filter, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  BatteryCharging, 
  Sparkles,
  ArrowRight,
  Compass,
  Mic,
  MicOff,
  Bot,
  Volume2
} from 'lucide-react';
import { KSRTCRoute, BusSchedule, BusStop, BusCategory, Language } from '../types';
import { getT } from '../data/translations';
import { getCategoryBadgeClass } from '../utils/geoUtils';

interface BusSearchViewProps {
  routes: KSRTCRoute[];
  schedules: BusSchedule[];
  stops: BusStop[];
  onSelectScheduleForBooking: (schedule: BusSchedule, route: KSRTCRoute) => void;
  onTrackBus: (busNumber: string) => void;
  lang: Language;
}

export const BusSearchView: React.FC<BusSearchViewProps> = ({
  routes,
  schedules,
  stops,
  onSelectScheduleForBooking,
  onTrackBus,
  lang
}) => {
  const t = getT(lang);

  // Form states
  const [sourceStopId, setSourceStopId] = useState<string>('stop_kbs_majestic');
  const [destStopId, setDestStopId] = useState<string>('stop_mysuru_suburb');
  const [journeyDate, setJourneyDate] = useState<string>('2026-10-30');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');

  // AI Voice recognition state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string | null>(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice speech recognition handler
  const handleVoiceSearch = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatusMsg(
        lang === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.'
          : 'Voice search not supported in this browser. Please select stations manually.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceStatusMsg(
          lang === 'kn' ? 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... "ಬೆಂಗಳೂರಿನಿಂದ ಧರ್ಮಸ್ಥಳ" ಎಂದು ಮಾತನಾಡಿ' : 'Listening... Speak places like "Bengaluru to Dharmasthala"'
        );
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsVoiceListening(false);
        setIsVoiceProcessing(true);
        setVoiceStatusMsg(`Recognized: "${transcript}". Connecting Gemini AI...`);

        try {
          const res = await fetch('/api/ai/voice-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, lang })
          });
          const data = await res.json();

          // Match source & destination cities from stops list
          const srcQ = (data.sourceCity || '').toLowerCase().trim();
          const dstQ = (data.destinationCity || '').toLowerCase().trim();

          const foundSource = stops.find((s) =>
            s.nameEn.toLowerCase().includes(srcQ) ||
            s.nameKn.toLowerCase().includes(srcQ) ||
            s.addressEn.toLowerCase().includes(srcQ)
          );

          const foundDest = stops.find((s) =>
            s.nameEn.toLowerCase().includes(dstQ) ||
            s.nameKn.toLowerCase().includes(dstQ) ||
            s.addressEn.toLowerCase().includes(dstQ)
          );

          if (foundSource) setSourceStopId(foundSource.id);
          if (foundDest) setDestStopId(foundDest.id);

          setVoiceStatusMsg(
            data.humanSummary ||
              `Found route between ${foundSource?.nameEn || srcQ} and ${foundDest?.nameEn || dstQ}`
          );
        } catch (err) {
          console.error('Voice search failed:', err);
          setVoiceStatusMsg(`Processed: "${transcript}". Please verify stations.`);
        } finally {
          setIsVoiceProcessing(false);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Voice recognition error:', e);
        setIsVoiceListening(false);
        setVoiceStatusMsg('Voice input stopped or microphone permission not granted.');
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsVoiceListening(false);
    }
  };

  // Swap source & destination
  const handleSwap = () => {
    const temp = sourceStopId;
    setSourceStopId(destStopId);
    setDestStopId(temp);
  };

  // Find routes matching source & destination
  const matchingSchedules = useMemo(() => {
    return schedules.filter((sch) => {
      const route = routes.find((r) => r.id === sch.routeId);
      if (!route) return false;

      // Check if route includes both source and destination in correct order
      const sourceIndex = route.stops.findIndex((s) => s.stopId === sourceStopId);
      const destIndex = route.stops.findIndex((s) => s.stopId === destStopId);

      const matchesRoute = 
        (route.sourceStopId === sourceStopId && route.destinationStopId === destStopId) ||
        (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex);

      if (!matchesRoute) return false;

      // Filter by category
      if (categoryFilter !== 'ALL' && sch.category !== categoryFilter) {
        return false;
      }

      // Filter by time of day
      if (timeFilter !== 'ALL') {
        const hour = parseInt(sch.departureTime.split(':')[0], 10);
        const isPM = sch.departureTime.includes('PM');
        const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

        if (timeFilter === 'MORNING' && (hour24 < 6 || hour24 >= 12)) return false;
        if (timeFilter === 'AFTERNOON' && (hour24 < 12 || hour24 >= 17)) return false;
        if (timeFilter === 'EVENING' && (hour24 < 17 || hour24 >= 21)) return false;
        if (timeFilter === 'NIGHT' && (hour24 < 21 && hour24 >= 6)) return false;
      }

      return true;
    });
  }, [schedules, routes, sourceStopId, destStopId, categoryFilter, timeFilter]);

  const categories: BusCategory[] = [
    'Karnataka Sarige',
    'Rajahamsa Executive',
    'Airavat Club Class',
    'Ambari Dream Class',
    'Ambari Utsav',
    'EV Power Plus'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/50 backdrop-blur-sm text-xs font-bold text-red-100 border border-red-400/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            Official KSRTC Inter-City Bus Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'kn' ? 'ಕರ್ನಾಟಕದ ಬಸ್ ವೇಳಾಪಟ್ಟಿ & ಆಸನ ಲಭ್ಯತೆ' : 'Search Karnataka State Road Transport Buses'}
          </h1>
          <p className="text-red-100 text-sm mt-1.5 leading-relaxed">
            Real-time seat vacancy, departure timings, travel duration and direct booking across all KSRTC divisions.
          </p>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Search Filter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Voice Recognition Quick Route Search Bar */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-200/80 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{lang === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಸ್ಥಳ & ಬಸ್ ಹುಡುಕಿ (Voice Finder)' : 'Voice-Powered Bus & Place Finder'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 text-[9px] font-black">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {voiceStatusMsg || (lang === 'kn' ? 'ಮೈಕ್ ಒತ್ತಿ "ಬೆಂಗಳೂರಿನಿಂದ ಧರ್ಮಸ್ಥಳ" ಎಂದು ಮಾತನಾಡಿ' : 'Tap microphone and speak: "Find bus from Bengaluru to Dharmasthala" or any village')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0 ${
              isVoiceListening
                ? 'bg-red-600 text-white animate-pulse'
                : isVoiceProcessing
                ? 'bg-amber-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isVoiceListening ? 'Listening...' : isVoiceProcessing ? 'Recognizing...' : 'Speak Places'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin Selection */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t.fromStation}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-600 pointer-events-none" />
              <select
                value={sourceStopId}
                onChange={(e) => setSourceStopId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              >
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {lang === 'kn' ? stop.nameKn : stop.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title={t.swapStations}
            >
              <ArrowRightLeft className="w-4 h-4 text-red-600" />
            </button>
          </div>

          {/* Destination Selection */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t.toStation}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
              <select
                value={destStopId}
                onChange={(e) => setDestStopId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              >
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {lang === 'kn' ? stop.nameKn : stop.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journey Date */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t.journeyDate}
            </label>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Category & Time Pills Filter */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Departure Slot Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium mr-1">Time:</span>
            {[
              { id: 'ALL', label: 'Any' },
              { id: 'MORNING', label: 'Morning' },
              { id: 'AFTERNOON', label: 'Noon' },
              { id: 'EVENING', label: 'Evening' },
              { id: 'NIGHT', label: 'Night' }
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => setTimeFilter(slot.id)}
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                  timeFilter === slot.id
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {matchingSchedules.length} {matchingSchedules.length === 1 ? 'Bus Service Available' : 'Bus Services Available'}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Tariff approved by KSRTC Directorate
          </span>
        </div>

        {matchingSchedules.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Direct Services Found for Selected Route
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try selecting Bengaluru (Majestic) or Mysuru Suburb, or clear your category and time filters to view connecting rural and express schedules.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matchingSchedules.map((sch) => {
              const route = routes.find((r) => r.id === sch.routeId)!;
              const badgeStyle = getCategoryBadgeClass(sch.category);

              return (
                <div
                  key={sch.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-300 dark:hover:border-red-900/60 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Bus Details & Timings */}
                    <div className="space-y-3 flex-1">
                      {/* Top Row: Category + Bus Number + Amenities */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${badgeStyle.badge}`}>
                          {sch.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {sch.busNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          Depot: {sch.depot}
                        </span>
                        
                        {/* Amenity Icons */}
                        <div className="flex items-center gap-2 text-slate-400 ml-auto lg:ml-2">
                          {sch.hasAC && <span title="Air Conditioned" className="text-sky-600 font-bold text-[10px]">AC</span>}
                          {sch.hasCharging && (
                            <span title="USB Charging">
                              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                          {sch.hasWiFi && (
                            <span title="Wi-Fi">
                              <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Route Timings & Progress */}
                      <div className="flex items-center gap-4 sm:gap-8">
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {sch.departureTime}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                            {lang === 'kn' ? route.sourceNameKn : route.sourceNameEn}
                          </div>
                        </div>

                        {/* Duration divider */}
                        <div className="flex-1 max-w-[140px] text-center">
                          <div className="text-[11px] text-slate-400 font-mono">
                            {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
                          </div>
                          <div className="relative flex items-center justify-center my-1">
                            <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700" />
                            <div className="absolute w-2 h-2 rounded-full bg-red-600" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {route.totalDistanceKm} km
                          </div>
                        </div>

                        <div>
                          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {sch.arrivalTime}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                            {lang === 'kn' ? route.destNameKn : route.destNameEn}
                          </div>
                        </div>
                      </div>

                      {/* Intermediate via cities */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Via:</span>
                        <span>{route.viaCities.join(' • ')}</span>
                      </div>
                    </div>

                    {/* Right Action & Pricing */}
                    <div className="lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-6 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-slate-500 font-medium">Starting from</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center lg:justify-end">
                          <IndianRupee className="w-5 h-5 -mr-0.5" />
                          {sch.fare}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {sch.availableSeats} seats left
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTrackBus(sch.busNumber)}
                          className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View live GPS coordinates on map"
                        >
                          <Compass className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">Track</span>
                        </button>

                        <button
                          onClick={() => onSelectScheduleForBooking(sch, route)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer group-hover:scale-102"
                        >
                          <span>Select Seat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
