import { KSRTCRoute, BusSchedule, LiveBusTracking, BusCategory } from '../types';

export const KSRTC_ROUTES: KSRTCRoute[] = [
  {
    id: 'route_blr_mys_101',
    routeNumber: '101-EXP',
    routeNameEn: 'Bengaluru (Majestic) ⇄ Mysuru Suburb (Via Expressway)',
    routeNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್) ⇄ ಮೈಸೂರು ಉಪನಗರ (ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ ಮೂಲಕ)',
    sourceStopId: 'stop_kbs_majestic',
    destinationStopId: 'stop_mysuru_suburb',
    sourceNameEn: 'Bengaluru (Majestic)',
    sourceNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
    destNameEn: 'Mysuru Suburb Stand',
    destNameKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ',
    category: 'EV Power Plus',
    totalDistanceKm: 145,
    durationMinutes: 165,
    fare: 320,
    viaCities: ['Satellite MCTC', 'Ramanagara', 'Channapatna', 'Maddur', 'Mandya', 'Srirangapatna'],
    stops: [
      {
        stopId: 'stop_kbs_majestic',
        stopNameEn: 'Bengaluru (Majestic T1)',
        stopNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
        distanceFromStartKm: 0,
        scheduledArrival: '07:00 AM',
        scheduledDeparture: '07:15 AM',
        bayNumber: 'Bay 14',
        lat: 12.9784,
        lng: 77.5714
      },
      {
        stopId: 'stop_mctc_satellite',
        stopNameEn: 'MCTC Satellite Bus Station',
        stopNameKn: 'ಎಂಸಿಟಿಸಿ ಸ್ಯಾಟಲೈಟ್ ಬಸ್ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 9,
        scheduledArrival: '07:35 AM',
        scheduledDeparture: '07:40 AM',
        bayNumber: 'Bay 04',
        lat: 12.9515,
        lng: 77.5442
      },
      {
        stopId: 'stop_ramanagara_stand',
        stopNameEn: 'Ramanagara Bypass',
        stopNameKn: 'ರಾಮನಗರ ಬೈಪಾಸ್',
        distanceFromStartKm: 48,
        scheduledArrival: '08:20 AM',
        scheduledDeparture: '08:25 AM',
        bayNumber: 'Bay 02',
        lat: 12.7214,
        lng: 77.2801
      },
      {
        stopId: 'stop_channapatna_stand',
        stopNameEn: 'Channapatna Bus Stand',
        stopNameKn: 'ಚನ್ನಪಟ್ಟಣ ಬಸ್ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 60,
        scheduledArrival: '08:40 AM',
        scheduledDeparture: '08:45 AM',
        bayNumber: 'Bay 01',
        lat: 12.6517,
        lng: 77.2064
      },
      {
        stopId: 'stop_maddur_stand',
        stopNameEn: 'Maddur (Shivalli Cross)',
        stopNameKn: 'ಮದ್ದೂರು (ಶಿವಳ್ಳಿ ಕ್ರಾಸ್)',
        distanceFromStartKm: 80,
        scheduledArrival: '09:05 AM',
        scheduledDeparture: '09:10 AM',
        bayNumber: 'Bay 03',
        lat: 12.5841,
        lng: 77.0452
      },
      {
        stopId: 'stop_mandya_central',
        stopNameEn: 'Mandya KSRTC Bus Stand',
        stopNameKn: 'ಮಂಡ್ಯ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 100,
        scheduledArrival: '09:30 AM',
        scheduledDeparture: '09:35 AM',
        bayNumber: 'Bay 07',
        lat: 12.5238,
        lng: 76.8967
      },
      {
        stopId: 'stop_srirangapatna_stand',
        stopNameEn: 'Srirangapatna Toll / Temple Gate',
        stopNameKn: 'ಶ್ರೀರಂಗಪಟ್ಟಣ ಟೋಲ್ ಗೇಟ್',
        distanceFromStartKm: 128,
        scheduledArrival: '10:00 AM',
        scheduledDeparture: '10:05 AM',
        bayNumber: 'Bay 02',
        lat: 12.4239,
        lng: 76.6946
      },
      {
        stopId: 'stop_mysuru_suburb',
        stopNameEn: 'Mysuru Suburb KSRTC Stand',
        stopNameKn: 'ಮೈಸೂರು ಉಪನಗರ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 145,
        scheduledArrival: '10:30 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Bay 12',
        lat: 12.3117,
        lng: 76.6579
      }
    ]
  },
  {
    id: 'route_blr_mng_204',
    routeNumber: '204-AIR',
    routeNameEn: 'Bengaluru (Satellite) ⇄ Mangaluru (Bejai)',
    routeNameKn: 'ಬೆಂಗಳೂರು (ಸ್ಯಾಟಲೈಟ್) ⇄ ಮಂಗಳೂರು (ಬಿಜೈ)',
    sourceStopId: 'stop_mctc_satellite',
    destinationStopId: 'stop_mangaluru_bejai',
    sourceNameEn: 'Bengaluru (Satellite MCTC)',
    sourceNameKn: 'ಬೆಂಗಳೂರು (ಸ್ಯಾಟಲೈಟ್)',
    destNameEn: 'Mangaluru KSRTC (Bejai)',
    destNameKn: 'ಮಂಗಳೂರು (ಬಿಜೈ)',
    category: 'Airavat Club Class',
    totalDistanceKm: 352,
    durationMinutes: 440,
    fare: 840,
    viaCities: ['Kunigal', 'Channarayapatna', 'Hassan', 'Sakleshpur', 'Uppinangady', 'Bantwal'],
    stops: [
      {
        stopId: 'stop_mctc_satellite',
        stopNameEn: 'Bengaluru Satellite MCTC',
        stopNameKn: 'ಬೆಂಗಳೂರು ಸ್ಯಾಟಲೈಟ್ ಎಂಸಿಟಿಸಿ',
        distanceFromStartKm: 0,
        scheduledArrival: '09:00 PM',
        scheduledDeparture: '09:30 PM',
        bayNumber: 'Bay 18',
        lat: 12.9515,
        lng: 77.5442
      },
      {
        stopId: 'stop_shirishraguppa',
        stopNameEn: 'Channarayapatna Bypass',
        stopNameKn: 'ಚನ್ನರಾಯಪಟ್ಟಣ ಬೈಪಾಸ್',
        distanceFromStartKm: 145,
        scheduledArrival: '11:45 PM',
        scheduledDeparture: '11:55 PM',
        bayNumber: 'Bay 02',
        lat: 12.9069,
        lng: 76.3887
      },
      {
        stopId: 'stop_hassan_central',
        stopNameEn: 'Hassan Central Stand',
        stopNameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 185,
        scheduledArrival: '12:35 AM',
        scheduledDeparture: '12:50 AM',
        bayNumber: 'Bay 05',
        lat: 13.0033,
        lng: 76.1004
      },
      {
        stopId: 'stop_sakleshpur_stand',
        stopNameEn: 'Sakleshpur Ghat Entry',
        stopNameKn: 'ಸಕಲೇಶಪುರ ಘಾಟ್ ಪ್ರವೇಶ',
        distanceFromStartKm: 225,
        scheduledArrival: '01:40 AM',
        scheduledDeparture: '01:50 AM',
        bayNumber: 'Bay 01',
        lat: 12.9438,
        lng: 75.7871
      },
      {
        stopId: 'stop_mangaluru_bejai',
        stopNameEn: 'Mangaluru KSRTC Bejai Stand',
        stopNameKn: 'ಮಂಗಳೂರು ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಬಿಜೈ',
        distanceFromStartKm: 352,
        scheduledArrival: '05:00 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Bay 08',
        lat: 12.8837,
        lng: 74.8436
      }
    ]
  },
  {
    id: 'route_blr_bel_315',
    routeNumber: '315-AMB',
    routeNameEn: 'Bengaluru (Majestic) ⇄ Belagavi (Via Hubballi)',
    routeNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್) ⇄ ಬೆಳಗಾವಿ (ಹುಬ್ಬಳ್ಳಿ ಮೂಲಕ)',
    sourceStopId: 'stop_kbs_majestic',
    destinationStopId: 'stop_belagavi_central',
    sourceNameEn: 'Bengaluru (Majestic)',
    sourceNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
    destNameEn: 'Belagavi Central (CBT)',
    destNameKn: 'ಬೆಳಗಾವಿ ಸಿಬಿಟಿ',
    category: 'Ambari Dream Class',
    totalDistanceKm: 508,
    durationMinutes: 520,
    fare: 1180,
    viaCities: ['Tumakuru', 'Sira', 'Chitradurga', 'Davanagere', 'Haveri', 'Hubballi', 'Dharwad'],
    stops: [
      {
        stopId: 'stop_kbs_majestic',
        stopNameEn: 'Bengaluru (Majestic T1)',
        stopNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
        distanceFromStartKm: 0,
        scheduledArrival: '10:00 PM',
        scheduledDeparture: '10:30 PM',
        bayNumber: 'Bay 22',
        lat: 12.9784,
        lng: 77.5714
      },
      {
        stopId: 'stop_tumakuru_stand',
        stopNameEn: 'Tumakuru KSRTC Stand',
        stopNameKn: 'ತುಮಕೂರು ಬಸ್ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 70,
        scheduledArrival: '11:45 PM',
        scheduledDeparture: '11:55 PM',
        bayNumber: 'Bay 06',
        lat: 13.3422,
        lng: 77.1017
      },
      {
        stopId: 'stop_hubballi_central',
        stopNameEn: 'Hubballi Old/New Stand',
        stopNameKn: 'ಹುಬ್ಬಳ್ಳಿ ಬಸ್ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 410,
        scheduledArrival: '04:30 AM',
        scheduledDeparture: '04:45 AM',
        bayNumber: 'Bay 15',
        lat: 15.3524,
        lng: 75.1481
      },
      {
        stopId: 'stop_belagavi_central',
        stopNameEn: 'Belagavi Central CBT',
        stopNameKn: 'ಬೆಳಗಾವಿ ಸಿಬಿಟಿ',
        distanceFromStartKm: 508,
        scheduledArrival: '06:30 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Bay 03',
        lat: 15.8643,
        lng: 74.5085
      }
    ]
  },
  {
    id: 'route_mys_kdg_412',
    routeNumber: '412-SAR',
    routeNameEn: 'Mysuru Suburb ⇄ Madikeri (Coorg)',
    routeNameKn: 'ಮೈಸೂರು ಉಪನಗರ ⇄ ಮಡಿಕೇರಿ (ಕೊಡಗು)',
    sourceStopId: 'stop_mysuru_suburb',
    destinationStopId: 'stop_madikeri_stand',
    sourceNameEn: 'Mysuru Suburb Stand',
    sourceNameKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ',
    destNameEn: 'Madikeri KSRTC Stand',
    destNameKn: 'ಮಡಿಕೇರಿ ಬಸ್ ನಿಲ್ದಾಣ',
    category: 'Rajahamsa Executive',
    totalDistanceKm: 120,
    durationMinutes: 180,
    fare: 240,
    viaCities: ['Bilikere', 'Hunsur', 'Periyapatna', 'Kushalnagar', 'Suntikoppa'],
    stops: [
      {
        stopId: 'stop_mysuru_suburb',
        stopNameEn: 'Mysuru Suburb Stand',
        stopNameKn: 'ಮೈಸೂರು ಉಪನಗರ',
        distanceFromStartKm: 0,
        scheduledArrival: '08:00 AM',
        scheduledDeparture: '08:15 AM',
        bayNumber: 'Bay 05',
        lat: 12.3117,
        lng: 76.6579
      },
      {
        stopId: 'stop_madikeri_stand',
        stopNameEn: 'Madikeri KSRTC Stand',
        stopNameKn: 'ಮಡಿಕೇರಿ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 120,
        scheduledArrival: '11:15 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Bay 02',
        lat: 12.4244,
        lng: 75.7382
      }
    ]
  },
  {
    id: 'route_blr_shv_508',
    routeNumber: '508-RAJ',
    routeNameEn: 'Bengaluru (Majestic) ⇄ Shivamogga',
    routeNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್) ⇄ ಶಿವಮೊಗ್ಗ',
    sourceStopId: 'stop_kbs_majestic',
    destinationStopId: 'stop_shivamogga_central',
    sourceNameEn: 'Bengaluru (Majestic)',
    sourceNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
    destNameEn: 'Shivamogga Central',
    destNameKn: 'ಶಿವಮೊಗ್ಗ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ',
    category: 'Rajahamsa Executive',
    totalDistanceKm: 275,
    durationMinutes: 330,
    fare: 460,
    viaCities: ['Tumakuru', 'Tiptur', 'Arsikere', 'Kadur', 'Bhadravathi'],
    stops: [
      {
        stopId: 'stop_kbs_majestic',
        stopNameEn: 'Bengaluru (Majestic)',
        stopNameKn: 'ಬೆಂಗಳೂರು (ಮೆಜೆಸ್ಟಿಕ್)',
        distanceFromStartKm: 0,
        scheduledArrival: '06:00 AM',
        scheduledDeparture: '06:30 AM',
        bayNumber: 'Bay 11',
        lat: 12.9784,
        lng: 77.5714
      },
      {
        stopId: 'stop_tumakuru_stand',
        stopNameEn: 'Tumakuru Stand',
        stopNameKn: 'ತುಮಕೂರು ನಿಲ್ದಾಣ',
        distanceFromStartKm: 70,
        scheduledArrival: '07:45 AM',
        scheduledDeparture: '07:55 AM',
        bayNumber: 'Bay 04',
        lat: 13.3422,
        lng: 77.1017
      },
      {
        stopId: 'stop_shivamogga_central',
        stopNameEn: 'Shivamogga Central',
        stopNameKn: 'ಶಿವಮೊಗ್ಗ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 275,
        scheduledArrival: '12:00 PM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Bay 09',
        lat: 13.9312,
        lng: 75.5684
      }
    ]
  },
  {
    id: 'route_mnd_shivalli_vil_01',
    routeNumber: 'GS-MND-12',
    routeNameEn: 'Mandya Stand ⇄ Shivalli Village Grama Sarige',
    routeNameKn: 'ಮಂಡ್ಯ ಬಸ್ ನಿಲ್ದಾಣ ⇄ ಶಿವಳ್ಳಿ ಗ್ರಾಮ ಸಾರಿಗೆ',
    sourceStopId: 'stop_mandya_central',
    destinationStopId: 'stop_mandya_central',
    sourceNameEn: 'Mandya KSRTC Central Stand',
    sourceNameKn: 'ಮಂಡ್ಯ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ',
    destNameEn: 'Shivalli Village Gram Panchayat',
    destNameKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯತಿ',
    category: 'Karnataka Sarige',
    totalDistanceKm: 18,
    durationMinutes: 35,
    fare: 35,
    viaCities: ['Mandya Town Circle', 'Guthalu Road', 'Shivalli Temple Gate'],
    villageId: 'vil_shivalli',
    villageNameEn: 'Shivalli Village',
    villageNameKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ',
    stops: [
      {
        stopId: 'stop_mandya_central',
        stopNameEn: 'Mandya KSRTC Bus Stand',
        stopNameKn: 'ಮಂಡ್ಯ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 0,
        scheduledArrival: '06:15 AM',
        scheduledDeparture: '06:30 AM',
        bayNumber: 'Rural Bay 03',
        lat: 12.5238,
        lng: 76.8967
      },
      {
        stopId: 'stop_shivalli_village_center',
        stopNameEn: 'Shivalli Grama Panchayat Stop',
        stopNameKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯತ್ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 9.4,
        scheduledArrival: '06:55 AM',
        scheduledDeparture: '07:05 AM',
        bayNumber: 'Village Shelter',
        lat: 12.5710,
        lng: 76.8450
      },
      {
        stopId: 'stop_mandya_central',
        stopNameEn: 'Mandya KSRTC Central Return',
        stopNameKn: 'ಮಂಡ್ಯ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ (ವಾಪಸ್)',
        distanceFromStartKm: 18,
        scheduledArrival: '07:35 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Rural Bay 03',
        lat: 12.5238,
        lng: 76.8967
      }
    ]
  },
  {
    id: 'route_has_halebidu_vil_02',
    routeNumber: 'GS-HAS-24',
    routeNameEn: 'Hassan Central ⇄ Halebidu Heritage Village Shuttle',
    routeNameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ⇄ ಹಳೇಬೀಡು ಗ್ರಾಮ ಶಟಲ್',
    sourceStopId: 'stop_hassan_central',
    destinationStopId: 'stop_hassan_central',
    sourceNameEn: 'Hassan KSRTC Central Stand',
    sourceNameKn: 'ಹಾಸನ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ',
    destNameEn: 'Halebidu Temple Complex',
    destNameKn: 'ಹಳೇಬೀಡು ದೇವಸ್ಥಾನ ಆವರಣ',
    category: 'Karnataka Sarige',
    totalDistanceKm: 31,
    durationMinutes: 50,
    fare: 60,
    viaCities: ['Hassan Dairy Circle', 'Dudda Cross', 'Halebidu Bazaar'],
    villageId: 'vil_halebidu',
    villageNameEn: 'Halebidu Heritage Village',
    villageNameKn: 'ಹಳೇಬೀಡು ಪರಂಪರೆ ಗ್ರಾಮ',
    stops: [
      {
        stopId: 'stop_hassan_central',
        stopNameEn: 'Hassan Central Stand',
        stopNameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 0,
        scheduledArrival: '07:30 AM',
        scheduledDeparture: '07:45 AM',
        bayNumber: 'Bay 08',
        lat: 13.0033,
        lng: 76.1004
      },
      {
        stopId: 'stop_halebidu_village',
        stopNameEn: 'Halebidu Village Bus Shelter',
        stopNameKn: 'ಹಳೇಬೀಡು ಗ್ರಾಮ ಬಸ್ ತಂಗುದಾಣ',
        distanceFromStartKm: 31,
        scheduledArrival: '08:35 AM',
        scheduledDeparture: '08:45 AM',
        bayNumber: 'Grama Shelter',
        lat: 13.2167,
        lng: 75.9922
      }
    ]
  },
  {
    id: 'route_blr_dharmasthala_vil_03',
    routeNumber: 'GS-BLR-DHA-90',
    routeNameEn: 'Bengaluru (Satellite) ⇄ Dharmasthala Kshetra Direct Sarige',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ ನೇರ ಸಾರಿಗೆ',
    sourceStopId: 'stop_mctc_satellite',
    destinationStopId: 'stop_mangaluru_bejai',
    sourceNameEn: 'Bengaluru Satellite MCTC',
    sourceNameKn: 'ಬೆಂಗಳೂರು ಸ್ಯಾಟಲೈಟ್ ಎಂಸಿಟಿಸಿ',
    destNameEn: 'Dharmasthala Rural Bus Terminal',
    destNameKn: 'ಧರ್ಮಸ್ಥಳ ಗ್ರಾಮೀಣ ಬಸ್ ಟರ್ಮಿನಲ್',
    category: 'Rajahamsa Executive',
    totalDistanceKm: 310,
    durationMinutes: 410,
    fare: 480,
    viaCities: ['Kunigal', 'Channarayapatna', 'Hassan', 'Sakleshpur', 'Dharmasthala Kshetra'],
    villageId: 'vil_dharmasthala',
    villageNameEn: 'Dharmasthala Kshetra',
    villageNameKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ',
    stops: [
      {
        stopId: 'stop_mctc_satellite',
        stopNameEn: 'Bengaluru Satellite MCTC',
        stopNameKn: 'ಬೆಂಗಳೂರು ಸ್ಯಾಟಲೈಟ್ ಎಂಸಿಟಿಸಿ',
        distanceFromStartKm: 0,
        scheduledArrival: '09:00 PM',
        scheduledDeparture: '09:30 PM',
        bayNumber: 'Bay 16',
        lat: 12.9515,
        lng: 77.5442
      },
      {
        stopId: 'stop_dharmasthala_kshetra',
        stopNameEn: 'Dharmasthala Kshetra Temple Stand',
        stopNameKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ ದೇವಸ್ಥಾನ ನಿಲ್ದಾಣ',
        distanceFromStartKm: 310,
        scheduledArrival: '05:30 AM',
        scheduledDeparture: 'Destination',
        bayNumber: 'Temple Bay 01',
        lat: 12.9550,
        lng: 75.3850
      }
    ]
  }
];

