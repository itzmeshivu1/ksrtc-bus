import { Seat, BusCategory } from '../types';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance in km or meters
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimated walking time assuming ~4.8 km/h pace
 */
export function estimateWalkingTimeMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 4.8) * 60));
}

/**
 * Generate seat layout for bus based on category and configuration
 */
export function generateBusSeats(layoutType: '2x2' | '2x3' | 'sleeper', basePrice: number): Seat[] {
  const seats: Seat[] = [];
  
  if (layoutType === 'sleeper') {
    // 30 to 36 berths (Lower & Upper, 1+2 layout)
    // Left: single sleeper L1, U1; Right: double sleeper L2, L3, U2, U3
    const rows = 6;
    let seatNum = 1;
    for (let r = 1; r <= rows; r++) {
      // Lower single
      seats.push({
        id: `L${seatNum}`,
        number: `L${seatNum}`,
        berth: 'lower',
        type: 'single',
        isBooked: r === 2 || r === 4,
        isLadiesReserved: r === 1,
        price: basePrice + 100
      });
      seatNum++;

      // Lower double window & aisle
      seats.push({
        id: `L${seatNum}`,
        number: `L${seatNum}`,
        berth: 'lower',
        type: 'aisle',
        isBooked: r === 3,
        isLadiesReserved: r <= 2,
        price: basePrice
      });
      seatNum++;
      seats.push({
        id: `L${seatNum}`,
        number: `L${seatNum}`,
        berth: 'lower',
        type: 'window',
        isBooked: r === 1 || r === 5,
        isLadiesReserved: r <= 2,
        price: basePrice + 50
      });
      seatNum++;

      // Upper single
      seats.push({
        id: `U${seatNum}`,
        number: `U${seatNum}`,
        berth: 'upper',
        type: 'single',
        isBooked: r === 3,
        isLadiesReserved: false,
        price: basePrice + 80
      });
      seatNum++;

      // Upper double
      seats.push({
        id: `U${seatNum}`,
        number: `U${seatNum}`,
        berth: 'upper',
        type: 'aisle',
        isBooked: r === 6,
        isLadiesReserved: false,
        price: basePrice - 20
      });
      seatNum++;
      seats.push({
        id: `U${seatNum}`,
        number: `U${seatNum}`,
        berth: 'upper',
        type: 'window',
        isBooked: false,
        isLadiesReserved: false,
        price: basePrice + 40
      });
      seatNum++;
    }
    return seats;
  }

  // 2x2 Semi-Deluxe / Luxury (e.g. Airavat / Rajahamsa)
  if (layoutType === '2x2') {
    const rows = 11;
    let seatNum = 1;
    for (let r = 1; r <= rows; r++) {
      // Left window
      seats.push({
        id: `S${seatNum}`,
        number: `${seatNum}`,
        type: 'window',
        isBooked: seatNum % 5 === 0 || seatNum % 7 === 0,
        isLadiesReserved: r <= 2,
        price: basePrice
      });
      seatNum++;

      // Left aisle
      seats.push({
        id: `S${seatNum}`,
        number: `${seatNum}`,
        type: 'aisle',
        isBooked: seatNum % 4 === 0,
        isLadiesReserved: r <= 2,
        price: basePrice
      });
      seatNum++;

      // Right aisle
      seats.push({
        id: `S${seatNum}`,
        number: `${seatNum}`,
        type: 'aisle',
        isBooked: seatNum % 6 === 0,
        isLadiesReserved: false,
        price: basePrice
      });
      seatNum++;

      // Right window
      seats.push({
        id: `S${seatNum}`,
        number: `${seatNum}`,
        type: 'window',
        isBooked: seatNum % 3 === 0,
        isLadiesReserved: false,
        price: basePrice
      });
      seatNum++;
    }
    return seats;
  }

  // 2x3 Ordinary / Sarige
  const rows = 10;
  let seatNum = 1;
  for (let r = 1; r <= rows; r++) {
    // Left side (2 seats)
    seats.push({
      id: `S${seatNum}`,
      number: `${seatNum}`,
      type: 'window',
      isBooked: seatNum % 5 === 0,
      isLadiesReserved: r <= 3,
      price: basePrice
    });
    seatNum++;
    seats.push({
      id: `S${seatNum}`,
      number: `${seatNum}`,
      type: 'aisle',
      isBooked: seatNum % 4 === 0,
      isLadiesReserved: r <= 3,
      price: basePrice
    });
    seatNum++;

    // Right side (3 seats: aisle, middle, window)
    seats.push({
      id: `S${seatNum}`,
      number: `${seatNum}`,
      type: 'aisle',
      isBooked: seatNum % 3 === 0,
      isLadiesReserved: false,
      price: basePrice
    });
    seatNum++;
    seats.push({
      id: `S${seatNum}`,
      number: `${seatNum}`,
      type: 'middle',
      isBooked: false,
      isLadiesReserved: false,
      price: basePrice
    });
    seatNum++;
    seats.push({
      id: `S${seatNum}`,
      number: `${seatNum}`,
      type: 'window',
      isBooked: seatNum % 7 === 0,
      isLadiesReserved: false,
      price: basePrice
    });
    seatNum++;
  }

  return seats;
}

/**
 * Generates an SVG QR code pattern string for tickets
 */
export function generateSvgQrPattern(text: string, size = 120): string {
  // Deterministic matrix generator based on string hash
  const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);
  const grid = 21; // 21x21 QR standard matrix
  const moduleSize = size / grid;
  
  let rects = '';
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Corner positioning markers
      const isCorner1 = r < 7 && c < 7;
      const isCorner2 = r < 7 && c >= grid - 7;
      const isCorner3 = r >= grid - 7 && c < 7;
      
      let isDark = false;
      if (isCorner1 || isCorner2 || isCorner3) {
        // Find outer rim or inner center of finder patterns
        const localR = isCorner3 ? r - (grid - 7) : r;
        const localC = isCorner2 ? c - (grid - 7) : c;
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) isDark = true;
        else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) isDark = true;
      } else {
        // Pseudo-random deterministic fill based on coordinate and text hash
        const cellHash = (hash * (r + 1) * 17 + c * 37 + (r ^ c)) % 100;
        isDark = cellHash < 44;
      }

      if (isDark) {
        rects += `<rect x="${c * moduleSize}" y="${r * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="rounded bg-white p-1 shadow-sm">${rects}</svg>`;
}

export function getCategoryBadgeClass(category: BusCategory): {
  badge: string;
  dot: string;
  tag: string;
} {
  switch (category) {
    case 'EV Power Plus':
      return {
        badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        tag: 'Electric AC Superfast'
      };
    case 'Airavat Club Class':
      return {
        badge: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        dot: 'bg-sky-500',
        tag: 'Volvo Multi-Axle AC'
      };
    case 'Ambari Dream Class':
    case 'Ambari Utsav':
      return {
        badge: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
        tag: 'Premium Volvo Sleeper'
      };
    case 'Rajahamsa Executive':
      return {
        badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        tag: 'Executive Pushback'
      };
    case 'Karnataka Sarige':
    default:
      return {
        badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-600',
        tag: 'State Express Sarige'
      };
  }
}
