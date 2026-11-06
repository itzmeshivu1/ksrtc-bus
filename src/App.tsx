/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LiveBusTracking, 
  KSRTCRoute, 
  BusSchedule, 
  BusStop, 
  Booking, 
  UserProfile, 
  Language 
} from './types';
import { 
  KARNATAKA_DISTRICTS, 
  KARNATAKA_TALUKS, 
  KARNATAKA_HOBLIS, 
  KARNATAKA_VILLAGES, 
  KARNATAKA_BUS_STOPS 
} from './data/karnatakaGeoData';
import { 
  KSRTC_ROUTES, 
  BUS_SCHEDULES, 
  INITIAL_LIVE_BUSES 
} from './data/ksrtcRoutesAndBuses';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { LiveTrackingView } from './components/LiveTrackingView';
import { BusSearchView } from './components/BusSearchView';
import { BookingView } from './components/BookingView';
import { KarnatakaDirectoryView } from './components/KarnatakaDirectoryView';
import { NearbyStopsView } from './components/NearbyStopsView';
import { DriverAppView } from './components/DriverAppView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { MyProfileView } from './components/MyProfileView';
import { AICustomerCareModal } from './components/AICustomerCareModal';
import { TripPlannerView } from './components/TripPlannerView';
import { TicketQRScannerModal } from './components/TicketQRScannerModal';
import { Bot, Sparkles, Mic, QrCode } from 'lucide-react';

const INITIAL_SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'booking_sample_1',
    pnrNumber: 'KSRTC-PNR-88412',
    ticketNumber: 'TKT-BLR-MYS-88412',
    scheduleId: 'sched_blr_mys_0600',
    routeId: 'route_blr_mys_101',
    routeNameEn: 'Bengaluru - Mysuru Electric Expressway',
    routeNameKn: 'ಬೆಂಗಳೂರು - ಮೈಸೂರು ಎಲೆಕ್ಟ್ರಿಕ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ',
    busNumber: 'KA-01-F-9420',
    category: 'EV Power Plus' as any,
    journeyDate: new Date().toISOString().split('T')[0],
    departureTime: '06:00 AM',
    arrivalTime: '08:45 AM',
    boardingStop: 'Bengaluru Kempegowda Bus Station (Majestic)',
    droppingStop: 'Mysuru Suburb Bus Stand',
    bayNumber: 'Platform 2A',
    seats: ['12W', '13A'],
    passengers: [
      { name: 'Siddaraju B.K.', age: 34, gender: 'male', seatNumber: '12W' },
      { name: 'Geetha S.', age: 31, gender: 'female', seatNumber: '13A' }
    ],
    contactMobile: '9845012345',
    contactEmail: 'siddaraju@karnataka.gov.in',
    baseFare: 640,
    gstAmount: 32,
    tollFee: 30,
    totalAmount: 702,
    paymentMethod: 'UPI',
    paymentTransactionId: 'UPI-TXN-KSRTC-982144',
    status: 'CONFIRMED',
    bookedAt: '2025-05-17 18:30',
    qrPayload: JSON.stringify({
      pnr: 'KSRTC-PNR-88412',
      ticket: 'TKT-BLR-MYS-88412',
      bus: 'KA-01-F-9420',
      route: 'Bengaluru - Mysuru',
      seats: ['12W', '13A'],
      passenger: 'Siddaraju B.K.',
      status: 'CONFIRMED',
      bay: '2A'
    })
  },
  {
    id: 'booking_sample_2',
    pnrNumber: 'KSRTC-PNR-77291',
    ticketNumber: 'TKT-BLR-MNG-77291',
    scheduleId: 'sched_blr_mng_2200',
    routeId: 'route_blr_mng_204',
    routeNameEn: 'Bengaluru - Mangaluru Coastal Deluxe',
    routeNameKn: 'ಬೆಂಗಳೂರು - ಮಂಗಳೂರು ಕರಾವಳಿ ಡೀಲಕ್ಸ್',
    busNumber: 'KA-19-F-7712',
    category: 'Airavat Club Class' as any,
    journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTime: '10:00 PM',
    arrivalTime: '05:30 AM',
    boardingStop: 'Bengaluru Kempegowda Bus Station (Majestic)',
    droppingStop: 'Mangaluru KSRTC Bus Stand (Bejai)',
    bayNumber: 'Platform 5',
    seats: ['08W'],
    passengers: [
      { name: 'Siddaraju B.K.', age: 34, gender: 'male', seatNumber: '08W' }
    ],
    contactMobile: '9845012345',
    contactEmail: 'siddaraju@karnataka.gov.in',
    baseFare: 820,
    gstAmount: 41,
    tollFee: 40,
    totalAmount: 901,
    paymentMethod: 'UPI',
    paymentTransactionId: 'UPI-TXN-KSRTC-741982',
    status: 'CONFIRMED',
    bookedAt: '2025-05-17 21:10',
    qrPayload: JSON.stringify({
      pnr: 'KSRTC-PNR-77291',
      ticket: 'TKT-BLR-MNG-77291',
      bus: 'KA-19-F-7712',
      route: 'Bengaluru - Mangaluru',
      seats: ['08W'],
      passenger: 'Siddaraju B.K.',
      status: 'CONFIRMED',
      bay: '5'
    })
  }
];