export const BUS_SCHEDULES: BusSchedule[] = [
  // Bengaluru -> Mysuru Schedule 1
  {
    id: 'sch_101_ev_01',
    routeId: 'route_blr_mys_101',
    busNumber: 'KA-01-F-9420',
    fleetNumber: 'KSRTC-EV-104',
    category: 'EV Power Plus',
    departureTime: '07:15 AM',
    arrivalTime: '10:00 AM',
    fare: 320,
    totalSeats: 43,
    availableSeats: 19,
    ladiesReservedSeats: 6,
    seatLayoutType: '2x2',
    hasAC: true,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: true,
    hasBlanket: false,
    driverName: 'Ramesh Gowda',
    conductorName: 'Manjunath B.S.',
    depot: 'Bengaluru Central Depot-4'
  },
  // Bengaluru -> Mysuru Schedule 2 (Airavat Club Class)
  {
    id: 'sch_101_air_02',
    routeId: 'route_blr_mys_101',
    busNumber: 'KA-01-F-8812',
    fleetNumber: 'KSRTC-ACC-812',
    category: 'Airavat Club Class',
    departureTime: '08:30 AM',
    arrivalTime: '11:15 AM',
    fare: 380,
    totalSeats: 47,
    availableSeats: 24,
    ladiesReservedSeats: 8,
    seatLayoutType: '2x2',
    hasAC: true,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: true,
    hasBlanket: true,
    driverName: 'Suresh Kumar',
    conductorName: 'Prakash K.',
    depot: 'Mysuru Rural Depot-1'
  },
  // Bengaluru -> Mysuru Schedule 3 (Karnataka Sarige Express)
  {
    id: 'sch_101_sar_03',
    routeId: 'route_blr_mys_101',
    busNumber: 'KA-09-F-5421',
    fleetNumber: 'KSRTC-SAR-542',
    category: 'Karnataka Sarige',
    departureTime: '09:00 AM',
    arrivalTime: '12:15 PM',
    fare: 185,
    totalSeats: 52,
    availableSeats: 11,
    ladiesReservedSeats: 12,
    seatLayoutType: '2x3',
    hasAC: false,
    hasCharging: false,
    hasWaterBottle: false,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Basavaraj Patil',
    conductorName: 'Govinda Raju',
    depot: 'Mandya Central Depot'
  },
  // Bengaluru -> Mangaluru (Night Service Airavat)
  {
    id: 'sch_204_air_01',
    routeId: 'route_blr_mng_204',
    busNumber: 'KA-19-F-7712',
    fleetNumber: 'KSRTC-ACC-771',
    category: 'Airavat Club Class',
    departureTime: '09:30 PM',
    arrivalTime: '05:00 AM',
    fare: 840,
    totalSeats: 47,
    availableSeats: 14,
    ladiesReservedSeats: 6,
    seatLayoutType: '2x2',
    hasAC: true,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: true,
    hasBlanket: true,
    driverName: 'Lokesh Shetty',
    conductorName: 'Dinesh Poojary',
    depot: 'Mangaluru Depot-1'
  },
  // Bengaluru -> Mangaluru (Ambari Dream Class AC Sleeper)
  {
    id: 'sch_204_amb_02',
    routeId: 'route_blr_mng_204',
    busNumber: 'KA-19-F-9901',
    fleetNumber: 'KSRTC-ADC-990',
    category: 'Ambari Dream Class',
    departureTime: '10:15 PM',
    arrivalTime: '05:45 AM',
    fare: 1120,
    totalSeats: 36,
    availableSeats: 7,
    ladiesReservedSeats: 4,
    seatLayoutType: 'sleeper',
    hasAC: true,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: true,
    hasBlanket: true,
    driverName: 'Santosh Naik',
    conductorName: 'Gurumurthy',
    depot: 'Mangaluru Depot-2'
  },
  // Bengaluru -> Belagavi (Ambari Utsav Premium)
  {
    id: 'sch_315_amb_01',
    routeId: 'route_blr_bel_315',
    busNumber: 'KA-22-F-6190',
    fleetNumber: 'KSRTC-UTS-619',
    category: 'Ambari Utsav',
    departureTime: '10:30 PM',
    arrivalTime: '06:30 AM',
    fare: 1350,
    totalSeats: 36,
    availableSeats: 9,
    ladiesReservedSeats: 4,
    seatLayoutType: 'sleeper',
    hasAC: true,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: true,
    hasBlanket: true,
    driverName: 'Mahadev Kulkarni',
    conductorName: 'Irappa Chougule',
    depot: 'Belagavi Division Depot'
  },
  // Mysuru -> Madikeri (Rajahamsa Executive)
  {
    id: 'sch_412_raj_01',
    routeId: 'route_mys_kdg_412',
    busNumber: 'KA-09-F-3388',
    fleetNumber: 'KSRTC-RAJ-338',
    category: 'Rajahamsa Executive',
    departureTime: '08:15 AM',
    arrivalTime: '11:15 AM',
    fare: 240,
    totalSeats: 40,
    availableSeats: 16,
    ladiesReservedSeats: 6,
    seatLayoutType: '2x2',
    hasAC: false,
    hasCharging: true,
    hasWaterBottle: false,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Thimmaiah M.',
    conductorName: 'Appachu K.',
    depot: 'Madikeri Depot'
  },
  // Bengaluru -> Shivamogga (Rajahamsa Executive)
  {
    id: 'sch_508_raj_01',
    routeId: 'route_blr_shv_508',
    busNumber: 'KA-14-F-4822',
    fleetNumber: 'KSRTC-RAJ-482',
    category: 'Rajahamsa Executive',
    departureTime: '06:30 AM',
    arrivalTime: '12:00 PM',
    fare: 460,
    totalSeats: 40,
    availableSeats: 21,
    ladiesReservedSeats: 6,
    seatLayoutType: '2x2',
    hasAC: false,
    hasCharging: true,
    hasWaterBottle: false,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Nagarajaiah H.N.',
    conductorName: 'Venkatesh Rao',
    depot: 'Shivamogga Central Depot'
  },
  // Village Feeder: Mandya -> Shivalli Village (Grama Sarige)
  {
    id: 'sch_mnd_shivalli_01',
    routeId: 'route_mnd_shivalli_vil_01',
    busNumber: 'KA-09-F-2144',
    fleetNumber: 'KSRTC-GS-214',
    category: 'Karnataka Sarige',
    departureTime: '06:30 AM',
    arrivalTime: '07:05 AM',
    fare: 35,
    totalSeats: 48,
    availableSeats: 26,
    ladiesReservedSeats: 16,
    seatLayoutType: '2x3',
    hasAC: false,
    hasCharging: true,
    hasWaterBottle: false,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Ninge Gowda',
    conductorName: 'Kallesh M.',
    depot: 'Mandya Rural Depot-2',
    isVillageService: true,
    villageNameEn: 'Shivalli Village',
    villageNameKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ'
  },
  // Village Feeder: Hassan -> Halebidu Heritage Village (Grama Sarige Shuttle)
  {
    id: 'sch_has_halebidu_01',
    routeId: 'route_has_halebidu_vil_02',
    busNumber: 'KA-13-F-1892',
    fleetNumber: 'KSRTC-GS-189',
    category: 'Karnataka Sarige',
    departureTime: '07:45 AM',
    arrivalTime: '08:35 AM',
    fare: 60,
    totalSeats: 48,
    availableSeats: 19,
    ladiesReservedSeats: 14,
    seatLayoutType: '2x3',
    hasAC: false,
    hasCharging: true,
    hasWaterBottle: false,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Chandre Gowda',
    conductorName: 'Ramegowda H.',
    depot: 'Hassan Rural Feeder Depot',
    isVillageService: true,
    villageNameEn: 'Halebidu Heritage Village',
    villageNameKn: 'ಹಳೇಬೀಡು ಪರಂಪರೆ ಗ್ರಾಮ'
  },
  // Rural Pilgrimage: Bengaluru -> Dharmasthala Kshetra (Rajahamsa)
  {
    id: 'sch_blr_dharmasthala_01',
    routeId: 'route_blr_dharmasthala_vil_03',
    busNumber: 'KA-19-F-8840',
    fleetNumber: 'KSRTC-RAJ-884',
    category: 'Rajahamsa Executive',
    departureTime: '09:30 PM',
    arrivalTime: '05:30 AM',
    fare: 480,
    totalSeats: 40,
    availableSeats: 12,
    ladiesReservedSeats: 6,
    seatLayoutType: '2x2',
    hasAC: false,
    hasCharging: true,
    hasWaterBottle: true,
    hasWiFi: false,
    hasBlanket: false,
    driverName: 'Shekhara Poojary',
    conductorName: 'Prashanth Hegde',
    depot: 'Dharmasthala Kshetra Depot',
    isVillageService: true,
    villageNameEn: 'Dharmasthala Kshetra',
    villageNameKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ'
  }
];

