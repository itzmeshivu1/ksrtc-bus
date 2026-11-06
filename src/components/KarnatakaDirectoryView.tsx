import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  Compass, 
  Bus, 
  ArrowRight, 
  Navigation, 
  Building2, 
  Clock, 
  Calendar,
  CheckCircle2,
  Radio,
  Ticket,
  ShieldCheck,
  Zap,
  Users,
  Grid,
  ListFilter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  KARNATAKA_DISTRICTS, 
  KARNATAKA_TALUKS, 
  KARNATAKA_HOBLIS, 
  KARNATAKA_VILLAGES, 
  KARNATAKA_BUS_STOPS 
} from '../data/karnatakaGeoData';
import { KSRTC_ROUTES, BUS_SCHEDULES, INITIAL_LIVE_BUSES } from '../data/ksrtcRoutesAndBuses';
import { District, Taluk, Hobli, Village, BusStop, Language, LiveBusTracking, KSRTCRoute, BusSchedule } from '../types';
import { getT } from '../data/translations';

interface KarnatakaDirectoryViewProps {
  onSearchBusesFromStop: (stopId: string) => void;
  onTrackBus?: (busNumber: string) => void;
  onSelectScheduleForBooking?: (schedule: BusSchedule, route: KSRTCRoute) => void;
  buses?: LiveBusTracking[];
  routes?: KSRTCRoute[];
  schedules?: BusSchedule[];
  lang: Language;
}

