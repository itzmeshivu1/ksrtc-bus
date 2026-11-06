import React, { useState, useMemo } from 'react';
import { 
  User, 
  Check, 
  Shield, 
  Sparkles, 
  Lock, 
  Layers, 
  Info,
  Heart
} from 'lucide-react';
import { Seat, BusSchedule, Language } from '../types';

interface InteractiveSeatMapProps {
  schedule: BusSchedule;
  selectedSeats: string[];
  onToggleSeat: (seat: Seat) => void;
  lang: Language;
  maxSeats?: number;
}

export const InteractiveSeatMap: React.FC<InteractiveSeatMapProps> = ({
  schedule,
  selectedSeats,
  onToggleSeat,
  lang,
  maxSeats = 6
}) => {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Generate realistic seat list based on layout
  const allSeats: Seat[] = useMemo(() => {
    const layout = schedule.seatLayoutType;
    const baseFare = schedule.fare;
    const seats: Seat[] = [];

    if (layout === 'sleeper') {
      // 36-berth sleeper: 18 lower (6 rows of 1+2), 18 upper (6 rows of 1+2)
      for (let r = 1; r <= 6; r++) {
        // Lower Deck
        // Single Berth (Left Window)
        const lSingleNum = `L${(r - 1) * 3 + 1}`;
        seats.push({
          id: lSingleNum,
          number: lSingleNum,
          berth: 'lower',
          type: 'single',
          isBooked: r === 2 || r === 5,
          isLadiesReserved: r === 1,
          price: baseFare + 60
        });
        // Double Berth (Right Aisle)
        const lAisleNum = `L${(r - 1) * 3 + 2}`;
        seats.push({
          id: lAisleNum,
          number: lAisleNum,
          berth: 'lower',
          type: 'aisle',
          isBooked: r === 4,
          isLadiesReserved: r <= 2,
          price: baseFare
        });
        // Double Berth (Right Window)
        const lWinNum = `L${(r - 1) * 3 + 3}`;
        seats.push({
          id: lWinNum,
          number: lWinNum,
          berth: 'lower',
          type: 'window',
          isBooked: r === 3,
          isLadiesReserved: r <= 2,
          price: baseFare + 40
        });

        // Upper Deck
        const uSingleNum = `U${(r - 1) * 3 + 1}`;
        seats.push({
          id: uSingleNum,
          number: uSingleNum,
          berth: 'upper',
          type: 'single',
          isBooked: r === 1 || r === 6,
          isLadiesReserved: false,
          price: baseFare + 40
        });
        const uAisleNum = `U${(r - 1) * 3 + 2}`;
        seats.push({
          id: uAisleNum,
          number: uAisleNum,
          berth: 'upper',
          type: 'aisle',
          isBooked: r === 3,
          isLadiesReserved: false,
          price: baseFare - 20
        });
        const uWinNum = `U${(r - 1) * 3 + 3}`;
        seats.push({
          id: uWinNum,
          number: uWinNum,
          berth: 'upper',
          type: 'window',
          isBooked: r === 5,
          isLadiesReserved: false,
          price: baseFare + 20
        });
      }
      return seats;
    }

    if (layout === '2x2') {
      // 40 to 45 seats: 10 rows of 4 seats + rear row of 5
      let seatNo = 1;
      for (let r = 1; r <= 10; r++) {
        // Left Window
        seats.push({
          id: `S${seatNo}`,
          number: `${seatNo}`,
          type: 'window',
          isBooked: seatNo === 4 || seatNo === 9 || seatNo === 18 || seatNo === 25,
          isLadiesReserved: seatNo <= 6,
          price: baseFare
        });
        seatNo++;
        // Left Aisle
        seats.push({
          id: `S${seatNo}`,
          number: `${seatNo}`,
          type: 'aisle',
          isBooked: seatNo === 10 || seatNo === 14,
          isLadiesReserved: seatNo <= 6,
          price: baseFare
        });
        seatNo++;
        // Right Aisle
        seats.push({
          id: `S${seatNo}`,
          number: `${seatNo}`,
          type: 'aisle',
          isBooked: seatNo === 7 || seatNo === 23,
          isLadiesReserved: false,
          price: baseFare
        });
        seatNo++;
        // Right Window
        seats.push({
          id: `S${seatNo}`,
          number: `${seatNo}`,
          type: 'window',
          isBooked: seatNo === 12 || seatNo === 28 || seatNo === 36,
          isLadiesReserved: false,
          price: baseFare
        });
        seatNo++;
      }
      // Rear Row (5 seats)
      for (let b = 1; b <= 5; b++) {
        seats.push({
          id: `S${seatNo}`,
          number: `${seatNo}`,
          type: b === 1 || b === 5 ? 'window' : b === 3 ? 'middle' : 'aisle',
          isBooked: b === 2,
          isLadiesReserved: false,
          price: baseFare - 30
        });
        seatNo++;
      }
      return seats;
    }

    // 2x3 Layout (Karnataka Sarige Express / Feeder)
    let sNum = 1;
    for (let r = 1; r <= 10; r++) {
      // Left 2 seats
      seats.push({
        id: `S${sNum}`,
        number: `${sNum}`,
        type: 'window',
        isBooked: sNum % 6 === 0,
        isLadiesReserved: sNum <= 10,
        price: baseFare
      });
      sNum++;
      seats.push({
        id: `S${sNum}`,
        number: `${sNum}`,
        type: 'aisle',
        isBooked: sNum % 8 === 0,
        isLadiesReserved: sNum <= 10,
        price: baseFare
      });
      sNum++;

      // Right 3 seats
      seats.push({
        id: `S${sNum}`,
        number: `${sNum}`,
        type: 'aisle',
        isBooked: sNum % 7 === 0,
        isLadiesReserved: sNum <= 10,
        price: baseFare
      });
      sNum++;
      seats.push({
        id: `S${sNum}`,
        number: `${sNum}`,
        type: 'middle',
        isBooked: sNum % 9 === 0,
        isLadiesReserved: false,
        price: baseFare
      });
      sNum++;
      seats.push({
        id: `S${sNum}`,
        number: `${sNum}`,
        type: 'window',
        isBooked: sNum % 5 === 0,
        isLadiesReserved: false,
        price: baseFare
      });
      sNum++;
    }
    return seats;
  }, [schedule]);

  const displayedSeats = useMemo(() => {
    if (schedule.seatLayoutType === 'sleeper') {
      return allSeats.filter((s) => s.berth === activeDeck);
    }
    return allSeats;
  }, [allSeats, schedule.seatLayoutType, activeDeck]);

  const availableCount = allSeats.filter((s) => !s.isBooked).length;
  const ladiesCount = allSeats.filter((s) => s.isLadiesReserved && !s.isBooked).length;

  return (
    <div className="space-y-4">
      {/* Bus Header Controls & Deck Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lang === 'kn' ? 'ಆಸನ ವಿನ್ಯಾಸ & ಆಯ್ಕೆ' : 'Cabin Layout & Seat Selection'}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {schedule.seatLayoutType.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'kn'
              ? 'ನಿಮ್ಮ ಆಸನದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ. ಗರಿಷ್ಠ 6 ಆಸನಗಳನ್ನು ಕಾಯ್ದಿರಿಸಬಹುದು.'
              : 'Click any available seat to select. Up to 6 passengers per booking.'}
          </p>
        </div>

        {/* Sleeper Deck Toggle Tabs */}
        {schedule.seatLayoutType === 'sleeper' && (
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveDeck('lower')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDeck === 'lower'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'kn' ? 'ಕೆಳ ಡೆಕ್ (Lower)' : 'Lower Deck'}</span>
            </button>
            <button
              onClick={() => setActiveDeck('upper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDeck === 'upper'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'kn' ? 'ಮೇಲಿನ ಡೆಕ್ (Upper)' : 'Upper Deck'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Realistic Bus Chassis Container */}
      <div className="relative mx-auto max-w-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-950 p-4 sm:p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-inner">
        {/* Front Bus Chassis (Windshield, Driver Cockpit & Entrance) */}
        <div className="relative pb-6 mb-5 border-b-2 border-dashed border-slate-300 dark:border-slate-700">
          {/* Curved Bus Windshield Bar */}
          <div className="h-2 rounded-full bg-slate-300 dark:bg-slate-700 mb-4 mx-6 shadow-sm" />

          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            {/* Passenger Entrance on Left (Indian RHD Bus Standard) */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-8 rounded border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[9px] font-black text-emerald-700 dark:text-emerald-300">
                DOOR
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase">
                {lang === 'kn' ? 'ಪ್ರವೇಶ ದ್ವಾರ' : 'Entrance Steps'}
              </span>
            </div>

            {/* Driver Cockpit on Right */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-slate-600 dark:text-slate-300">
                {lang === 'kn' ? 'ಚಾಲಕರ ಕ್ಯಾಬಿನ್' : 'Driver Cabin'}
              </span>
              <div className="w-8 h-8 rounded-full border-2 border-slate-400 dark:border-slate-600 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm" title="Driver Steering Wheel">
                <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 dark:bg-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Bus Layout Render */}
        {schedule.seatLayoutType === 'sleeper' ? (
          /* Sleeper Layout (Single Berth Left, Walking Aisle, Double Berth Right) */
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-1">
              {activeDeck === 'lower' ? 'Lower Deck Berths (1 - 18)' : 'Upper Deck Berths (1 - 18)'}
            </div>

            {/* Render 6 sleeper rows */}
            {Array.from({ length: 6 }).map((_, rowIdx) => {
              const singleBerth = displayedSeats.find((s) => s.number === `${activeDeck === 'lower' ? 'L' : 'U'}${rowIdx * 3 + 1}`);
              const aisleBerth = displayedSeats.find((s) => s.number === `${activeDeck === 'lower' ? 'L' : 'U'}${rowIdx * 3 + 2}`);
              const winBerth = displayedSeats.find((s) => s.number === `${activeDeck === 'lower' ? 'L' : 'U'}${rowIdx * 3 + 3}`);

              return (
                <div key={rowIdx} className="flex items-center justify-between gap-3">
                  {/* Left: Single Window Sleeper Berth */}
                  <div className="w-24 sm:w-28 shrink-0">
                    {singleBerth && renderBerth(singleBerth)}
                  </div>

                  {/* Central Walking Corridor */}
                  <div className="flex-1 flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono tracking-widest border-y border-dashed border-slate-200 dark:border-slate-800 py-1">
                    <span className="opacity-40">AISLE</span>
                  </div>

                  {/* Right: Double Sleeper Berths (Aisle & Window) */}
                  <div className="flex items-center gap-2 w-48 sm:w-56 shrink-0 justify-end">
                    {aisleBerth && renderBerth(aisleBerth)}
                    {winBerth && renderBerth(winBerth)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : schedule.seatLayoutType === '2x2' ? (
          /* 2x2 Luxury Layout (Left 2 seats, Central Aisle, Right 2 seats) */
          <div className="space-y-2.5">
            {Array.from({ length: 10 }).map((_, rIdx) => {
              const seat1 = displayedSeats[rIdx * 4];
              const seat2 = displayedSeats[rIdx * 4 + 1];
              const seat3 = displayedSeats[rIdx * 4 + 2];
              const seat4 = displayedSeats[rIdx * 4 + 3];

              return (
                <div key={rIdx} className="flex items-center justify-between gap-2 sm:gap-3">
                  {/* Left Pair (Window & Aisle) */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {seat1 && renderSeater(seat1)}
                    {seat2 && renderSeater(seat2)}
                  </div>

                  {/* Central Aisle */}
                  <div className="flex-1 flex justify-center text-[10px] text-slate-300 dark:text-slate-700 font-mono select-none">
                    •
                  </div>

                  {/* Right Pair (Aisle & Window) */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {seat3 && renderSeater(seat3)}
                    {seat4 && renderSeater(seat4)}
                  </div>
                </div>
              );
            })}

            {/* Back Row (5 seats) */}
            <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                {displayedSeats.slice(40, 45).map((seat) => (
                  <div key={seat.id} className="flex-1">
                    {renderSeater(seat)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 2x3 Ordinary / Express Layout */
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, rIdx) => {
              const rowSeats = displayedSeats.slice(rIdx * 5, rIdx * 5 + 5);
              const left2 = rowSeats.slice(0, 2);
              const right3 = rowSeats.slice(2, 5);

              return (
                <div key={rIdx} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {left2.map((s) => renderSeater(s, 'compact'))}
                  </div>
                  <div className="flex-1 flex justify-center text-[9px] text-slate-300 dark:text-slate-700 font-mono">
                    |
                  </div>
                  <div className="flex items-center gap-1.5">
                    {right3.map((s) => renderSeater(s, 'compact'))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bus Rear Outline */}
        <div className="mt-5 pt-3 border-t-2 border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {lang === 'kn' ? 'ಬಸ್ ಹಿಂಭಾಗ' : 'Bus Rear / Emergency Exit'}
        </div>
      </div>

      {/* Seat Interactive Legend */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-around gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{lang === 'kn' ? 'ಲಭ್ಯವಿದೆ' : 'Available'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold">{lang === 'kn' ? 'ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ' : 'Selected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Lock className="w-3 h-3" />
          </div>
          <span className="text-slate-500 font-semibold">{lang === 'kn' ? 'ಬುಕ್ ಆಗಿದೆ' : 'Booked'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-pink-100 dark:bg-pink-950/60 border-2 border-pink-400 text-pink-700 dark:text-pink-300 flex items-center justify-center text-[10px] font-black">
            ♀
          </div>
          <span className="text-pink-700 dark:text-pink-300 font-bold">{lang === 'kn' ? 'ಮಹಿಳೆಯರಿಗೆ ಮೀಸಲು (ಶಕ್ತಿ)' : 'Ladies Reserved'}</span>
        </div>
      </div>

      {/* Selected Seats Summary Bar */}
      {selectedSeats.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div>
            <div className="text-xs font-black text-red-900 dark:text-red-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{lang === 'kn' ? 'ಆಯ್ಕೆಮಾಡಿದ ಆಸನಗಳು' : 'Your Selected Seats'}:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {selectedSeats.map((sNum) => {
                const sObj = allSeats.find((s) => s.number === sNum);
                return (
                  <span
                    key={sNum}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs shadow-sm"
                  >
                    <span>{sNum}</span>
                    <span className="text-[10px] text-red-200">({sObj?.type || 'seat'})</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">
              {lang === 'kn' ? 'ಒಟ್ಟು ಆಸನಗಳು' : 'Seats Total'} ({selectedSeats.length})
            </div>
            <div className="text-lg font-black text-red-800 dark:text-red-100 font-mono mt-0.5">
              ₹{selectedSeats.reduce((acc, sNum) => {
                const sObj = allSeats.find((s) => s.number === sNum);
                return acc + (sObj?.price || schedule.fare);
              }, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to render individual seater chair
  function renderSeater(seat: Seat, size: 'normal' | 'compact' = 'normal') {
    const isSelected = selectedSeats.includes(seat.number);

    return (
      <button
        key={seat.id}
        onClick={() => onToggleSeat(seat)}
        disabled={seat.isBooked}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        className={`relative rounded-xl border-2 transition-all flex flex-col items-center justify-center font-bold cursor-pointer select-none ${
          size === 'compact' ? 'w-10 sm:w-11 h-12' : 'w-11 sm:w-13 h-14'
        } ${
          seat.isBooked
            ? 'bg-slate-200 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-red-600 border-red-700 text-white shadow-md shadow-red-600/30 scale-105 z-10'
            : seat.isLadiesReserved
            ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:border-pink-500 hover:scale-102'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-red-400 hover:scale-102'
        }`}
        title={`Seat ${seat.number} (${seat.type}) - ₹${seat.price}${seat.isLadiesReserved ? ' [Ladies Reserved]' : ''}`}
      >
        {/* Headrest contour */}
        <div className={`w-3/4 h-1.5 rounded-full mb-1 ${
          isSelected ? 'bg-white/40' : seat.isLadiesReserved ? 'bg-pink-300 dark:bg-pink-700' : 'bg-slate-200 dark:bg-slate-700'
        }`} />

        <span className="font-mono text-xs leading-none">{seat.number}</span>
        <span className="text-[9px] opacity-75 mt-0.5 font-normal leading-none">
          ₹{seat.price}
        </span>

        {/* Selected Checkmark Badge */}
        {isSelected && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-red-600 shadow flex items-center justify-center font-black text-[10px]">
            ✓
          </span>
        )}

        {/* Ladies Badge */}
        {seat.isLadiesReserved && !seat.isBooked && !isSelected && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">
            ♀
          </span>
        )}
      </button>
    );
  }

  // Helper to render individual sleeper berth
  function renderBerth(seat: Seat) {
    const isSelected = selectedSeats.includes(seat.number);

    return (
      <button
        key={seat.id}
        onClick={() => onToggleSeat(seat)}
        disabled={seat.isBooked}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        className={`relative w-full h-18 sm:h-20 rounded-xl border-2 transition-all p-1.5 flex flex-col justify-between font-bold cursor-pointer select-none ${
          seat.isBooked
            ? 'bg-slate-200 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-red-600 border-red-700 text-white shadow-md shadow-red-600/30 scale-102 z-10'
            : seat.isLadiesReserved
            ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:border-pink-500'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-red-400'
        }`}
        title={`Berth ${seat.number} (${seat.berth} deck, ${seat.type}) - ₹${seat.price}`}
      >
        {/* Pillow / Cushion Graphic at top */}
        <div className="flex items-center justify-between">
          <div className={`w-8 h-3 rounded-md ${
            isSelected ? 'bg-white/40' : seat.isLadiesReserved ? 'bg-pink-300 dark:bg-pink-700' : 'bg-slate-200 dark:bg-slate-700'
          }`} />
          <span className="text-[9px] uppercase font-mono tracking-tight opacity-75">
            {seat.type === 'single' ? 'Single' : seat.type === 'window' ? 'Win' : 'Aisle'}
          </span>
        </div>

        {/* Center Berth Label */}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-mono text-xs sm:text-sm font-black">{seat.number}</span>
          <span className="text-[10px] font-bold font-mono">₹{seat.price}</span>
        </div>

        {/* Badges */}
        {isSelected && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-red-600 shadow flex items-center justify-center font-black text-[10px]">
            ✓
          </span>
        )}
        {seat.isLadiesReserved && !seat.isBooked && !isSelected && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px] font-black">
            ♀
          </span>
        )}
      </button>
    );
  }
};
