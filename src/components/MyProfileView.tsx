import React, { useState } from 'react';
import { 
  User, 
  Smartphone, 
  Ticket, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  QrCode, 
  Printer, 
  Trash2,
  Lock
} from 'lucide-react';
import { Booking, UserProfile, Language } from '../types';
import { getT } from '../data/translations';
import { generateSvgQrPattern } from '../utils/geoUtils';

interface MyProfileViewProps {
  bookings: Booking[];
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onCancelBooking: (bookingId: string) => void;
  onTrackBus: (busNumber: string) => void;
  lang: Language;
  onOpenQRScanner?: () => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  bookings,
  user,
  onUpdateUser,
  onCancelBooking,
  onTrackBus,
  lang,
  onOpenQRScanner
}) => {
  const t = getT(lang);

  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (phoneInput.length !== 10) {
      alert('Please enter a 10-digit mobile number.');
      return;
    }
    setIsOtpSent(true);
    setOtpInput('4281'); // Demo auto-fill
    setLoginMsg(`${t.otpSentMsg} +91 ${phoneInput}`);
  };

  const handleVerifyOtp = () => {
    if (otpInput === '4281' || otpInput.length === 4) {
      onUpdateUser({
        ...user,
        phone: phoneInput,
        isLoggedIn: true
      });
      setIsOtpSent(false);
      setLoginMsg('Signed in successfully.');
      setTimeout(() => setLoginMsg(null), 3000);
    } else {
      alert('Invalid OTP. Please enter 4281 for demonstration.');
    }
  };

  const handleLogout = () => {
    onUpdateUser({
      ...user,
      isLoggedIn: false
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-red-600/20">
            {user.isLoggedIn ? user.name[0] : <User className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {user.isLoggedIn ? user.name : 'Guest Passenger'}
              </h1>
              {user.isLoggedIn && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user.isLoggedIn ? `+91 ${user.phone} • ${user.email}` : 'Sign in to access your digital tickets & saved trips'}
            </p>
          </div>
        </div>

        {user.isLoggedIn && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Login Card if not logged in */}
      {!user.isLoggedIn && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            {t.loginTitle}
          </h2>

          <div className="max-w-md space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.enterPhone}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t.sendOtp}
                </button>
              </div>
            </div>

            {isOtpSent && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  Enter 4-Digit OTP (Demo: 4281)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono text-center tracking-widest text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-red-700"
                  >
                    {t.verifyOtp}
                  </button>
                </div>
              </div>
            )}

            {loginMsg && (
              <p className="text-xs text-emerald-600 font-semibold">{loginMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* Booking History & Digital Passes */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-red-600" />
            {t.myBookings} ({bookings.length})
          </h2>

          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all self-start sm:self-auto"
            >
              <QrCode className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{lang === 'kn' ? 'ಕ್ಯೂಆರ್ ಟಿಕೆಟ್ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ' : 'Open Ticket QR Scanner'}</span>
            </button>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Digital Tickets Booked Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Search for buses across Karnataka and reserve your seat to get instant electronic tickets with QR validation.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const qrSvg = generateSvgQrPattern(booking.qrPayload, 80);

              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                        {booking.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {booking.routeNameEn}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono">
                        PNR: <strong className="text-red-600 font-bold">{booking.pnrNumber}</strong> • Bus: {booking.busNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs w-full sm:w-auto">
                      <div>
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Journey Date</div>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{booking.journeyDate}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Departure</div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">{booking.departureTime}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Seats</div>
                        <div className="font-bold text-red-600 font-mono mt-0.5">{booking.seats.join(', ')}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
                      <div className="space-y-1">
                        <button
                          onClick={() => onTrackBus(booking.busNumber)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {t.trackThisBus}
                        </button>
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onCancelBooking(booking.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.cancelTicket}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-600" />
          Real-Time Transit Alerts & Notifications
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Bus Approaching Alert</div>
              <div className="text-slate-500">Receive alert when bus is 10 minutes from your boarding stop</div>
            </div>
            <input
              type="checkbox"
              checked={user.notificationPreferences.busApproachingAlert}
              onChange={(e) =>
                onUpdateUser({
                  ...user,
                  notificationPreferences: {
                    ...user.notificationPreferences,
                    busApproachingAlert: e.target.checked
                  }
                })
              }
              className="accent-red-600 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">SMS Booking & Platform Bay Pass</div>
              <div className="text-slate-500">Send electronic ticket and platform bay number via SMS</div>
            </div>
            <input
              type="checkbox"
              checked={user.notificationPreferences.bookingSms}
              onChange={(e) =>
                onUpdateUser({
                  ...user,
                  notificationPreferences: {
                    ...user.notificationPreferences,
                    bookingSms: e.target.checked
                  }
                })
              }
              className="accent-red-600 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