export const KarnatakaDirectoryView: React.FC<KarnatakaDirectoryViewProps> = ({
  onSearchBusesFromStop,
  onTrackBus,
  onSelectScheduleForBooking,
  buses = INITIAL_LIVE_BUSES,
  routes = KSRTC_ROUTES,
  schedules = BUS_SCHEDULES,
  lang
}) => {
  const t = getT(lang);

  // Tab mode: 'cascading' or 'all_villages'
  const [viewMode, setViewMode] = useState<'cascading' | 'all_villages'>('cascading');

  // Search query for fast village search across all Karnataka
  const [villageSearchQuery, setVillageSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Cascading selections - default to Shivalli in Mandya
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('mnd');
  const [selectedTalukId, setSelectedTalukId] = useState<string>('tal_mandya');
  const [selectedHobliId, setSelectedHobliId] = useState<string>('hob_shivalli');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vil_shivalli');

  // Filter taluks based on selected district
  const availableTaluks = useMemo(() => {
    return KARNATAKA_TALUKS.filter((t) => t.districtId === selectedDistrictId);
  }, [selectedDistrictId]);

  // Filter hoblis based on selected taluk
  const availableHoblis = useMemo(() => {
    return KARNATAKA_HOBLIS.filter((h) => h.talukId === selectedTalukId);
  }, [selectedTalukId]);

  // Filter villages based on selected hobli
  const availableVillages = useMemo(() => {
    const list = KARNATAKA_VILLAGES.filter((v) => v.hobliId === selectedHobliId);
    if (list.length > 0) return list;
    // Fallback: villages in the same taluk
    const talukList = KARNATAKA_VILLAGES.filter((v) => v.talukId === selectedTalukId);
    if (talukList.length > 0) return talukList;
    // Fallback: villages in the same district
    const distList = KARNATAKA_VILLAGES.filter((v) => v.districtId === selectedDistrictId);
    if (distList.length > 0) return distList;
    return [KARNATAKA_VILLAGES[0]];
  }, [selectedHobliId, selectedTalukId, selectedDistrictId]);

  // Active village profile
  const activeVillage = useMemo(() => {
    return KARNATAKA_VILLAGES.find((v) => v.id === selectedVillageId) ||
      availableVillages[0] ||
      KARNATAKA_VILLAGES[0];
  }, [selectedVillageId, availableVillages]);

  // Nearest major bus stand for active village
  const nearestStand = useMemo(() => {
    return KARNATAKA_BUS_STOPS.find((s) => s.id === activeVillage.nearestBusStopId) || KARNATAKA_BUS_STOPS[0];
  }, [activeVillage]);

  // Find dedicated village route if available
  const villageRoute = useMemo(() => {
    return routes.find((r) => r.villageId === activeVillage.id) ||
      routes.find((r) => r.routeNameEn.toLowerCase().includes(activeVillage.nameEn.toLowerCase()));
  }, [routes, activeVillage]);

  // Find active live tracking bus serving this village
  const villageLiveBus = useMemo(() => {
    if (villageRoute) {
      return buses.find((b) => b.routeId === villageRoute.id);
    }
    return buses.find((b) => b.isVillageBus && b.villageNameEn?.toLowerCase().includes(activeVillage.nameEn.toLowerCase()));
  }, [buses, villageRoute, activeVillage]);

  // Find dedicated schedule for booking
  const villageSchedule = useMemo(() => {
    if (villageRoute) {
      return schedules.find((s) => s.routeId === villageRoute.id) || schedules[0];
    }
    return schedules[0];
  }, [schedules, villageRoute]);

  // Fast direct search matches across all Karnataka registered villages
  const searchResults = useMemo(() => {
    if (!villageSearchQuery.trim()) return [];
    const q = villageSearchQuery.toLowerCase().trim();
    return KARNATAKA_VILLAGES.filter((v) => {
      const dist = KARNATAKA_DISTRICTS.find(d => d.id === v.districtId);
      const taluk = KARNATAKA_TALUKS.find(t => t.id === v.talukId);
      const hobli = KARNATAKA_HOBLIS.find(h => h.id === v.hobliId);
      return (
        v.nameEn.toLowerCase().includes(q) ||
        v.nameKn.toLowerCase().includes(q) ||
        (dist && (dist.nameEn.toLowerCase().includes(q) || dist.nameKn.toLowerCase().includes(q))) ||
        (taluk && (taluk.nameEn.toLowerCase().includes(q) || taluk.nameKn.toLowerCase().includes(q))) ||
        (hobli && (hobli.nameEn.toLowerCase().includes(q) || hobli.nameKn.toLowerCase().includes(q)))
      );
    });
  }, [villageSearchQuery]);

  // Filtered list for "All Registered Villages" tab
  const allVillagesFiltered = useMemo(() => {
    return KARNATAKA_VILLAGES.filter((v) => {
      if (districtFilter !== 'ALL' && v.districtId !== districtFilter) {
        return false;
      }
      if (villageSearchQuery.trim()) {
        const q = villageSearchQuery.toLowerCase().trim();
        const dist = KARNATAKA_DISTRICTS.find(d => d.id === v.districtId);
        const taluk = KARNATAKA_TALUKS.find(t => t.id === v.talukId);
        return (
          v.nameEn.toLowerCase().includes(q) ||
          v.nameKn.toLowerCase().includes(q) ||
          (dist && dist.nameEn.toLowerCase().includes(q)) ||
          (taluk && taluk.nameEn.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [districtFilter, villageSearchQuery]);

  // Quick jump to a village
  const handleSelectSpecificVillage = (vil: Village) => {
    setSelectedDistrictId(vil.districtId);
    setSelectedTalukId(vil.talukId);
    setSelectedHobliId(vil.hobliId);
    setSelectedVillageId(vil.id);
    setVillageSearchQuery('');
    setViewMode('cascading');
  };

  // Handle District Change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    const taluks = KARNATAKA_TALUKS.filter((t) => t.districtId === districtId);
    if (taluks.length > 0) {
      setSelectedTalukId(taluks[0].id);
      const hoblis = KARNATAKA_HOBLIS.filter((h) => h.talukId === taluks[0].id);
      if (hoblis.length > 0) {
        setSelectedHobliId(hoblis[0].id);
        const villages = KARNATAKA_VILLAGES.filter((v) => v.hobliId === hoblis[0].id);
        if (villages.length > 0) {
          setSelectedVillageId(villages[0].id);
        } else {
          const anyInDist = KARNATAKA_VILLAGES.find(v => v.districtId === districtId);
          if (anyInDist) setSelectedVillageId(anyInDist.id);
        }
      }
    }
  };

  // Handle Taluk Change
  const handleTalukChange = (talukId: string) => {
    setSelectedTalukId(talukId);
    const hoblis = KARNATAKA_HOBLIS.filter((h) => h.talukId === talukId);
    if (hoblis.length > 0) {
      setSelectedHobliId(hoblis[0].id);
      const villages = KARNATAKA_VILLAGES.filter((v) => v.hobliId === hoblis[0].id);
      if (villages.length > 0) {
        setSelectedVillageId(villages[0].id);
      } else {
        const anyInTaluk = KARNATAKA_VILLAGES.find(v => v.talukId === talukId);
        if (anyInTaluk) setSelectedVillageId(anyInTaluk.id);
      }
    }
  };

  // Handle Hobli Change
  const handleHobliChange = (hobliId: string) => {
    setSelectedHobliId(hobliId);
    const villages = KARNATAKA_VILLAGES.filter((v) => v.hobliId === hobliId);
    if (villages.length > 0) {
      setSelectedVillageId(villages[0].id);
    }
  };

  // Popular key villages for 1-click discovery
  const popularKeyVillages = [
    { id: 'vil_shivalli', name: 'Shivalli (Mandya)' },
    { id: 'vil_halebidu', name: 'Halebidu (Hassan)' },
    { id: 'vil_dharmasthala', name: 'Dharmasthala (DK)' },
    { id: 'vil_melukote', name: 'Melukote (Mandya)' },
    { id: 'vil_hampi', name: 'Hampi (Vijayanagara)' },
    { id: 'vil_sringeri', name: 'Sringeri (Chikkamagaluru)' },
    { id: 'vil_gokarna', name: 'Gokarna (Uttara Kannada)' },
    { id: 'vil_mm_hills', name: 'MM Hills (Chamarajanagar)' },
    { id: 'vil_agumbe', name: 'Agumbe (Shivamogga)' },
    { id: 'vil_badami', name: 'Badami (Bagalkote)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Directory Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t.cascadingTitle}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                  {KARNATAKA_VILLAGES.length} Registered Villages
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Official geographical database covering all 31 Districts, Taluks, Hoblis, and Gram Panchayats with Grama Sarige bus routes.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start md:self-auto">
            <button
              onClick={() => setViewMode('cascading')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cascading'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-red-600" />
              <span>Cascading Hierarchy</span>
            </button>
            <button
              onClick={() => setViewMode('all_villages')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'all_villages'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-red-600" />
              <span>All Registered Villages ({KARNATAKA_VILLAGES.length})</span>
            </button>
          </div>
        </div>

        {/* Global Instant Village Search Bar */}
        <div className="relative pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'kn' ? 'ಯಾವುದೇ ಗ್ರಾಮ, ಹೋಬಳಿ, ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಹುಡುಕಿ...' : 'Search any registered village, gram panchayat, hobli, or district (e.g. Hampi, Melukote, Shivalli)...'}
              value={villageSearchQuery}
              onChange={(e) => setVillageSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {villageSearchQuery && (
              <button
                onClick={() => setVillageSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown if typing search query in cascading mode */}
          {villageSearchQuery.trim() && searchResults.length > 0 && viewMode === 'cascading' && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-2 text-[10px] font-bold uppercase text-slate-400 px-3 bg-slate-50 dark:bg-slate-800/50">
                Found {searchResults.length} matching registered villages:
              </div>
              {searchResults.map((v) => {
                const dist = KARNATAKA_DISTRICTS.find(d => d.id === v.districtId);
                const taluk = KARNATAKA_TALUKS.find(t => t.id === v.talukId);
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectSpecificVillage(v)}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'kn' ? v.nameKn : v.nameEn}
                        <span className="text-[11px] font-normal text-slate-500 ml-1.5">
                          ({v.nameEn})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        District: {dist?.nameEn} • Taluk: {taluk?.nameEn} • Stand: {v.distanceToNearestStandKm} km
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      Select
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Discovery Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Feeder Villages:
          </span>
          {popularKeyVillages.map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                const found = KARNATAKA_VILLAGES.find(v => v.id === chip.id);
                if (found) handleSelectSpecificVillage(found);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeVillage.id === chip.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {chip.name}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CASCADING LOCATION SELECTOR */}
      {viewMode === 'cascading' && (
        <>
          {/* Cascading Selector Toolbar: District -> Taluk -> Hobli -> Village */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Cascading Location Selector (District → Taluk → Hobli → Village)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. District */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  1. {t.selectDistrict} ({KARNATAKA_DISTRICTS.length})
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {lang === 'kn' ? d.nameKn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Taluk */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  2. {t.selectTaluk} ({availableTaluks.length})
                </label>
                <select
                  value={selectedTalukId}
                  onChange={(e) => handleTalukChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {availableTaluks.map((tlk) => (
                    <option key={tlk.id} value={tlk.id}>
                      {lang === 'kn' ? tlk.nameKn : tlk.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Hobli */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  3. {t.selectHobli} ({availableHoblis.length})
                </label>
                <select
                  value={selectedHobliId}
                  onChange={(e) => handleHobliChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {availableHoblis.map((hob) => (
                    <option key={hob.id} value={hob.id}>
                      {lang === 'kn' ? hob.nameKn : hob.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Village */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  4. {t.selectVillage} ({availableVillages.length})
                </label>
                <select
                  value={selectedVillageId}
                  onChange={(e) => setSelectedVillageId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {availableVillages.map((vil) => (
                    <option key={vil.id} value={vil.id}>
                      {lang === 'kn' ? vil.nameKn : vil.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected Village Transit Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.villageDetails}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {lang === 'kn' ? activeVillage.nameKn : activeVillage.nameEn}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>
                    GPS: {activeVillage.lat.toFixed(4)}° N, {activeVillage.lng.toFixed(4)}° E • Hobli: {KARNATAKA_HOBLIS.find(h => h.id === activeVillage.hobliId)?.nameEn} • District: {KARNATAKA_DISTRICTS.find(d => d.id === activeVillage.districtId)?.nameEn}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onSearchBusesFromStop(nearestStand.id)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Bus className="w-4 h-4 text-slate-500" />
                  <span>All Stand Buses</span>
                </button>
              </div>
            </div>

            {/* GRAMA SARIGE VILLAGE TRACKING & BOOKING ACTION HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Section A: Live Village Bus Tracking */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-800 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase">
                      <Radio className="w-3 h-3 animate-pulse" />
                      Live Village GPS
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {villageLiveBus ? villageLiveBus.busNumber : 'KA-09-F-2144'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'kn' ? 'ಗ್ರಾಮ ಸಾರಿಗೆ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Grama Sarige Live Bus Tracking'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {villageLiveBus
                      ? `${villageLiveBus.routeNameEn} • Heading towards ${villageLiveBus.nextStopNameEn}`
                      : `Feeder service connecting ${activeVillage.nameEn} with ${nearestStand.nameEn}`}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Speed</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {villageLiveBus ? `${villageLiveBus.speedKmh} km/h` : '42 km/h'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Next Stop</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {villageLiveBus ? villageLiveBus.nextStopNameEn : activeVillage.nameEn}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">ETA</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {villageLiveBus ? `${villageLiveBus.estimatedArrivalNextStopMinutes} mins` : '7 mins'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/40">
                  <button
                    onClick={() => {
                      const targetBusNo = villageLiveBus ? villageLiveBus.busNumber : (buses.find(b => b.isVillageBus)?.busNumber || 'KA-09-F-2144');
                      if (onTrackBus) {
                        onTrackBus(targetBusNo);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t.trackVillageBus}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Section B: Direct Village Bus Ticket Booking */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 via-slate-50 to-red-500/5 dark:from-red-950/40 dark:via-slate-800 dark:to-red-950/20 border border-red-200/80 dark:border-red-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
                      <Ticket className="w-3 h-3" />
                      E-Pass & Booking
                    </span>
                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                      ₹{villageSchedule ? villageSchedule.fare : 35} / Seat
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'kn' ? 'ಗ್ರಾಮ ಸಾರಿಗೆ ಟಿಕೆಟ್ ಕಾಯ್ದಿರಿಸಿ' : 'Book Village Bus Ticket'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Direct Grama Sarige digital seat reservation with Shakti Scheme women pass verification and QR code pass.
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-red-100 dark:border-red-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Departure</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {villageSchedule ? villageSchedule.departureTime : activeVillage.firstBus}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-red-100 dark:border-red-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Seats Open</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {villageSchedule ? `${villageSchedule.availableSeats}/${villageSchedule.totalSeats}` : '26/48'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-red-100 dark:border-red-900/40">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Women Quota</div>
                      <div className="text-sm font-black text-pink-600 dark:text-pink-400 mt-0.5">
                        {villageSchedule ? `${villageSchedule.ladiesReservedSeats} Seats` : '16 Seats'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-red-200/50 dark:border-red-800/40">
                  <button
                    onClick={() => {
                      const targetRoute = villageRoute || routes[0];
                      const targetSchedule = villageSchedule || schedules[0];
                      if (onSelectScheduleForBooking) {
                        onSelectScheduleForBooking(targetSchedule, targetRoute);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{t.bookVillageBus}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Village Transit Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">{t.nearestBusStand}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {lang === 'kn' ? nearestStand.nameKn : nearestStand.nameEn}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{nearestStand.addressEn}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">{t.distanceToStand}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeVillage.distanceToNearestStandKm} <span className="text-xs font-normal">km</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">Paved rural link roadway</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">{t.firstBusDep}</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-500" />
                  {activeVillage.firstBus}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Morning commuter trip</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase text-slate-400">{t.lastBusDep}</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {activeVillage.lastBus}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Night return feeder</div>
              </div>
            </div>

            {/* Regular Services operating to this Village */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {t.availableServices}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeVillage.regularServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {service}
                      </div>
                      <div className="text-[11px] text-slate-500">Every 45-60 mins</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: ALL REGISTERED VILLAGES DIRECTORY (GRID & EXPLORER) */}
      {viewMode === 'all_villages' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Filter by District:
              </span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Districts ({KARNATAKA_DISTRICTS.length})</option>
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {lang === 'kn' ? d.nameKn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {allVillagesFiltered.length} verified villages
            </span>
          </div>

          {/* Villages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allVillagesFiltered.map((vil) => {
              const dist = KARNATAKA_DISTRICTS.find(d => d.id === vil.districtId);
              const taluk = KARNATAKA_TALUKS.find(t => t.id === vil.talukId);
              const stand = KARNATAKA_BUS_STOPS.find(s => s.id === vil.nearestBusStopId) || KARNATAKA_BUS_STOPS[0];
              const matchingRoute = routes.find(r => r.villageId === vil.id) ||
                routes.find(r => r.routeNameEn.toLowerCase().includes(vil.nameEn.toLowerCase()));
              const matchingBus = matchingRoute ? buses.find(b => b.routeId === matchingRoute.id) : undefined;
              const matchingSchedule = matchingRoute ? schedules.find(s => s.routeId === matchingRoute.id) : undefined;

              return (
                <div
                  key={vil.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-300 dark:hover:border-red-900/60 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {dist?.nameEn}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-600">
                        {vil.distanceToNearestStandKm} km to stand
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {lang === 'kn' ? vil.nameKn : vil.nameEn}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Taluk: {taluk?.nameEn} • Nearest Hub: {stand.nameEn}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>First Bus:</span>
                        <strong className="text-slate-900 dark:text-white">{vil.firstBus}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Last Bus:</span>
                        <strong className="text-slate-900 dark:text-white">{vil.lastBus}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Services:</span>
                        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[140px]">
                          {vil.regularServices[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const busNo = matchingBus ? matchingBus.busNumber : 'KA-09-F-2144';
                          if (onTrackBus) onTrackBus(busNo);
                        }}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Track Bus</span>
                      </button>

                      <button
                        onClick={() => {
                          const targetRoute = matchingRoute || routes[0];
                          const targetSchedule = matchingSchedule || schedules[0];
                          if (onSelectScheduleForBooking) onSelectScheduleForBooking(targetSchedule, targetRoute);
                        }}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book Pass</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleSelectSpecificVillage(vil)}
                      className="w-full py-1.5 text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Full Village Transit Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
