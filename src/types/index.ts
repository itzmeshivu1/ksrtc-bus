export type Language = 'en' | 'kn';

export type BusCategory = 
  | 'Karnataka Sarige'
  | 'Rajahamsa Executive'
  | 'Airavat Club Class'
  | 'Ambari Dream Class'
  | 'Ambari Utsav'
  | 'Non-AC Sleeper'
  | 'EV Power Plus';

export interface District {
  id: string;
  nameEn: string;
  nameKn: string;
  code: string;
  hq: string;
}

export interface Taluk {
  id: string;
  districtId: string;
  nameEn: string;
  nameKn: string;
}

export interface Hobli {
  id: string;
  talukId: string;
  nameEn: string;
  nameKn: string;
}

export interface Village {
  id: string;
  hobliId: string;
  talukId: string;
  districtId: string;
  nameEn: string;
  nameKn: string;
  nearestBusStopId: string;
  distanceToNearestStandKm: number;
  regularServices: string[];
  firstBus: string;
  lastBus: string;
  lat: number;
  lng: number;
}

export interface BusStop {
  id: string;
  nameEn: string;
  nameKn: string;
  districtId: string;
  talukId?: string;
  isMajorStation: boolean;
  stationType: 'Central' | 'Suburb' | 'Terminal' | 'Depot' | 'Rural Stop';
  lat: number;
  lng: number;
  addressEn: string;
  addressKn: string;
  platformBays?: number;
  amenities?: string[];
}

export interface RouteStop {
  stopId: string;
  stopNameEn: string;
  stopNameKn: string;
  distanceFromStartKm: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  bayNumber?: string;
  lat: number;
  lng: number;
}

export interface KSRTCRoute {
  id: string;
  routeNumber: string;
  routeNameEn: string;
  routeNameKn: string;
  sourceStopId: string;
  destinationStopId: string;
  sourceNameEn: string;
  sourceNameKn: string;
  destNameEn: string;
  destNameKn: string;
  category: BusCategory;
  totalDistanceKm: number;
  durationMinutes: number;
  fare: number;
  stops: RouteStop[];
  viaCities: string[];
  villageId?: string;
  villageNameEn?: string;
  villageNameKn?: string;
}

export interface BusSchedule {
  id: string;
  routeId: string;
  busNumber: string; // e.g. KA-01-F-9421
  fleetNumber: string; // e.g. KSRTC-BLR-421
  category: BusCategory;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  ladiesReservedSeats: number;
  seatLayoutType: '2x2' | '2x3' | 'sleeper';
  hasAC: boolean;
  hasCharging: boolean;
  hasWaterBottle: boolean;
  hasWiFi: boolean;
  hasBlanket: boolean;
  driverName: string;
  conductorName: string;
  depot: string;
  isVillageService?: boolean;
  villageNameEn?: string;
  villageNameKn?: string;
}

export interface LiveBusTracking {
  busNumber: string;
  fleetNumber: string;
  routeId: string;
  routeNumber: string;
  routeNameEn: string;
  routeNameKn: string;
  category: BusCategory;
  currentLat: number;
  currentLng: number;
  bearing: number; // 0-360 degrees
  speedKmh: number;
  nextStopId: string;
  nextStopNameEn: string;
  nextStopNameKn: string;
  distanceToNextStopKm: number;
  estimatedArrivalNextStopMinutes: number;
  currentSegmentIndex: number;
  delayMinutes: number; // 0 = on time, positive = delayed, negative = early
  lastUpdatedSecondsAgo: number;
  isGpsLive: boolean; // true = AIS-140 live GPS, false = estimated schedule
  driverPhone: string;
  destinationNameEn: string;
  destinationNameKn: string;
  isVillageBus?: boolean;
  villageNameEn?: string;
  villageNameKn?: string;
}

export interface Seat {
  id: string;
  number: string;
  berth?: 'lower' | 'upper';
  type: 'window' | 'aisle' | 'single' | 'middle';
  isBooked: boolean;
  isLadiesReserved: boolean;
  price: number;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
}

export interface Booking {
  id: string;
  pnrNumber: string;
  ticketNumber: string;
  scheduleId: string;
  routeId: string;
  routeNameEn: string;
  routeNameKn: string;
  busNumber: string;
  category: BusCategory;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  boardingStop: string;
  droppingStop: string;
  bayNumber: string;
  seats: string[];
  passengers: Passenger[];
  contactMobile: string;
  contactEmail: string;
  baseFare: number;
  gstAmount: number;
  tollFee: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  paymentTransactionId: string;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
  qrPayload: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  isLoggedIn: boolean;
  favoriteRoutes: string[];
  savedStops: string[];
  savedLocations: {
    label: string;
    stopName: string;
  }[];
  notificationPreferences: {
    busApproachingAlert: boolean;
    bookingSms: boolean;
    scheduleChanges: boolean;
  };
}
