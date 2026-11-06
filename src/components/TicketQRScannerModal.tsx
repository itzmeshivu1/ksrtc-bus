import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Search, 
  Check, 
  Ticket, 
  User, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Sparkles,
  Volume2,
  VolumeX,
  FlipHorizontal
} from 'lucide-react';
import jsQR from 'jsqr';
import { Booking, Language } from '../types';

interface TicketQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onMarkAsBoarded?: (bookingId: string) => void;
  onTrackBus?: (busNumber: string) => void;
  lang: Language;
}

export const TicketQRScannerModal: React.FC<TicketQRScannerModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onMarkAsBoarded,
  onTrackBus,
  lang
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<{
    status: 'VALID' | 'INVALID';
    booking?: Booking;
    rawPayload: string;
    verifiedAt: string;
    isBoarded?: boolean;
    errorReason?: string;
  } | null>(null);

  const [manualPnr, setManualPnr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [boardedBookingIds, setBoardedBookingIds] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play audio chime for ticket verification
  const playSound = (type: 'success' | 'error') => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in browser settings, or upload a ticket QR code image below.'
          : `Camera error: ${err.message || 'Unable to access video device'}. Use the file upload or manual PNR search below.`
      );
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Continuous QR Code Scanning Loop
  const startScanningLoop = () => {
    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            handleDecodedQR(code.data);
            return; // Stop scanning once detected
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  // Process decoded QR payload & verify against bookings state
  const handleDecodedQR = (rawPayload: string) => {
    stopCamera();

    const clean = rawPayload.trim();
    let matchedBooking: Booking | undefined;

    // 1. Direct match by PNR or Ticket Number
    matchedBooking = bookings.find(
      (b) =>
        b.pnrNumber.toLowerCase() === clean.toLowerCase() ||
        b.ticketNumber.toLowerCase() === clean.toLowerCase() ||
        b.id.toLowerCase() === clean.toLowerCase() ||
        (b.qrPayload && b.qrPayload.toLowerCase() === clean.toLowerCase())
    );

    // 2. JSON Payload inspection
    if (!matchedBooking && clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        const pnr = parsed.pnr || parsed.pnrNumber || parsed.ticket || parsed.ticketNumber;
        if (pnr) {
          matchedBooking = bookings.find(
            (b) =>
              b.pnrNumber.toLowerCase() === String(pnr).toLowerCase() ||
              b.ticketNumber.toLowerCase() === String(pnr).toLowerCase()
          );
        }
      } catch {
        // Ignore json parse error
      }
    }

    // 3. Fallback URL extraction: e.g. ksrtc.in/verify?pnr=KSRTC-PNR-88412
    if (!matchedBooking && clean.includes('pnr=')) {
      const match = clean.match(/pnr=([A-Za-z0-9-]+)/i);
      if (match && match[1]) {
        const pnrVal = match[1];
        matchedBooking = bookings.find((b) => b.pnrNumber.toLowerCase() === pnrVal.toLowerCase());
      }
    }

    // 4. Verify results
    const verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (matchedBooking) {
      playSound('success');
      setScannedResult({
        status: 'VALID',
        booking: matchedBooking,
        rawPayload: clean,
        verifiedAt,
        isBoarded: boardedBookingIds.includes(matchedBooking.id)
      });
    } else {
      playSound('error');
      setScannedResult({
        status: 'INVALID',
        rawPayload: clean,
        verifiedAt,
        errorReason: 'This QR code does not match any confirmed booking in the KSRTC AWATAR 2.0 system.'
      });
    }
  };

  // Handle image upload from file system
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedQR(code.data);
          } else {
            playSound('error');
            setScannedResult({
              status: 'INVALID',
              rawPayload: 'Uploaded Image',
              verifiedAt: new Date().toLocaleTimeString(),
              errorReason: 'Could not detect a valid QR code in the uploaded image. Ensure the image is clear and well-lit.'
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual PNR query
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPnr.trim()) return;
    handleDecodedQR(manualPnr.trim());
    setManualPnr('');
  };

  // Test Sample Ticket Scanner for verification demo
  const handleScanSampleTicket = (sampleBooking?: Booking) => {
    const target = sampleBooking || bookings[0];
    if (target) {
      handleDecodedQR(target.pnrNumber);
    } else {
      alert('No bookings in system yet. Book a ticket in the Booking tab first or scan a QR code!');
    }
  };

  // Mark ticket as boarded
  const handleMarkBoarded = (bId: string) => {
    setBoardedBookingIds((prev) => [...prev, bId]);
    if (onMarkAsBoarded) onMarkAsBoarded(bId);
    if (scannedResult) {
      setScannedResult({ ...scannedResult, isBoarded: true });
    }
  };

  // Lifecycle: start camera when opened, stop when closed
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'kn' ? 'ಕ್ಯೂಆರ್ ಟಿಕೆಟ್ ಸ್ಕ್ಯಾನರ್ & ಪರಿಶೀಲನೆ' : 'KSRTC QR Ticket Scanner'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                AWATAR 2.0 Real-time Digital Pass Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio Beep' : 'Mute Audio Beep'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* View Mode 1: Result Card (If Scanned) */}
          {scannedResult ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {scannedResult.status === 'VALID' && scannedResult.booking ? (
                /* Verified Valid KSRTC Ticket Certificate */
                <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-4">
                  {/* Verified Header Stamp */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-emerald-800 dark:text-emerald-200 tracking-tight">
                            {lang === 'kn' ? 'ಮಾನ್ಯವಾದ ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಟಿಕೆಟ್' : 'VALID OFFICIAL KSRTC TICKET'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                            VERIFIED
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                          Verified at {scannedResult.verifiedAt}
                        </div>
                      </div>
                    </div>

                    {scannedResult.isBoarded && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase">
                        BOARDED
                      </span>
                    )}
                  </div>

                  {/* Core Ticket Information Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">PNR Number</div>
                      <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">
                        {scannedResult.booking.pnrNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Ticket Number</div>
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        {scannedResult.booking.ticketNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Bus Vehicle</div>
                      <div className="font-mono font-black text-red-600 dark:text-red-400 mt-0.5">
                        {scannedResult.booking.busNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Platform Bay</div>
                      <div className="font-mono font-black text-slate-900 dark:text-white mt-0.5">
                        {scannedResult.booking.bayNumber}
                      </div>
                    </div>
                  </div>

                  {/* Journey Corridor Details */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="font-black text-slate-900 dark:text-white text-sm">
                      {lang === 'kn' ? scannedResult.booking.routeNameKn : scannedResult.booking.routeNameEn}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-semibold">Boarding:</span>{' '}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scannedResult.booking.boardingStop}</span>
                        <div className="text-red-600 dark:text-red-400 font-mono font-bold mt-0.5">
                          Dep: {scannedResult.booking.departureTime} ({scannedResult.booking.journeyDate})
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Dropping:</span>{' '}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scannedResult.booking.droppingStop}</span>
                        <div className="text-slate-500 font-mono mt-0.5">
                          ETA: {scannedResult.booking.arrivalTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger & Seats List */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Passenger Manifest ({scannedResult.booking.passengers.length} Passenger{scannedResult.booking.passengers.length > 1 ? 's' : ''})
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {scannedResult.booking.passengers.map((p, pIdx) => (
                        <div key={pIdx} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{p.name || 'Passenger'}</span>
                            <span className="text-slate-400">({p.age} yrs, {p.gender})</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-mono font-black text-xs">
                            Seat {p.seatNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex items-center justify-between text-xs px-2 text-slate-500">
                    <div>
                      Paid ₹{scannedResult.booking.totalAmount} via {scannedResult.booking.paymentMethod} (Txn: {scannedResult.booking.paymentTransactionId})
                    </div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AWATAR Confirmed</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!scannedResult.isBoarded ? (
                        <button
                          onClick={() => handleMarkBoarded(scannedResult.booking!.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{lang === 'kn' ? 'ಪ್ರಯಾಣಿಕರು ಹತ್ತಿದ್ದಾರೆಂದು ಗುರುತಿಸಿ' : 'Mark as Boarded'}</span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Boarding Recorded</span>
                        </div>
                      )}

                      {onTrackBus && (
                        <button
                          onClick={() => {
                            onClose();
                            onTrackBus(scannedResult.booking!.busNumber);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-red-500" />
                          <span>{lang === 'kn' ? 'ಈ ಬಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track This Bus'}</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setScannedResult(null);
                        startCamera();
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                    >
                      {lang === 'kn' ? 'ಮತ್ತೊಂದು ಟಿಕೆಟ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Another'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Invalid or Unverified Ticket Alert */
                <div className="rounded-3xl border-2 border-red-500/40 bg-red-50/40 dark:bg-red-950/20 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-red-900 dark:text-red-200">
                        {lang === 'kn' ? 'ಅಮಾನ್ಯ ಅಥವಾ ಗುರುತಿಸಲಾಗದ ಟಿಕೆಟ್' : 'UNVERIFIED OR INVALID TICKET'}
                      </h3>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        {scannedResult.errorReason || 'No corresponding booking found in KSRTC records.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                    Scanned Content: {scannedResult.rawPayload}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setScannedResult(null);
                        startCamera();
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Try Again
                    </button>
                    {bookings.length > 0 && (
                      <button
                        onClick={() => handleScanSampleTicket()}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                      >
                        Scan Test Booking
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* View Mode 2: Camera Viewfinder & Alternative Inputs */
            <div className="space-y-4">
              {/* Camera Stream Viewfinder */}
              <div className="relative aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center">
                {/* Hidden canvas for processing frames */}
                <canvas ref={canvasRef} className="hidden" />

                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Camera Overlay Viewfinder Frame */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    {/* Viewfinder Target Box */}
                    <div className="relative w-52 h-52 sm:w-64 sm:h-64 border-2 border-white/60 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                      {/* Viewfinder Corners */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-xl" />

                      {/* Animated Red Scanning Laser Line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-[0_0_8px_#ef4444]" />

                      <div className="text-[11px] font-bold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                        {lang === 'kn' ? 'ಕ್ಯೂಆರ್ ಕೋಡ್ ಅನ್ನು ಇಲ್ಲಿ ಇರಿಸಿ' : 'Align Ticket QR inside'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State or Inactive Prompt */}
                {cameraError && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/90 text-white space-y-3">
                    <Camera className="w-10 h-10 text-slate-500" />
                    <div className="max-w-xs text-xs text-slate-300 leading-relaxed">
                      {cameraError}
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}

                {/* Camera Control Badges */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20"
                      title="Flip Camera (Front/Back)"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Alternative Scanning Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-400 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-red-600" />
                  <span>{lang === 'kn' ? 'ಟಿಕೆಟ್ ಚಿತ್ರ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Ticket QR Image'}</span>
                </button>

                {/* Instant Sample Ticket Test Button */}
                <button
                  onClick={() => handleScanSampleTicket()}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-400 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'kn' ? 'ಡೆಮೊ ಟಿಕೆಟ್ ಪರಿಶೀಲಿಸಿ' : 'Verify Sample System Ticket'}</span>
                </button>
              </div>

              {/* Manual PNR Search Form */}
              <form onSubmit={handleManualSearch} className="pt-2">
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  {lang === 'kn' ? 'ಅಥವಾ PNR / ಟಿಕೆಟ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Or Enter PNR Number Manually'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. KSRTC-PNR-88412 or KSRTC-TK-..."
                      value={manualPnr}
                      onChange={(e) => setManualPnr(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Bookings Quick Test List */}
          {bookings.length > 0 && !scannedResult && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{lang === 'kn' ? 'ನಿಮ್ಮ ಸಕ್ರಿಯ ಟಿಕೆಟ್‌ಗಳು (ಪರೀಕ್ಷೆಗಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ)' : 'Active Bookings in System (Click to Test)'}</span>
                <span className="text-red-600 font-mono">{bookings.length} Booked</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bookings.slice(0, 4).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleDecodedQR(b.pnrNumber)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white group-hover:text-red-600">
                        {b.pnrNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {b.boardingStop} → {b.droppingStop}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {b.busNumber} • {b.journeyDate} • Seat {b.seats.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>KSRTC ITMS & AWATAR 2.0 Security Compliance</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
