import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  IndianRupee, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Printer, 
  Compass, 
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Trash2,
  Check
} from 'lucide-react';
import { BusSchedule, KSRTCRoute, Seat, Passenger, Booking, Language } from '../types';
import { getT } from '../data/translations';
import { generateBusSeats, generateSvgQrPattern, getCategoryBadgeClass } from '../utils/geoUtils';
import { InteractiveSeatMap } from './InteractiveSeatMap';

interface BookingViewProps {
  initialSchedule?: BusSchedule;
  initialRoute?: KSRTCRoute;
  schedules: BusSchedule[];
  routes: KSRTCRoute[];
  onBookingSuccess: (booking: Booking) => void;
  onTrackBus: (busNumber: string) => void;
  lang: Language;
}

export const BookingView: React.FC<BookingViewProps> = ({
  initialSchedule,
  initialRoute,
  schedules,
  routes,
  onBookingSuccess,
  onTrackBus,
  lang
}) => {
  const t = getT(lang);

  // Selected schedule & route
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    initialSchedule?.id || schedules[0].id
  );

  const activeSchedule = useMemo(() => {
    return schedules.find((s) => s.id === selectedScheduleId) || schedules[0];
  }, [selectedScheduleId, schedules]);

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === activeSchedule.routeId) || routes[0];
  }, [activeSchedule, routes]);

  // Generate seats for this bus
  const initialSeats = useMemo(() => {
    return generateBusSeats(activeSchedule.seatLayoutType, activeSchedule.fare);
  }, [activeSchedule]);

  // Booking states
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [boardingStop, setBoardingStop] = useState<string>(activeRoute.stops[0].stopNameEn);
  const [droppingStop, setDroppingStop] = useState<string>(
    activeRoute.stops[activeRoute.stops.length - 1].stopNameEn
  );

  // Passengers info
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: 28, gender: 'male', seatNumber: '' }
  ]);
  const [contactMobile, setContactMobile] = useState<string>('9876543210');
  const [contactEmail, setContactEmail] = useState<string>('passenger@ksrtc.in');

  // Checkout & Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Sync passenger entries when seat selection changes
  const handleToggleSeat = (seat: Seat) => {
    if (seat.isBooked) return;

    if (selectedSeatNumbers.includes(seat.number)) {
      const nextSeats = selectedSeatNumbers.filter((s) => s !== seat.number);
      setSelectedSeatNumbers(nextSeats);
      setPassengers((prev) => prev.slice(0, Math.max(1, nextSeats.length)));
    } else {
      if (selectedSeatNumbers.length >= 6) {
        alert('Maximum 6 seats per booking allowed under KSRTC terms.');
        return;
      }
      const nextSeats = [...selectedSeatNumbers, seat.number];
      setSelectedSeatNumbers(nextSeats);
      // Ensure we have passenger records for each seat
      if (nextSeats.length > passengers.length) {
        setPassengers((prev) => [
          ...prev,
          { name: '', age: 26, gender: 'male', seatNumber: seat.number }
        ]);
      }
    }
  };

  // Fare calculations
  const seatCount = Math.max(1, selectedSeatNumbers.length);
  const baseFare = activeSchedule.fare * seatCount;
  const gstAmount = Math.round(baseFare * 0.05);
  const tollFee = 45 * seatCount;
  const totalPayable = baseFare + gstAmount + tollFee;

  // Process payment and issue digital ticket
  const handleConfirmAndPay = () => {
    if (selectedSeatNumbers.length === 0) {
      alert('Please select at least 1 seat to proceed.');
      return;
    }
    if (!passengers[0].name.trim()) {
      alert('Please enter primary passenger name.');
      return;
    }
    if (!contactMobile.trim() || contactMobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      const pnr = `KSRTC${Math.floor(10000000 + Math.random() * 90000000)}`;
      const ticketNo = `E-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnId = `TXN-${Date.now().toString().slice(-8)}`;

      const finalizedBooking: Booking = {
        id: `book_${Date.now()}`,
        pnrNumber: pnr,
        ticketNumber: ticketNo,
        scheduleId: activeSchedule.id,
        routeId: activeRoute.id,
        routeNameEn: activeRoute.routeNameEn,
        routeNameKn: activeRoute.routeNameKn,
        busNumber: activeSchedule.busNumber,
        category: activeSchedule.category,
        journeyDate: '2026-10-30',
        departureTime: activeSchedule.departureTime,
        arrivalTime: activeSchedule.arrivalTime,
        boardingStop: boardingStop,
        droppingStop: droppingStop,
        bayNumber: activeRoute.stops[0].bayNumber || 'Bay 12',
        seats: selectedSeatNumbers,
        passengers: passengers.map((p, idx) => ({
          ...p,
          seatNumber: selectedSeatNumbers[idx] || selectedSeatNumbers[0]
        })),
        contactMobile: contactMobile,
        contactEmail: contactEmail,
        baseFare: baseFare,
        gstAmount: gstAmount,
        tollFee: tollFee,
        totalAmount: totalPayable,
        paymentMethod: paymentMethod,
        paymentTransactionId: txnId,
        status: 'CONFIRMED',
        bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        qrPayload: `KSRTC|PNR:${pnr}|TKT:${ticketNo}|BUS:${activeSchedule.busNumber}|SEATS:${selectedSeatNumbers.join(',')}`
      };

      setConfirmedBooking(finalizedBooking);
      onBookingSuccess(finalizedBooking);
      setIsProcessingPayment(false);
    }, 1200);
  };

  const badgeStyle = getCategoryBadgeClass(activeSchedule.category);

  // If already booked, show the Digital Ticket
  if (confirmedBooking) {
    const qrSvg = generateSvgQrPattern(confirmedBooking.qrPayload, 120);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
        {/* Success Banner */}
        <div className="bg-emerald-600 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg shadow-emerald-600/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">{t.bookingConfirmed}</h2>
              <p className="text-xs text-emerald-100">SMS with PNR sent to {confirmedBooking.contactMobile}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.printTicket}</span>
          </button>
        </div>

        {/* Official Digital Ticket Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-600 shadow-xl overflow-hidden print:border print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-6 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold tracking-widest text-red-200 uppercase">
                  Government of Karnataka Undertaking
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  {lang === 'kn' ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ರಸ್ತೆ ಸಾರಿಗೆ ನಿಗಮ' : 'Karnataka State Road Transport Corporation'}
                </h1>
                <p className="text-xs text-red-100 font-semibold mt-1">
                  AWATAR Electronic Reservation Slip (ERS)
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl text-right border border-white/20">
                <div className="text-[10px] text-red-200 uppercase font-bold">Status</div>
                <div className="text-xs font-black text-white">CONFIRMED</div>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6">
            {/* PNR & QR Code Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">{t.pnrLabel}</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-wider text-red-600 dark:text-red-400">
                    {confirmedBooking.pnrNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">{t.ticketNoLabel}</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {confirmedBooking.ticketNumber}
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center">
                <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <span className="text-[10px] text-slate-400 mt-1 font-mono">Conductor Scan Code</span>
              </div>
            </div>

            {/* Service & Bus Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Bus Service</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{confirmedBooking.category}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.busRegNo}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">{confirmedBooking.busNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.journeyDate}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{confirmedBooking.journeyDate}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.bayPlatform}</div>
                <div className="text-sm font-black text-red-600 dark:text-red-400 font-mono mt-0.5">{confirmedBooking.bayNumber}</div>
              </div>
            </div>

            {/* Boarding and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Boarding Point & Time</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{confirmedBooking.boardingStop}</div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400 font-mono mt-1">
                  Departure: {confirmedBooking.departureTime}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Dropping Point & ETA</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{confirmedBooking.droppingStop}</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-1">
                  Expected: {confirmedBooking.arrivalTime}
                </div>
              </div>
            </div>

            {/* Passenger List */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Passenger & Seat Allocation
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {confirmedBooking.passengers.map((p, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{p.name || 'Passenger'}</span>
                      <span className="text-slate-400 ml-2">({p.age} yrs, {p.gender})</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-mono font-bold">
                      Seat {p.seatNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="text-slate-500 space-y-0.5">
                <div>Base Fare: ₹{confirmedBooking.baseFare} + GST (5%): ₹{confirmedBooking.gstAmount} + Toll: ₹{confirmedBooking.tollFee}</div>
                <div>Payment via {confirmedBooking.paymentMethod} (Txn: {confirmedBooking.paymentTransactionId})</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 mr-2 uppercase font-bold text-[10px]">Total Paid:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{confirmedBooking.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Actions */}
          <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onTrackBus(confirmedBooking.busNumber)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{t.trackThisBus}</span>
            </button>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              Book Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-600" />
            {t.selectSeatsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'kn' ? activeRoute.routeNameKn : activeRoute.routeNameEn} • {activeSchedule.busNumber}
          </p>
        </div>

        {/* Change Bus Service Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Service:</span>
          <select
            value={selectedScheduleId}
            onChange={(e) => {
              setSelectedScheduleId(e.target.value);
              setSelectedSeatNumbers([]);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            {schedules.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.busNumber} - {sch.category} ({sch.departureTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Realistic Bus Seating Layout (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <InteractiveSeatMap
              schedule={activeSchedule}
              selectedSeats={selectedSeatNumbers}
              onToggleSeat={handleToggleSeat}
              lang={lang}
            />
          </div>
        </div>

        {/* Right: Boarding Point & Passenger Info & Payment Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Boarding and Dropping points */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Stops & Timings
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.boardingPoint}
                </label>
                <select
                  value={boardingStop}
                  onChange={(e) => setBoardingStop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {activeRoute.stops.map((s) => (
                    <option key={s.stopId} value={s.stopNameEn}>
                      {s.stopNameEn} ({s.scheduledDeparture})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.droppingPoint}
                </label>
                <select
                  value={droppingStop}
                  onChange={(e) => setDroppingStop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {activeRoute.stops.map((s) => (
                    <option key={s.stopId} value={s.stopNameEn}>
                      {s.stopNameEn} ({s.scheduledArrival})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {t.passengerDetails}
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.passengerName} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Gowda"
                  value={passengers[0].name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassengers((prev) => [{ ...prev[0], name: val }, ...prev.slice(1)]);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t.passengerAge}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={passengers[0].age}
                    onChange={(e) => {
                      const age = parseInt(e.target.value, 10) || 28;
                      setPassengers((prev) => [{ ...prev[0], age }, ...prev.slice(1)]);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t.passengerGender}
                  </label>
                  <select
                    value={passengers[0].gender}
                    onChange={(e) => {
                      const gen = e.target.value as 'male' | 'female' | 'other';
                      setPassengers((prev) => [{ ...prev[0], gender: gen }, ...prev.slice(1)]);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t.mobileNumber}
                  </label>
                  <input
                    type="tel"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t.emailAddress}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">{t.payViaUpi}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'NetBanking'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">NetBanking</span>
                </button>
              </div>
            </div>

            {/* Fare Breakdown & Checkout Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t.baseFare} ({selectedSeatNumbers.length || 1} seat)</span>
                <span className="font-mono">₹{baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t.gstTax}</span>
                <span className="font-mono">₹{gstAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t.tollCharge}</span>
                <span className="font-mono">₹{tollFee}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{t.totalPayable}</span>
                <span className="font-mono text-red-600 dark:text-red-400">₹{totalPayable}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isProcessingPayment || selectedSeatNumbers.length === 0}
                className="w-full mt-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.payNow}</span>
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-slate-400 mt-2">
                {t.cancellationNotice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