// Master definitions for 120+ Live Running KSRTC Buses across all Karnataka corridors
const CORRIDOR_FLEET_TEMPLATES: Array<{
  routeId: string;
  routeNumber: string;
  routeNameEn: string;
  routeNameKn: string;
  category: BusCategory;
  rtoCode: string;
  fleetPrefix: string;
  destEn: string;
  destKn: string;
  isVillage?: boolean;
  vilEn?: string;
  vilKn?: string;
  stops: Array<{ id: string; nameEn: string; nameKn: string; lat: number; lng: number }>;
}> = [
  {
    routeId: 'route_blr_mys_101',
    routeNumber: '101-EXP',
    routeNameEn: 'Bengaluru ⇄ Mysuru Suburb (Via Expressway)',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಮೈಸೂರು ಉಪನಗರ (ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ)',
    category: 'EV Power Plus',
    rtoCode: 'KA-01-F',
    fleetPrefix: 'KSRTC-EV',
    destEn: 'Mysuru Suburb Stand',
    destKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ',
    stops: [
      { id: 'stop_kbs_majestic', nameEn: 'Bengaluru Majestic T1', nameKn: 'ಬೆಂಗಳೂರು ಮೆಜೆಸ್ಟಿಕ್', lat: 12.9784, lng: 77.5714 },
      { id: 'stop_mctc_satellite', nameEn: 'Satellite Bus Station (MCTC)', nameKn: 'ಸ್ಯಾಟಲೈಟ್ ನಿಲ್ದಾಣ', lat: 12.9515, lng: 77.5442 },
      { id: 'stop_bidadi_ind', nameEn: 'Bidadi Smart City Gate', nameKn: 'ಬಿದದಿ ಸ್ಮಾರ್ಟ್ ಸಿಟಿ', lat: 12.7985, lng: 77.3820 },
      { id: 'stop_ramanagara_stand', nameEn: 'Ramanagara Bypass', nameKn: 'ರಾಮನಗರ ಬೈಪಾಸ್', lat: 12.7214, lng: 77.2801 },
      { id: 'stop_channapatna_stand', nameEn: 'Channapatna Toy City', nameKn: 'ಚನ್ನಪಟ್ಟಣ ಬಸ್ ನಿಲ್ದಾಣ', lat: 12.6517, lng: 77.2064 },
      { id: 'stop_maddur_stand', nameEn: 'Maddur Shivalli Cross', nameKn: 'ಮದ್ದೂರು ಕ್ರಾಸ್', lat: 12.5841, lng: 77.0452 },
      { id: 'stop_mandya_central', nameEn: 'Mandya KSRTC Bus Stand', nameKn: 'ಮಂಡ್ಯ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ನಿಲ್ದಾಣ', lat: 12.5238, lng: 76.8967 },
      { id: 'stop_srirangapatna_stand', nameEn: 'Srirangapatna Toll Gate', nameKn: 'ಶ್ರೀರಂಗಪಟ್ಟಣ ಟೋಲ್ ಗೇಟ್', lat: 12.4184, lng: 76.6947 },
      { id: 'stop_mysuru_suburb', nameEn: 'Mysuru Suburb Bus Stand', nameKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ', lat: 12.3117, lng: 76.6579 }
    ]
  },
  {
    routeId: 'route_blr_mys_101',
    routeNumber: '102-AIR',
    routeNameEn: 'Bengaluru ⇄ Mysuru Airavat Club Class',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಮೈಸೂರು ಐರಾವತ ಕ್ಲಬ್ ಕ್ಲಾಸ್',
    category: 'Airavat Club Class',
    rtoCode: 'KA-09-F',
    fleetPrefix: 'KSRTC-ACC',
    destEn: 'Mysuru Suburb Stand',
    destKn: 'ಮೈಸೂರು ಉಪನಗರ',
    stops: [
      { id: 'stop_kbs_majestic', nameEn: 'Bengaluru Majestic', nameKn: 'ಬೆಂಗಳೂರು ಮೆಜೆಸ್ಟಿಕ್', lat: 12.9784, lng: 77.5714 },
      { id: 'stop_mctc_satellite', nameEn: 'Satellite Bus Station', nameKn: 'ಸ್ಯಾಟಲೈಟ್ ಬಸ್ ನಿಲ್ದಾಣ', lat: 12.9515, lng: 77.5442 },
      { id: 'stop_mandya_central', nameEn: 'Mandya KSRTC Stand', nameKn: 'ಮಂಡ್ಯ ಬಸ್ ನಿಲ್ದಾಣ', lat: 12.5238, lng: 76.8967 },
      { id: 'stop_mysuru_suburb', nameEn: 'Mysuru Suburb Stand', nameKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ', lat: 12.3117, lng: 76.6579 }
    ]
  },
  {
    routeId: 'route_blr_mys_101',
    routeNumber: '103-SAR',
    routeNameEn: 'Bengaluru ⇄ Mysuru Karnataka Sarige (Shakti Express)',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಮೈಸೂರು ಕರ್ನಾಟಕ ಸಾರಿಗೆ (ಶಕ್ತಿ)',
    category: 'Karnataka Sarige',
    rtoCode: 'KA-01-F',
    fleetPrefix: 'KSRTC-SAR',
    destEn: 'Mysuru Suburb Stand',
    destKn: 'ಮೈಸೂರು ಉಪನಗರ',
    stops: [
      { id: 'stop_mctc_satellite', nameEn: 'Satellite Bus Station', nameKn: 'ಸ್ಯಾಟಲೈಟ್ ಬಸ್ ನಿಲ್ದಾಣ', lat: 12.9515, lng: 77.5442 },
      { id: 'stop_ramanagara_stand', nameEn: 'Ramanagara Stand', nameKn: 'ರಾಮನಗರ ನಿಲ್ದಾಣ', lat: 12.7214, lng: 77.2801 },
      { id: 'stop_channapatna_stand', nameEn: 'Channapatna Stand', nameKn: 'ಚನ್ನಪಟ್ಟಣ ನಿಲ್ದಾಣ', lat: 12.6517, lng: 77.2064 },
      { id: 'stop_maddur_stand', nameEn: 'Maddur Stand', nameKn: 'ಮದ್ದೂರು ನಿಲ್ದಾಣ', lat: 12.5841, lng: 77.0452 },
      { id: 'stop_mandya_central', nameEn: 'Mandya Central Stand', nameKn: 'ಮಂಡ್ಯ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ', lat: 12.5238, lng: 76.8967 },
      { id: 'stop_srirangapatna_stand', nameEn: 'Srirangapatna Stand', nameKn: 'ಶ್ರೀರಂಗಪಟ್ಟಣ ನಿಲ್ದಾಣ', lat: 12.4184, lng: 76.6947 },
      { id: 'stop_mysuru_suburb', nameEn: 'Mysuru Suburb Stand', nameKn: 'ಮೈಸೂರು ಉಪನಗರ ನಿಲ್ದಾಣ', lat: 12.3117, lng: 76.6579 }
    ]
  },
  {
    routeId: 'route_blr_mng_204',
    routeNumber: '204-AIR',
    routeNameEn: 'Bengaluru (Satellite) ⇄ Mangaluru (Bejai)',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಮಂಗಳೂರು (ಬಿಜೈ)',
    category: 'Airavat Club Class',
    rtoCode: 'KA-19-F',
    fleetPrefix: 'KSRTC-ACC',
    destEn: 'Mangaluru KSRTC (Bejai)',
    destKn: 'ಮಂಗಳೂರು ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ (ಬಿಜೈ)',
    stops: [
      { id: 'stop_mctc_satellite', nameEn: 'Bengaluru Satellite MCTC', nameKn: 'ಬೆಂಗಳೂರು ಸ್ಯಾಟಲೈಟ್', lat: 12.9515, lng: 77.5442 },
      { id: 'stop_nelamangala_toll', nameEn: 'Nelamangala Toll Plaza', nameKn: 'ನೆಲಮಂಗಲ ಟೋಲ್', lat: 13.0967, lng: 77.3912 },
      { id: 'stop_kunigal_bypass', nameEn: 'Kunigal Lake Bypass', nameKn: 'ಕುಣಿಗಲ್ ಬೈಪಾಸ್', lat: 13.0245, lng: 77.0289 },
      { id: 'stop_channarayapatna_stand', nameEn: 'Channarayapatna Stand', nameKn: 'ಚನ್ನರಾಯಪಟ್ಟಣ ನಿಲ್ದಾಣ', lat: 12.9067, lng: 76.3889 },
      { id: 'stop_hassan_central', nameEn: 'Hassan KSRTC Central Stand', nameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ', lat: 13.0033, lng: 76.1004 },
      { id: 'stop_sakleshpur_stand', nameEn: 'Sakleshpur Ghat Entry', nameKn: 'ಸಕಲೇಶಪುರ ಘಾಟ್ ಪ್ರವೇಶ', lat: 12.9650, lng: 75.9210 },
      { id: 'stop_uppinangady_stand', nameEn: 'Uppinangady Sangama Stand', nameKn: 'ಉಪ್ಪಿನಂಗಡಿ ಸಂಗಮ', lat: 12.8367, lng: 75.3122 },
      { id: 'stop_bc_road_stand', nameEn: 'Bantwal B.C. Road Circle', nameKn: 'ಬಂಟ್ವಾಳ ಬಿ.ಸಿ. ರೋಡ್', lat: 12.8756, lng: 75.0289 },
      { id: 'stop_mangaluru_bejai', nameEn: 'Mangaluru KSRTC Terminal (Bejai)', nameKn: 'ಮಂಗಳೂರು (ಬಿಜೈ)', lat: 12.8833, lng: 74.8489 }
    ]
  },
  {
    routeId: 'route_blr_bel_315',
    routeNumber: '315-AMB',
    routeNameEn: 'Bengaluru ⇄ Hubballi ⇄ Belagavi (CBT)',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಹುಬ್ಬಳ್ಳಿ ⇄ ಬೆಳಗಾವಿ (ಸಿಬಿಟಿ)',
    category: 'Ambari Utsav',
    rtoCode: 'KA-22-F',
    fleetPrefix: 'KSRTC-UTS',
    destEn: 'Belagavi Central (CBT)',
    destKn: 'ಬೆಳಗಾವಿ ಸಿಬಿಟಿ',
    stops: [
      { id: 'stop_kbs_majestic', nameEn: 'Bengaluru Majestic T1', nameKn: 'ಬೆಂಗಳೂರು ಮೆಜೆಸ್ಟಿಕ್', lat: 12.9784, lng: 77.5714 },
      { id: 'stop_tumakuru_stand', nameEn: 'Tumakuru KSRTC Stand', nameKn: 'ತುಮಕೂರು ಬಸ್ ನಿಲ್ದಾಣ', lat: 13.3422, lng: 77.1017 },
      { id: 'stop_chitradurga_stand', nameEn: 'Chitradurga Fort Stand', nameKn: 'ಚಿತ್ರದುರ್ಗ ನಿಲ್ದಾಣ', lat: 14.2251, lng: 76.4022 },
      { id: 'stop_davanagere_central', nameEn: 'Davanagere Central Stand', nameKn: 'ದಾವಣಗೆರೆ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ', lat: 14.4644, lng: 75.9218 },
      { id: 'stop_haveri_stand', nameEn: 'Haveri KSRTC Stand', nameKn: 'ಹಾವೇರಿ ನಿಲ್ದಾಣ', lat: 14.7950, lng: 75.4050 },
      { id: 'stop_hubballi_central', nameEn: 'Hubballi New Bus Stand (Gokul)', nameKn: 'ಹುಬ್ಬಳ್ಳಿ ಹೊಸ ಬಸ್ ನಿಲ್ದಾಣ', lat: 15.3585, lng: 75.1415 },
      { id: 'stop_dharwad_cbt', nameEn: 'Dharwad City Bus Terminal (CBT)', nameKn: 'ಧಾರವಾಡ ಸಿಬಿಟಿ', lat: 15.4589, lng: 75.0078 },
      { id: 'stop_belagavi_cbt', nameEn: 'Belagavi Central (CBT)', nameKn: 'ಬೆಳಗಾವಿ ಸಿಬಿಟಿ', lat: 15.8497, lng: 74.4977 }
    ]
  },
  {
    routeId: 'route_blr_shv_508',
    routeNumber: '508-RAJ',
    routeNameEn: 'Bengaluru ⇄ Tumakuru ⇄ Shivamogga',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ತುಮಕೂರು ⇄ ಶಿವಮೊಗ್ಗ',
    category: 'Rajahamsa Executive',
    rtoCode: 'KA-14-F',
    fleetPrefix: 'KSRTC-RAJ',
    destEn: 'Shivamogga Central',
    destKn: 'ಶಿವಮೊಗ್ಗ ಕೇಂದ್ರೀಯ',
    stops: [
      { id: 'stop_kbs_majestic', nameEn: 'Bengaluru Majestic', nameKn: 'ಬೆಂಗಳೂರು ಮೆಜೆಸ್ಟಿಕ್', lat: 12.9784, lng: 77.5714 },
      { id: 'stop_tumakuru_stand', nameEn: 'Tumakuru Stand', nameKn: 'ತುಮಕೂರು ನಿಲ್ದಾಣ', lat: 13.3422, lng: 77.1017 },
      { id: 'stop_tiptur_stand', nameEn: 'Tiptur Stand', nameKn: 'ತಿಪಟೂರು ನಿಲ್ದಾಣ', lat: 13.2590, lng: 76.4780 },
      { id: 'stop_arsikere_stand', nameEn: 'Arsikere Stand', nameKn: 'ಅರಸೀಕೆರೆ ನಿಲ್ದಾಣ', lat: 13.3140, lng: 76.2570 },
      { id: 'stop_bhadravathi_stand', nameEn: 'Bhadravathi Stand', nameKn: 'ಭದ್ರಾವತಿ ನಿಲ್ದಾಣ', lat: 13.8420, lng: 75.7050 },
      { id: 'stop_shivamogga_central', nameEn: 'Shivamogga Central', nameKn: 'ಶಿವಮೊಗ್ಗ ಕೇಂದ್ರೀಯ', lat: 13.9312, lng: 75.5684 }
    ]
  },
  {
    routeId: 'route_mys_kdg_412',
    routeNumber: '412-SAR',
    routeNameEn: 'Mysuru Suburb ⇄ Hunsur ⇄ Madikeri (Coorg)',
    routeNameKn: 'ಮೈಸೂರು ಉಪನಗರ ⇄ ಹುಣಸೂರು ⇄ ಮಡಿಕೇರಿ (ಕೊಡಗು)',
    category: 'Rajahamsa Executive',
    rtoCode: 'KA-09-F',
    fleetPrefix: 'KSRTC-RAJ',
    destEn: 'Madikeri KSRTC Stand',
    destKn: 'ಮಡಿಕೇರಿ ನಿಲ್ದಾಣ',
    stops: [
      { id: 'stop_mysuru_suburb', nameEn: 'Mysuru Suburb Stand', nameKn: 'ಮೈಸೂರು ಉಪನಗರ', lat: 12.3117, lng: 76.6579 },
      { id: 'stop_hunsur_stand', nameEn: 'Hunsur Stand', nameKn: 'ಹುಣಸೂರು ನಿಲ್ದಾಣ', lat: 12.3080, lng: 76.2890 },
      { id: 'stop_periyapatna_stand', nameEn: 'Periyapatna Stand', nameKn: 'ಪಿರಿಯಾಪಟ್ಟಣ ನಿಲ್ದಾಣ', lat: 12.3420, lng: 76.0980 },
      { id: 'stop_kushalnagar_stand', nameEn: 'Kushalnagar Tibetan Stand', nameKn: 'ಕುಶಾಲನಗರ ನಿಲ್ದಾಣ', lat: 12.4560, lng: 75.9620 },
      { id: 'stop_madikeri_stand', nameEn: 'Madikeri KSRTC Stand', nameKn: 'ಮಡಿಕೇರಿ ನಿಲ್ದಾಣ', lat: 12.4244, lng: 75.7382 }
    ]
  },
  {
    routeId: 'route_blr_dharmasthala_vil_03',
    routeNumber: 'GS-BLR-DHA-90',
    routeNameEn: 'Bengaluru (Satellite) ⇄ Dharmasthala Kshetra',
    routeNameKn: 'ಬೆಂಗಳೂರು ⇄ ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ',
    category: 'Rajahamsa Executive',
    rtoCode: 'KA-19-F',
    fleetPrefix: 'KSRTC-RAJ',
    destEn: 'Dharmasthala Kshetra',
    destKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ',
    isVillage: true,
    vilEn: 'Dharmasthala Kshetra',
    vilKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ',
    stops: [
      { id: 'stop_mctc_satellite', nameEn: 'Bengaluru Satellite MCTC', nameKn: 'ಬೆಂಗಳೂರು ಸ್ಯಾಟಲೈಟ್', lat: 12.9515, lng: 77.5442 },
      { id: 'stop_kunigal_bypass', nameEn: 'Kunigal Bypass', nameKn: 'ಕುಣಿಗಲ್ ಬೈಪಾಸ್', lat: 13.0245, lng: 77.0289 },
      { id: 'stop_hassan_central', nameEn: 'Hassan Central Stand', nameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ', lat: 13.0033, lng: 76.1004 },
      { id: 'stop_sakleshpur_stand', nameEn: 'Sakleshpur Ghat Entry', nameKn: 'ಸಕಲೇಶಪುರ', lat: 12.9650, lng: 75.9210 },
      { id: 'stop_dharmasthala_kshetra', nameEn: 'Dharmasthala Kshetra Temple Stand', nameKn: 'ಧರ್ಮಸ್ಥಳ ಕ್ಷೇತ್ರ ನಿಲ್ದಾಣ', lat: 12.9550, lng: 75.3850 }
    ]
  },
  {
    routeId: 'route_mnd_shivalli_vil_01',
    routeNumber: 'GS-MND-12',
    routeNameEn: 'Mandya Stand ⇄ Shivalli Village Grama Sarige',
    routeNameKn: 'ಮಂಡ್ಯ ⇄ ಶಿವಳ್ಳಿ ಗ್ರಾಮ ಸಾರಿಗೆ',
    category: 'Karnataka Sarige',
    rtoCode: 'KA-09-F',
    fleetPrefix: 'KSRTC-GS',
    destEn: 'Shivalli Village',
    destKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ',
    isVillage: true,
    vilEn: 'Shivalli Village',
    vilKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ',
    stops: [
      { id: 'stop_mandya_central', nameEn: 'Mandya Central Stand', nameKn: 'ಮಂಡ್ಯ ನಿಲ್ದಾಣ', lat: 12.5238, lng: 76.8967 },
      { id: 'stop_shivalli_village_center', nameEn: 'Shivalli Grama Panchayat Stop', nameKn: 'ಶಿವಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯತ್', lat: 12.5620, lng: 76.8450 }
    ]
  },
  {
    routeId: 'route_has_halebidu_vil_02',
    routeNumber: 'GS-HAS-24',
    routeNameEn: 'Hassan Central ⇄ Halebidu Heritage Village Shuttle',
    routeNameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ⇄ ಹಳೇಬೀಡು ಗ್ರಾಮ ಶಟಲ್',
    category: 'Karnataka Sarige',
    rtoCode: 'KA-13-F',
    fleetPrefix: 'KSRTC-GS',
    destEn: 'Halebidu Temple Complex',
    destKn: 'ಹಳೇಬೀಡು ದೇವಸ್ಥಾನ ಆವರಣ',
    isVillage: true,
    vilEn: 'Halebidu Heritage Village',
    vilKn: 'ಹಳೇಬೀಡು ಪರಂಪರೆ ಗ್ರಾಮ',
    stops: [
      { id: 'stop_hassan_central', nameEn: 'Hassan Central Stand', nameKn: 'ಹಾಸನ ಕೇಂದ್ರೀಯ ನಿಲ್ದಾಣ', lat: 13.0033, lng: 76.1004 },
      { id: 'stop_halebidu_village', nameEn: 'Halebidu Village Bus Shelter', nameKn: 'ಹಳೇಬೀಡು ಗ್ರಾಮ ಬಸ್ ತಂಗುದಾಣ', lat: 13.2167, lng: 75.9922 }
    ]
  }
];

// Helper to synthesize 120+ authentic KSRTC buses distributed along Karnataka corridors
function generate100PlusKSRTCBuses(): LiveBusTracking[] {
  const result: LiveBusTracking[] = [];
  let busSeq = 1000;

  // We iterate through all corridor templates and distribute multiple live buses along each route segment
  CORRIDOR_FLEET_TEMPLATES.forEach((template, tIdx) => {
    // Generate between 10 and 15 live buses per corridor
    const numBuses = template.isVillage ? 6 : 14;
    const numStops = template.stops.length;

    for (let i = 0; i < numBuses; i++) {
      busSeq += Math.floor(Math.random() * 25) + 7;
      const busNumber = `${template.rtoCode}-${busSeq}`;
      const fleetNumber = `${template.fleetPrefix}-${Math.floor(busSeq / 10)}`;

      // Pick segment along the stops
      const segIdx = i % (numStops - 1);
      const stopA = template.stops[segIdx];
      const stopB = template.stops[segIdx + 1];

      // Interpolate position along highway corridor with small random jitter
      const progress = 0.15 + ((i * 0.23) % 0.7);
      const lat = Number((stopA.lat + (stopB.lat - stopA.lat) * progress + (Math.random() - 0.5) * 0.005).toFixed(4));
      const lng = Number((stopA.lng + (stopB.lng - stopA.lng) * progress + (Math.random() - 0.5) * 0.005).toFixed(4));

      // Compute heading bearing
      const dLng = stopB.lng - stopA.lng;
      const dLat = stopB.lat - stopA.lat;
      const rawAngle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
      const bearing = Math.round((rawAngle + 360) % 360);

      // Realistic speed (42 to 78 km/h depending on bus category)
      const baseSpeed = template.category === 'EV Power Plus' ? 72 :
                        template.category === 'Airavat Club Class' || template.category === 'Ambari Utsav' ? 68 :
                        template.category === 'Rajahamsa Executive' ? 60 : 50;
      const speedKmh = Math.max(35, Math.min(80, baseSpeed + (i % 7) * 2 - 4));

      const distKm = Number((3.5 + ((i * 4.3) % 18.5)).toFixed(1));
      const etaMins = Math.max(2, Math.round((distKm / speedKmh) * 60));
      const delay = (i % 5 === 0) ? -2 : (i % 3 === 0) ? 6 : (i % 7 === 0) ? 11 : 0;

      result.push({
        busNumber,
        fleetNumber,
        routeId: template.routeId,
        routeNumber: template.routeNumber,
        routeNameEn: template.routeNameEn,
        routeNameKn: template.routeNameKn,
        category: template.category,
        currentLat: lat,
        currentLng: lng,
        bearing,
        speedKmh,
        nextStopId: stopB.id,
        nextStopNameEn: stopB.nameEn,
        nextStopNameKn: stopB.nameKn,
        distanceToNextStopKm: distKm,
        estimatedArrivalNextStopMinutes: etaMins,
        currentSegmentIndex: segIdx,
        delayMinutes: delay,
        lastUpdatedSecondsAgo: (i * 3) % 30,
        isGpsLive: true,
        driverPhone: `+91 9448${Math.floor(100000 + (busSeq * 7) % 899999)}`,
        destinationNameEn: template.destEn,
        destinationNameKn: template.destKn,
        isVillageBus: template.isVillage || false,
        villageNameEn: template.vilEn,
        villageNameKn: template.vilKn
      });
    }
  });

  return result;
}

export const INITIAL_LIVE_BUSES: LiveBusTracking[] = generate100PlusKSRTCBuses();