export default function App() {
  // App state
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAICustomerCareOpen, setIsAICustomerCareOpen] = useState<boolean>(false);

  // Master records
  const [routes, setRoutes] = useState<KSRTCRoute[]>(KSRTC_ROUTES);
  const [schedules, setSchedules] = useState<BusSchedule[]>(BUS_SCHEDULES);
  const [stops, setStops] = useState<BusStop[]>(KARNATAKA_BUS_STOPS);
  const [buses, setBuses] = useState<LiveBusTracking[]>(INITIAL_LIVE_BUSES);
  
  // Selected bus for tracking
  const [selectedBusNumber, setSelectedBusNumber] = useState<string>(INITIAL_LIVE_BUSES[0].busNumber);
  
  // Selected schedule for booking flow
  const [bookingTarget, setBookingTarget] = useState<{
    schedule: BusSchedule;
    route: KSRTCRoute;
  }>({
    schedule: BUS_SCHEDULES[0],
    route: KSRTC_ROUTES[0]
  });

  // User bookings & ticket verification
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_SAMPLE_BOOKINGS);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  // User profile
  const [user, setUser] = useState<UserProfile>({
    name: 'Siddaraju B.K.',
    phone: '9845012345',
    email: 'siddaraju@karnataka.gov.in',
    isLoggedIn: true,
    favoriteRoutes: ['route_blr_mys_101', 'route_blr_mng_204'],
    savedStops: ['stop_kbs_majestic', 'stop_mysuru_suburb'],
    savedLocations: [
      { label: 'Home (Bengaluru)', stopName: 'Majestic Central T1' },
      { label: 'Hometown (Mandya)', stopName: 'Mandya KSRTC Bus Stand' }
    ],
    notificationPreferences: {
      busApproachingAlert: true,
      bookingSms: true,
      scheduleChanges: true
    }
  });

  // Toggle theme class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Periodic simulated telematics tick (increment seconds, simulate slight movement)
  useEffect(() => {
    const timer = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => ({
          ...bus,
          lastUpdatedSecondsAgo: (bus.lastUpdatedSecondsAgo + 2) % 60
        }))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Handler to advance bus position along route stops
  const handleSimulateTick = (busNumber: string) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.busNumber !== busNumber) return bus;

        const route = routes.find((r) => r.id === bus.routeId) || routes[0];
        const nextIdx = (bus.currentSegmentIndex + 1) % route.stops.length;
        const targetStop = route.stops[nextIdx];

        // Move coordinates slightly towards target stop
        const newLat = bus.currentLat + (targetStop.lat - bus.currentLat) * 0.25;
        const newLng = bus.currentLng + (targetStop.lng - bus.currentLng) * 0.25;
        const newDist = Math.max(0.5, Math.round((bus.distanceToNextStopKm - 3.2) * 10) / 10);
        const newEta = Math.max(1, Math.round(newDist / (bus.speedKmh / 60)));

        return {
          ...bus,
          currentLat: newLat,
          currentLng: newLng,
          currentSegmentIndex: nextIdx === 0 ? 0 : bus.currentSegmentIndex,
          nextStopId: targetStop.stopId,
          nextStopNameEn: targetStop.stopNameEn,
          nextStopNameKn: targetStop.stopNameKn,
          distanceToNextStopKm: newDist,
          estimatedArrivalNextStopMinutes: newEta,
          lastUpdatedSecondsAgo: 0
        };
      })
    );
  };

  // Handler for driver telematics updates
  const handleUpdateBusTelemetry = (busNumber: string, speedKmh: number, nextStopId: string) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.busNumber !== busNumber) return bus;
        const foundStop = stops.find((s) => s.id === nextStopId);
        return {
          ...bus,
          speedKmh,
          nextStopId,
          nextStopNameEn: foundStop ? foundStop.nameEn : bus.nextStopNameEn,
          nextStopNameKn: foundStop ? foundStop.nameKn : bus.nextStopNameKn,
          lastUpdatedSecondsAgo: 0
        };
      })
    );
  };

  // Switch to tracking view for a specific bus
  const handleTrackBus = (busNumber: string) => {
    setSelectedBusNumber(busNumber);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to booking view for a specific schedule
  const handleSelectScheduleForBooking = (schedule: BusSchedule, route: KSRTCRoute) => {
    setBookingTarget({ schedule, route });
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new booking
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  // Cancel booking
  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this KSRTC ticket? Refund will be processed as per transport corporation rules.')) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
    }
  };

  // Add new bus schedule in admin
  const handleAddNewBusSchedule = (newSchedule: BusSchedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
    alert(`New service ${newSchedule.busNumber} added successfully.`);
  };

  // Trigger bus search from a directory stop
  const handleSearchBusesFromStop = (stopId: string) => {
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quota defense state for Google Maps Demo Key
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Google Maps Quota Exhaustion Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Universal Top Header & Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'kn' : 'en')}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        liveBusesCount={buses.length}
        onOpenAICustomerCare={() => setIsAICustomerCareOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            buses={buses}
            routes={routes}
            schedules={schedules}
            stops={stops}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTrackBus={handleTrackBus}
            onSelectScheduleForBooking={handleSelectScheduleForBooking}
            onOpenAICustomerCare={() => setIsAICustomerCareOpen(true)}
            lang={lang}
          />
        )}

        {currentTab === 'planner' && (
          <TripPlannerView
            routes={routes}
            schedules={schedules}
            buses={buses}
            stops={stops}
            onSelectScheduleForBooking={handleSelectScheduleForBooking}
            onTrackBus={handleTrackBus}
            lang={lang}
          />
        )}

        {currentTab === 'tracking' && (
          <LiveTrackingView
            buses={buses}
            routes={routes}
            stops={stops}
            selectedBusNumber={selectedBusNumber}
            onSelectBusNumber={(busNo) => setSelectedBusNumber(busNo)}
            lang={lang}
            onSimulateTick={handleSimulateTick}
          />
        )}

        {currentTab === 'search' && (
          <BusSearchView
            routes={routes}
            schedules={schedules}
            stops={stops}
            onSelectScheduleForBooking={handleSelectScheduleForBooking}
            onTrackBus={handleTrackBus}
            lang={lang}
          />
        )}

        {currentTab === 'booking' && (
          <BookingView
            initialSchedule={bookingTarget.schedule}
            initialRoute={bookingTarget.route}
            schedules={schedules}
            routes={routes}
            onBookingSuccess={handleBookingSuccess}
            onTrackBus={handleTrackBus}
            lang={lang}
          />
        )}

        {currentTab === 'directory' && (
          <KarnatakaDirectoryView
            onSearchBusesFromStop={handleSearchBusesFromStop}
            onTrackBus={handleTrackBus}
            onSelectScheduleForBooking={handleSelectScheduleForBooking}
            buses={buses}
            routes={routes}
            schedules={schedules}
            lang={lang}
          />
        )}

        {currentTab === 'nearby' && (
          <NearbyStopsView
            stops={stops}
            buses={buses}
            onSelectBus={handleTrackBus}
            lang={lang}
          />
        )}

        {currentTab === 'driver' && (
          <DriverAppView
            buses={buses}
            routes={routes}
            onUpdateBusTelemetry={handleUpdateBusTelemetry}
            lang={lang}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView
            buses={buses}
            routes={routes}
            schedules={schedules}
            stops={stops}
            bookings={bookings}
            onAddNewBusSchedule={handleAddNewBusSchedule}
            lang={lang}
          />
        )}

        {currentTab === 'profile' && (
          <MyProfileView
            bookings={bookings}
            user={user}
            onUpdateUser={setUser}
            onCancelBooking={handleCancelBooking}
            onTrackBus={handleTrackBus}
            lang={lang}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-sm">
              Karnataka State Road Transport Corporation (KSRTC)
            </div>
            <p className="text-slate-400 mt-1">
              Sarige Bhavana, K.H. Road, Shanthinagar, Bengaluru - 560027. Central Telematics Command Centre.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Toll-Free Helpline: 080-49596666</span>
            <span>•</span>
            <span>AWATAR 2.0 Integrated</span>
          </div>
        </div>
      </footer>

      {/* Floating KSRTC Quick Actions: QR Scanner & Sahayaka AI */}
      <div className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <button
          onClick={() => setIsQRScannerOpen(true)}
          className="px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-xl shadow-black/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20 dark:border-slate-800 cursor-pointer"
          title="Scan Ticket QR Code (Camera)"
        >
          <QrCode className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-bold">
            {lang === 'kn' ? 'ಟಿಕೆಟ್ ಸ್ಕ್ಯಾನ್' : 'Scan Ticket QR'}
          </span>
        </button>

        <button
          onClick={() => setIsAICustomerCareOpen(true)}
          className="group px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-slate-900 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white/20 cursor-pointer"
          title="Open KSRTC Sahayaka AI (Voice & Doubts)"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-tight leading-tight flex items-center gap-1">
              <span>{lang === 'kn' ? 'AI ಸಹಾಯಕ' : 'Ask AI Sahayaka'}</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[10px] text-red-200 font-normal leading-tight">
              {lang === 'kn' ? 'ವಾಯ್ಸ್ & ಮರುಪಾವತಿ ನೆರವು' : 'Voice, Refunds & Doubts'}
            </div>
          </div>
        </button>
      </div>

      {/* AI Customer Care & Doubt Clarifier Modal */}
      <AICustomerCareModal
        isOpen={isAICustomerCareOpen}
        onClose={() => setIsAICustomerCareOpen(false)}
        lang={lang}
        onTrackBus={handleTrackBus}
        onSelectScheduleForBooking={handleSelectScheduleForBooking}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        buses={buses}
        routes={routes}
        schedules={schedules}
      />

      {/* Ticket QR Scanner Camera Modal */}
      <TicketQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        bookings={bookings}
        onTrackBus={handleTrackBus}
        lang={lang}
      />
    </div>
  );
}
