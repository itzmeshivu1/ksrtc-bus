import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Ticket, 
  Navigation, 
  ShieldCheck, 
  ArrowRight, 
  Radio, 
  Clock, 
  ArrowRightLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  Gauge,
  Bot,
  Mic,
  Calculator,
  Route
} from 'lucide-react';
import { LiveBusTracking, KSRTCRoute, BusSchedule, BusStop, Language } from '../types';
import { getT } from '../data/translations';
import { getCategoryBadgeClass } from '../utils/geoUtils';

interface HomeViewProps {
  buses: LiveBusTracking[];
  routes: KSRTCRoute[];
  schedules: BusSchedule[];
  stops: BusStop[];
  onSelectTab: (tab: string) => void;
  onTrackBus: (busNumber: string) => void;
  onSelectScheduleForBooking: (schedule: BusSchedule, route: KSRTCRoute) => void;
  onOpenAICustomerCare?: () => void;
  lang: Language;
}

export const HomeView: React.FC<HomeViewProps> = ({
  buses,
  routes,
  schedules,
  stops,
  onSelectTab,
  onTrackBus,
  onSelectScheduleForBooking,
  onOpenAICustomerCare,
  lang
}) => {
  const t = getT(lang);

  const [fromStopId, setFromStopId] = useState<string>('stop_kbs_majestic');
  const [toStopId, setToStopId] = useState<string>('stop_mysuru_suburb');
  const [quickTrackInput, setQuickTrackInput] = useState<string>('');

  const handleQuickSwap = () => {
    const temp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(temp);
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackInput.trim()) return;
    const target = quickTrackInput.trim().toUpperCase();
    const found = buses.find(
      (b) =>
        b.busNumber.toUpperCase().includes(target) ||
        b.fleetNumber.toUpperCase().includes(target) ||
        b.routeNumber.toUpperCase().includes(target)
    );
    if (found) {
      onTrackBus(found.busNumber);
    } else {
      // Default to first bus
      onTrackBus(buses[0].busNumber);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Hero Transportation Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-700 via-red-800 to-slate-950 p-6 sm:p-10 text-white shadow-2xl overflow-hidden">
        {/* Subtle decorative radial circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 translate-y-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/20">
            <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{t.motto}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'kn' ? (
              <>
                ನಿಮ್ಮ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಬಸ್ <span className="text-amber-400">ಲೈವ್ ಟ್ರ್ಯಾಕ್</span> ಮಾಡಿ
              </>
            ) : (
              <>
                Track & Book <span className="text-amber-400">KSRTC Buses</span> Across Karnataka
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-red-100 max-w-2xl leading-relaxed">
            The next-generation public transportation companion inspired by "Where Is My Train". Live GPS running status, village bus schedules, and seamless e-ticketing.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-[10px] uppercase font-bold text-red-200">{t.liveBusesCount}</div>
              <div className="text-2xl font-black font-mono mt-0.5">{buses.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-[10px] uppercase font-bold text-red-200">{t.activeRoutes}</div>
              <div className="text-2xl font-black font-mono mt-0.5">{routes.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-[10px] uppercase font-bold text-red-200">{t.villagesConnected}</div>
              <div className="text-2xl font-black font-mono mt-0.5">27,000+</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-[10px] uppercase font-bold text-red-200">{t.dailyDepartures}</div>
              <div className="text-2xl font-black font-mono mt-0.5">8,400+</div>
            </div>
          </div>
        </div>
      </div>

      {/* KSRTC Sahayaka AI Customer Care & Voice Assistant Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-red-500/30">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {lang === 'kn' ? 'ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಸಹಾಯಕ AI ಗ್ರಾಹಕ ಸೇವೆ' : 'KSRTC Sahayaka AI Customer Care'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                Voice & Doubts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-100 mt-0.5 leading-relaxed">
              {lang === 'kn'
                ? 'ಟಿಕೆಟ್ ರದ್ದತಿ ಮರುಪಾವತಿ ಲೆಕ್ಕಾಚಾರ, ಶಕ್ತಿ ಯೋಜನೆ ನಿಯಮಗಳು, ಧ್ವನಿ ಮೂಲಕ ಬಸ್ ಹುಡುಕಾಟಕ್ಕೆ ತಕ್ಷಣ ನೆರವು ಪಡೆಯಿರಿ.'
                : 'Instant answers for ticket refund calculations, Shakti scheme guidelines, and voice-assisted bus route finder.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenAICustomerCare}
            className="px-4 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow-md hover:bg-red-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-red-600" />
            <span>{lang === 'kn' ? 'ಧ್ವನಿ / ಸಂದೇಶದಲ್ಲಿ ಕೇಳಿ' : 'Ask Doubts (Voice / Chat)'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Intelligent Trip Planner Feature Spotlight */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/60">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600/30 backdrop-blur-md flex items-center justify-center text-red-400 border border-red-500/30 shrink-0">
            <Route className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {lang === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಟ್ರಿಪ್ ಪ್ಲಾನರ್ (ಬುದ್ಧಿವಂತ ಪ್ರಯಾಣ ಯೋಜನೆ)' : 'Intelligent Route & Trip Planner'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950">
                100+ Live Buses AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              {lang === 'kn'
                ? 'ಪ್ರಾರಂಭ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನವನ್ನು ನಮೂದಿಸಿ. 100+ ಲೈವ್ ಜಿಪಿಎಸ್ ಬಸ್‌ಗಳು, ವೇಳಾಪಟ್ಟಿ ದಕ್ಷತೆ ಮತ್ತು ವೇಗದ ಪ್ರಯಾಣದ ಮಾರ್ಗಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.'
                : 'Plan journeys across all 31 districts, taluks & hoblis factoring in 100+ live GPS buses, travel speed, and schedule efficiency scores.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectTab('planner')}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Route className="w-4 h-4" />
          <span>{lang === 'kn' ? 'ಪ್ರಯಾಣ ಯೋಜನೆ ತೆರೆಯಿರಿ' : 'Open Trip Planner'}</span>
        </button>
      </div>

      {/* Main Action Hub: 2-Column Split (Quick Search vs Live Quick Track) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Find Buses between 2 locations */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Search className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {lang === 'kn' ? 'ಬಸ್ ಹುಡುಕಿ & ಆಸನ ಕಾಯ್ದಿರಿಸಿ' : 'Search Karnataka Buses'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">All 31 Districts</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.fromStation}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-600" />
                <select
                  value={fromStopId}
                  onChange={(e) => setFromStopId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'kn' ? s.nameKn : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-1">
              <button
                onClick={handleQuickSwap}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                title={t.swapStations}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.toStation}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <select
                  value={toStopId}
                  onChange={(e) => setToStopId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'kn' ? s.nameKn : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('search')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{t.searchBusesBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Card: Where Is My Bus instant tracker */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t.whereIsMyBus}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter vehicle registration or route number for real-time AIS-140 GPS status.
            </p>

            <form onSubmit={handleQuickTrackSubmit} className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. KA-01-F-9420 or 101"
                  value={quickTrackInput}
                  onChange={(e) => setQuickTrackInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-red-500" />
                <span>{t.trackBusBtn}</span>
              </button>
            </form>
          </div>

          {/* Quick Active Bus Chips */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
              Popular Live Buses En Route:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {buses.slice(0, 3).map((bus) => (
                <button
                  key={bus.busNumber}
                  onClick={() => onTrackBus(bus.busNumber)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{bus.busNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Service Classes Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            KSRTC Official Fleets & Travel Classes
          </h3>
          <span className="text-xs text-slate-500">Government Certified Standards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'EV Power Plus',
              desc: 'Next-gen electric luxury express between Bengaluru & Mysuru. Zero emissions.',
              seats: '2x2 Reclining AC',
              badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            },
            {
              title: 'Airavat Club Class',
              desc: 'Volvo multi-axle luxury coach with plush ergonomic seats and high-speed Wi-Fi.',
              seats: '2x2 Premium Semi-Sleeper',
              badge: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
            },
            {
              title: 'Ambari Utsav & Dream Class',
              desc: 'Volvo B11R ultra-luxury night sleeper with single and double berths.',
              seats: '1+2 AC Sleeper Pods',
              badge: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
            },
            {
              title: 'Karnataka Sarige',
              desc: 'The backbone of Karnataka connecting 27,000+ villages, taluks and gram panchayats.',
              seats: '2x3 Express Sarige',
              badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badge}`}>
                  {item.title}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {item.seats}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => onSelectTab('search')}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Schedules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grama Sarige – Village Feeder Buses Quick Action Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'kn' ? 'ಗ್ರಾಮ ಸಾರಿಗೆ – ಹಳ್ಳಿ ಬಸ್ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ & ಬುಕಿಂಗ್' : 'Grama Sarige – Village Bus Live Tracking & Booking'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'kn' ? 'ಹಳ್ಳಿಗಳಿಂದ ತಾಲೂಕು ಮತ್ತು ಜಿಲ್ಲಾ ಕೇಂದ್ರಗಳಿಗೆ ನೇರ ಸಂಪರ್ಕ ಮತ್ತು ಲೈವ್ ಜಿಪಿಎಸ್' : 'Direct feeder buses connecting remote gram panchayats with taluks and district centers'}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('directory')}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>All Villages</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.filter((b) => b.isVillageBus).map((vBus) => {
            const vRoute = routes.find((r) => r.id === vBus.routeId) || routes[0];
            const vSchedule = schedules.find((s) => s.routeId === vBus.routeId) || schedules[0];
            return (
              <div
                key={vBus.busNumber}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      Live GPS
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      ₹{vSchedule.fare}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {lang === 'kn' ? (vBus.villageNameKn || vBus.villageNameEn) : vBus.villageNameEn}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {lang === 'kn' ? vBus.routeNameKn : vBus.routeNameEn}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Vehicle:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{vBus.busNumber}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Next Stop:</span>
                      <strong className="text-slate-900 dark:text-white truncate max-w-[120px]">{vBus.nextStopNameEn}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>ETA at Village:</span>
                      <strong className="text-emerald-600 font-bold">{vBus.estimatedArrivalNextStopMinutes} mins</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onTrackBus(vBus.busNumber)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>

                  <button
                    onClick={() => onSelectScheduleForBooking(vSchedule, vRoute)}
                    className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Village Directory Shortcut Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">
            Rural Connectivity Portal
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Looking for bus timings to your village or taluk?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Access our verified directory of Karnataka's districts, taluks, hoblis and gram panchayats to find first bus, last bus, and nearest station distances.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('directory')}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <MapPin className="w-4 h-4" />
          <span>Open Karnataka Directory</span>
        </button>
      </div>
    </div>
  );
};
