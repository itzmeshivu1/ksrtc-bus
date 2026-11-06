import React, { useState, useMemo } from 'react';
import { 
  Route, 
  MapPin, 
  Compass, 
  Clock, 
  Zap, 
  Sparkles, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Ticket, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Bus,
  Check,
  TrendingUp,
  Percent
} from 'lucide-react';
import { KSRTCRoute, BusSchedule, LiveBusTracking, BusStop, Language, BusCategory } from '../types';
import { KARNATAKA_DISTRICTS, KARNATAKA_TALUKS, KARNATAKA_HOBLIS, KARNATAKA_BUS_STOPS } from '../data/karnatakaGeoData';
import { getCategoryBadgeClass } from '../utils/geoUtils';

interface TripPlannerViewProps {
  routes: KSRTCRoute[];
  schedules: BusSchedule[];
  buses: LiveBusTracking[];
  stops: BusStop[];
  onSelectScheduleForBooking: (schedule: BusSchedule, route: KSRTCRoute) => void;
  onTrackBus: (busNumber: string) => void;
  lang: Language;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  routes,
  schedules,
  buses,
  stops,
  onSelectScheduleForBooking,
  onTrackBus,
  lang
}) => {
  // Input states
  const [originInput, setOriginInput] = useState<string>('Bengaluru');
  const [destinationInput, setDestinationInput] = useState<string>('Mysuru');
  const [journeyDate, setJourneyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeWindow, setTimeWindow] = useState<'all' | 'morning' | 'day' | 'evening' | 'night'>('all');
  const [filterStrategy, setFilterStrategy] = useState<'all' | 'fastest' | 'cheapest' | 'live' | 'luxury'>('all');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);

  // Quick preset corridor buttons
  const popularCorridors = [
    { from: 'Bengaluru', to: 'Mysuru', labelEn: 'BLR ⇄ MYS', labelKn: 'ಬೆಂಗಳೂರು ⇄ ಮೈಸೂರು' },
    { from: 'Bengaluru', to: 'Mangaluru', labelEn: 'BLR ⇄ MNG', labelKn: 'ಬೆಂಗಳೂರು ⇄ ಮಂಗಳೂರು' },
    { from: 'Bengaluru', to: 'Dharmasthala', labelEn: 'BLR ⇄ Dharmasthala', labelKn: 'ಬೆಂಗಳೂರು ⇄ ಧರ್ಮಸ್ಥಳ' },
    { from: 'Bengaluru', to: 'Belagavi', labelEn: 'BLR ⇄ Belagavi', labelKn: 'ಬೆಂಗಳೂರು ⇄ ಬೆಳಗಾವಿ' },
    { from: 'Bengaluru', to: 'Shivamogga', labelEn: 'BLR ⇄ Shivamogga', labelKn: 'ಬೆಂಗಳೂರು ⇄ ಶಿವಮೊಗ್ಗ' },
    { from: 'Mysuru', to: 'Madikeri', labelEn: 'MYS ⇄ Madikeri (Coorg)', labelKn: 'ಮೈಸೂರು ⇄ ಮಡಿಕೇರಿ' },
    { from: 'Mandya', to: 'Shivalli', labelEn: 'MND ⇄ Shivalli Village', labelKn: 'ಮಂಡ್ಯ ⇄ ಶಿವಳ್ಳಿ ಗ್ರಾಮ' },
  ];

  // Swap locations
  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destinationInput);
    setDestinationInput(temp);
  };

  // Location Autocomplete suggestions
  const locationSuggestions = useMemo(() => {
    const list: string[] = [];
    KARNATAKA_DISTRICTS.forEach((d) => list.push(d.nameEn));
    KARNATAKA_BUS_STOPS.forEach((s) => {
      const cleanName = s.nameEn.split('(')[0].trim();
      if (!list.includes(cleanName)) list.push(cleanName);
    });
    KARNATAKA_TALUKS.slice(0, 30).forEach((t) => {
      if (!list.includes(t.nameEn)) list.push(t.nameEn);
    });
    KARNATAKA_HOBLIS.slice(0, 30).forEach((h) => {
      if (!list.includes(h.nameEn)) list.push(h.nameEn);
    });
    return Array.from(new Set(list));
  }, []);

  // Multi-factor Intelligent Route Planning Engine
  const recommendedPlans = useMemo(() => {
    const origClean = originInput.toLowerCase().trim();
    const destClean = destinationInput.toLowerCase().trim();

    // 1. Identify candidate routes connecting origin & destination
    const candidateRoutes = routes.filter((r) => {
      if (!origClean && !destClean) return true;

      const rOrig = (r.sourceNameEn + ' ' + r.routeNameEn).toLowerCase();
      const rDest = (r.destNameEn + ' ' + r.routeNameEn).toLowerCase();
      const rVia = r.viaCities.map((v) => v.toLowerCase()).join(' ');

      const matchesOrigin = !origClean || rOrig.includes(origClean) || rVia.includes(origClean);
      const matchesDest = !destClean || rDest.includes(destClean) || rVia.includes(destClean);

      return matchesOrigin && matchesDest;
    });

    const activeList = candidateRoutes.length > 0 ? candidateRoutes : routes;

    // 2. Synthesize route plans factoring in schedules & live buses
    const plans = activeList.map((route) => {
      // Find all scheduled buses for this route
      const routeSchedules = schedules.filter((s) => s.routeId === route.id);
      const primarySchedule = routeSchedules[0] || schedules[0];

      // Find live buses actively running on this corridor right now
      const activeLiveBuses = buses.filter((b) => b.routeId === route.id);
      const nearestLiveBus = activeLiveBuses.length > 0
        ? [...activeLiveBuses].sort((a, b) => a.estimatedArrivalNextStopMinutes - b.estimatedArrivalNextStopMinutes)[0]
        : null;

      // Calculate Schedule Efficiency Score (0 - 100)
      // Criteria:
      // - Punctuality: delay <= 0 (+25 pts), delay 1-5m (+18 pts), delay > 10m (+8 pts)
      // - Average Speed: > 60 km/h (+25 pts), 50-60 km/h (+20 pts), < 50 km/h (+15 pts)
      // - Amenities: AC (+15 pts), Sleeper/Pushback (+15 pts), Charging/WiFi (+10 pts)
      // - Frequency: multiple schedules (+10 pts)
      let efficiencyScore = 50;

      if (nearestLiveBus) {
        if (nearestLiveBus.delayMinutes <= 0) efficiencyScore += 20;
        else if (nearestLiveBus.delayMinutes <= 5) efficiencyScore += 12;
        else efficiencyScore -= 5;

        if (nearestLiveBus.speedKmh >= 60) efficiencyScore += 15;
        else if (nearestLiveBus.speedKmh >= 45) efficiencyScore += 10;
      } else {
        efficiencyScore += 10; // Neutral baseline
      }

      if (primarySchedule.hasAC) efficiencyScore += 8;
      if (primarySchedule.seatLayoutType === 'sleeper') efficiencyScore += 7;
      if (primarySchedule.hasCharging) efficiencyScore += 5;
      if (routeSchedules.length >= 2) efficiencyScore += 5;

      efficiencyScore = Math.min(99, Math.max(68, efficiencyScore));

      // Determine smart tags
      const isFastest = route.durationMinutes <= 180;
      const isShaktiEligible = route.category === 'Karnataka Sarige';
      const isLuxury = route.category.includes('Airavat') || route.category.includes('Ambari') || route.category.includes('EV');

      return {
        id: `plan_${route.id}`,
        route,
        schedule: primarySchedule,
        allSchedules: routeSchedules,
        activeLiveBuses,
        nearestLiveBus,
        efficiencyScore,
        isFastest,
        isShaktiEligible,
        isLuxury,
        departureTime: primarySchedule.departureTime,
        arrivalTime: primarySchedule.arrivalTime,
        durationMinutes: route.durationMinutes,
        fare: primarySchedule.fare,
        availableSeats: primarySchedule.availableSeats
      };
    });

    // 3. Apply Time Window Filtering
    let filteredPlans = plans;
    if (timeWindow !== 'all') {
      filteredPlans = plans.filter((p) => {
        const dep = p.departureTime.toLowerCase();
        const isPM = dep.includes('pm');
        const hour = parseInt(dep.split(':')[0], 10);
        const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;

        if (timeWindow === 'morning') return hour24 >= 5 && hour24 < 12;
        if (timeWindow === 'day') return hour24 >= 12 && hour24 < 16;
        if (timeWindow === 'evening') return hour24 >= 16 && hour24 < 21;
        if (timeWindow === 'night') return hour24 >= 21 || hour24 < 5;
        return true;
      });
      if (filteredPlans.length === 0) filteredPlans = plans;
    }

    // 4. Apply Strategy Sorting / Filtering
    if (filterStrategy === 'fastest') {
      return [...filteredPlans].sort((a, b) => a.durationMinutes - b.durationMinutes);
    }
    if (filterStrategy === 'cheapest') {
      return [...filteredPlans].sort((a, b) => a.fare - b.fare);
    }
    if (filterStrategy === 'live') {
      return [...filteredPlans].sort((a, b) => b.activeLiveBuses.length - a.activeLiveBuses.length);
    }
    if (filterStrategy === 'luxury') {
      return [...filteredPlans].sort((a, b) => (b.isLuxury ? 1 : 0) - (a.isLuxury ? 1 : 0));
    }

    // Default: Sort by Intelligent Efficiency Score
    return [...filteredPlans].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [originInput, destinationInput, timeWindow, filterStrategy, routes, schedules, buses]);

  const handleShareTrip = (planId: string, routeName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `KSRTC Smart Bus Plan: ${routeName} | Live GPS & Booking available on KSRTC Smart Bus App.`
      );
      setCopiedTripId(planId);
      setTimeout(() => setCopiedTripId(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'kn' ? 'ಬುದ್ಧಿವಂತ ಮಾರ್ಗ & ಲೈವ್ ಬಸ್ ಯೋಜನೆ' : 'AI-Powered Corridor Trip Planner'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {lang === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಪ್ರಯಾಣ ಯೋಜನೆ' : 'Intelligent Route & Schedule Planner'}
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            {lang === 'kn'
              ? 'ಪ್ರಾರಂಭ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನವನ್ನು ನಮೂದಿಸಿ. ಲೈವ್ ಜಿಪಿಎಸ್ ಬಸ್‌ಗಳು, ವೇಳಾಪಟ್ಟಿ ದಕ್ಷತೆ ಮತ್ತು ಶಕ್ತಿ ಯೋಜನೆ ಆಧಾರದ ಮೇಲೆ ಉತ್ತಮ ಮಾರ್ಗಗಳನ್ನು ಪಡೆಯಿರಿ.'
              : 'Discover optimal travel options factoring in real-time GPS fleet positions, schedule punctuality, Shakti scheme savings, and cabin comfort.'}
          </p>
        </div>

        {/* Quick Corridor Presets */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-red-200 uppercase tracking-wider mr-1">
            {lang === 'kn' ? 'ಜನಪ್ರಿಯ ಮಾರ್ಗಗಳು' : 'Popular Corridors'}:
          </span>
          {popularCorridors.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                setOriginInput(c.from);
                setDestinationInput(c.to);
              }}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/15 transition-all cursor-pointer"
            >
              {lang === 'kn' ? c.labelKn : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Control Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              {lang === 'kn' ? 'ಪ್ರಾರಂಭದ ಸ್ಥಳ (ಜಿಲ್ಲೆ / ತಾಲೂಕು / ನಿಲ್ದಾಣ)' : 'Starting Location / Station'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="text"
                list="location-options"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="e.g. Bengaluru, Mandya, Mysuru..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-4 md:pt-5">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
              title="Swap Locations"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              {lang === 'kn' ? 'ಗಮ್ಯಸ್ಥಾನ (ಜಿಲ್ಲೆ / ತಾಲೂಕು / ನಿಲ್ದಾಣ)' : 'Destination / Station'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
              <input
                type="text"
                list="location-options"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="e.g. Mangaluru, Belagavi, Shivamogga..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Datalist for fast autocompletion */}
        <datalist id="location-options">
          {locationSuggestions.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>

        {/* Filters & Preferences Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Time Window Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Time:</span>
            {[
              { id: 'all', label: 'All Day' },
              { id: 'morning', label: 'Morning (5-12)' },
              { id: 'day', label: 'Afternoon (12-4)' },
              { id: 'evening', label: 'Evening (4-9)' },
              { id: 'night', label: 'Overnight (9-5)' },
            ].map((tw) => (
              <button
                key={tw.id}
                onClick={() => setTimeWindow(tw.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeWindow === tw.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tw.label}
              </button>
            ))}
          </div>

          {/* Strategy Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Sort:</span>
            {[
              { id: 'all', label: '⚡ Efficiency Score' },
              { id: 'fastest', label: '🚀 Fastest' },
              { id: 'cheapest', label: '💰 Lowest Fare' },
              { id: 'live', label: '🟢 Live Bus Active' },
              { id: 'luxury', label: '🛋️ Luxury Sleeper' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStrategy(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStrategy === st.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {lang === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಯಾಣ ಯೋಜನೆಗಳು' : 'Recommended Route Options'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
              {recommendedPlans.length} {lang === 'kn' ? 'ಆಯ್ಕೆಗಳು' : 'options'}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            {buses.length} {lang === 'kn' ? 'ಲೈವ್ ಬಸ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ' : 'live GPS buses active'}
          </span>
        </div>

        {recommendedPlans.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No direct corridors found for "{originInput}" to "{destinationInput}"
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try searching with major district headquarters like Bengaluru, Mysuru, Hassan, Mangaluru, or Belagavi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendedPlans.map((plan, idx) => {
              const isExpanded = expandedRouteId === plan.id;
              const hasLiveBus = plan.activeLiveBuses.length > 0;
              const topLive = plan.nearestLiveBus;

              return (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-red-300 dark:hover:border-red-900 transition-all space-y-4"
                >
                  {/* Top Header of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${getCategoryBadgeClass(plan.route.category)}`}>
                        {plan.route.category}
                      </span>

                      {/* Rank & Efficiency Score Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{plan.efficiencyScore}/100 Efficiency</span>
                      </span>

                      {plan.isFastest && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                          🚀 Fastest Duration
                        </span>
                      )}

                      {plan.isShaktiEligible && (
                        <span className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 text-[11px] font-black">
                          ♀ Shakti Free (Women)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareTrip(plan.id, plan.route.routeNameEn)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Share Route Plan"
                      >
                        {copiedTripId === plan.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Route Name & Core Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Origin to Destination with Timings */}
                    <div className="md:col-span-8 space-y-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {lang === 'kn' ? plan.route.routeNameKn : plan.route.routeNameEn}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="font-bold text-slate-900 dark:text-white">{plan.departureTime}</span>
                          <span>→</span>
                          <span>{plan.arrivalTime}</span>
                        </div>
                        <div className="text-slate-400">•</div>
                        <div>
                          Duration: <span className="font-bold text-slate-900 dark:text-white">{Math.floor(plan.durationMinutes / 60)}h {plan.durationMinutes % 60}m</span>
                        </div>
                        <div className="text-slate-400">•</div>
                        <div>
                          Distance: <span className="font-bold text-slate-900 dark:text-white">{plan.route.totalDistanceKm} km</span>
                        </div>
                      </div>

                      {/* Via Cities List */}
                      <p className="text-xs text-slate-400">
                        <span className="font-bold text-slate-500">Via:</span> {plan.route.viaCities.join(' → ')}
                      </p>
                    </div>

                    {/* Right: Fare & Booking CTA */}
                    <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Standard Fare</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          ₹{plan.fare}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {plan.availableSeats} seats left
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onSelectScheduleForBooking(plan.schedule, plan.route)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>{lang === 'kn' ? 'ಆಸನ ಆಯ್ಕೆ & ಬುಕಿಂಗ್' : 'Select Seats & Book'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Fleet Status Banner */}
                  {hasLiveBus && topLive && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-3 h-3 flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            Live on Route: Bus {topLive.busNumber}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-2">
                            Next Stop: <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'kn' ? topLive.nextStopNameKn : topLive.nextStopNameEn}</span> ({topLive.estimatedArrivalNextStopMinutes} mins away, {topLive.speedKmh} km/h)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onTrackBus(topLive.busNumber)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{lang === 'kn' ? 'ಲೈವ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ನೋಡಿ' : 'Track on GPS Map'}</span>
                      </button>
                    </div>
                  )}

                  {/* Expandable Route Stops Accordion */}
                  <div>
                    <button
                      onClick={() => setExpandedRouteId(isExpanded ? null : plan.id)}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Stop Timeline' : `View ${plan.route.stops.length} Route Stops & Bay Info`}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {plan.route.stops.map((stop, sIdx) => (
                            <div
                              key={stop.stopId || sIdx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>Stop #{sIdx + 1}</span>
                                <span>{stop.distanceFromStartKm} km</span>
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                                {lang === 'kn' ? stop.stopNameKn : stop.stopNameEn}
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-600 dark:text-slate-300">
                                <span>Arr: {stop.scheduledArrival}</span>
                                <span className="font-bold text-red-600">{stop.bayNumber || 'Bay 01'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
