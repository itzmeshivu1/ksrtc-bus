import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bus, 
  MapPin, 
  Route as RouteIcon, 
  Ticket, 
  Users, 
  Radio, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  LiveBusTracking, 
  KSRTCRoute, 
  BusSchedule, 
  BusStop, 
  Booking, 
  Language, 
  BusCategory 
} from '../types';
import { 
  KARNATAKA_DISTRICTS, 
  KARNATAKA_TALUKS, 
  KARNATAKA_VILLAGES 
} from '../data/karnatakaGeoData';
import { getT } from '../data/translations';

interface AdminDashboardViewProps {
  buses: LiveBusTracking[];
  routes: KSRTCRoute[];
  schedules: BusSchedule[];
  stops: BusStop[];
  bookings: Booking[];
  onAddNewBusSchedule: (schedule: BusSchedule) => void;
  lang: Language;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  buses,
  routes,
  schedules,
  stops,
  bookings,
  onAddNewBusSchedule,
  lang
}) => {
  const t = getT(lang);
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'geo' | 'bookings'>('fleet');

  // Form for adding new scheduled bus
  const [showAddBusModal, setShowAddBusModal] = useState<boolean>(false);
  const [newBusNumber, setNewBusNumber] = useState('KA-01-F-5599');
  const [newFleetNumber, setNewFleetNumber] = useState('KSRTC-EXP-559');
  const [newCategory, setNewCategory] = useState<BusCategory>('Karnataka Sarige');
  const [newRouteId, setNewRouteId] = useState(routes[0].id);
  const [newDepTime, setNewDepTime] = useState('11:00 AM');
  const [newArrTime, setNewArrTime] = useState('02:30 PM');
  const [newFare, setNewFare] = useState(210);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const created: BusSchedule = {
      id: `sch_${Date.now()}`,
      routeId: newRouteId,
      busNumber: newBusNumber,
      fleetNumber: newFleetNumber,
      category: newCategory,
      departureTime: newDepTime,
      arrivalTime: newArrTime,
      fare: newFare,
      totalSeats: 50,
      availableSeats: 50,
      ladiesReservedSeats: 10,
      seatLayoutType: '2x3',
      hasAC: newCategory.includes('Airavat') || newCategory.includes('Ambari'),
      hasCharging: true,
      hasWaterBottle: false,
      hasWiFi: false,
      hasBlanket: false,
      driverName: 'Appointed Driver',
      conductorName: 'Appointed Conductor',
      depot: 'Central Division Depot'
    };

    onAddNewBusSchedule(created);
    setShowAddBusModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Admin Title Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.adminTitle}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Divisional Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.adminSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddBusModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bus Schedule</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Live GPS Buses</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {buses.length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>100% telemetry online</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active State Routes</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {routes.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Covering 14 divisions</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Karnataka Locations</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {KARNATAKA_DISTRICTS.length + KARNATAKA_TALUKS.length + KARNATAKA_VILLAGES.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Districts, Taluks & Villages</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Tickets Issued</div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
            {bookings.length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Confirmed electronic passes</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'fleet', label: 'Fleet Telematics', icon: Bus },
          { id: 'routes', label: 'Route Timetables', icon: RouteIcon },
          { id: 'geo', label: 'Geographical Master', icon: MapPin },
          { id: 'bookings', label: 'Booking Manifests', icon: Ticket }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Fleet Telematics Table */}
      {activeTab === 'fleet' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Service Category</th>
                  <th className="px-4 py-3">Assigned Route</th>
                  <th className="px-4 py-3">Next Stop</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Delay</th>
                  <th className="px-4 py-3">GPS Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {buses.map((bus) => (
                  <tr key={bus.busNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {bus.busNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {bus.category}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {bus.routeNameEn}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {bus.nextStopNameEn}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {bus.speedKmh} km/h
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${bus.delayMinutes === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {bus.delayMinutes === 0 ? 'On Time' : `+${bus.delayMinutes}m`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        AIS-140 GPS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Route Timetables */}
      {activeTab === 'routes' && (
        <div className="grid gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Route #{route.routeNumber}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {route.routeNameEn}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {route.totalDistanceKm} km • Base Fare: ₹{route.fare}
                </div>
              </div>

              {/* Stop listing */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {route.stops.map((stop, sIdx) => (
                  <span
                    key={stop.stopId}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{stop.stopNameEn}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({stop.scheduledArrival})</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Geographical Master */}
      {activeTab === 'geo' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Karnataka Geographic Index Hierarchy
          </h3>
          <p className="text-xs text-slate-500">
            Validated against Karnataka Municipal Administration and Revenue Department records.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Districts Configured</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {KARNATAKA_DISTRICTS.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Taluks Indexed</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {KARNATAKA_TALUKS.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Major Bus Stands</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {stops.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Bookings Manifest */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No passenger bookings generated yet in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">PNR</th>
                    <th className="px-4 py-3">Bus Number</th>
                    <th className="px-4 py-3">Primary Passenger</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-bold text-red-600">{b.pnrNumber}</td>
                      <td className="px-4 py-3 font-mono font-bold">{b.busNumber}</td>
                      <td className="px-4 py-3 font-semibold">{b.passengers[0]?.name || 'Passenger'}</td>
                      <td className="px-4 py-3 font-mono">{b.seats.join(', ')}</td>
                      <td className="px-4 py-3 font-mono font-bold">₹{b.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Bus Schedule Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Schedule New KSRTC Service
            </h3>
            <form onSubmit={handleCreateSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Bus Registration Number
                </label>
                <input
                  type="text"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Service Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Karnataka Sarige">Karnataka Sarige</option>
                  <option value="Rajahamsa Executive">Rajahamsa Executive</option>
                  <option value="Airavat Club Class">Airavat Club Class</option>
                  <option value="Ambari Dream Class">Ambari Dream Class</option>
                  <option value="EV Power Plus">EV Power Plus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
