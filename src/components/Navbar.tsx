import React from 'react';
import { Bus, MapPin, Search, Ticket, Compass, Smartphone, User, ShieldCheck, Sun, Moon, Languages, Bot, Sparkles, Route, QrCode } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  liveBusesCount: number;
  onOpenAICustomerCare: () => void;
  onOpenQRScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  liveBusesCount,
  onOpenAICustomerCare,
  onOpenQRScanner
}) => {
  const t = getT(lang);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Bus },
    { id: 'planner', label: t.navPlanner, icon: Route },
    { id: 'tracking', label: t.navLiveTracking, icon: Compass, badge: liveBusesCount },
    { id: 'search', label: t.navSearchBuses, icon: Search },
    { id: 'booking', label: t.navBookTickets, icon: Ticket },
    { id: 'directory', label: t.navDirectory, icon: MapPin },
    { id: 'nearby', label: t.navNearby, icon: Compass },
    { id: 'driver', label: t.navDriverApp, icon: Smartphone },
    { id: 'admin', label: t.navAdmin, icon: ShieldCheck },
    { id: 'profile', label: t.navProfile, icon: User }
  ];

  return (
    <>
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Government Authority Bar */}
        <div className="bg-red-700 text-white text-xs px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold tracking-wider">KSRTC</span>
            <span className="hidden sm:inline text-red-200">|</span>
            <span className="truncate text-red-100">{t.motto}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-[11px] text-red-200">AWATAR 2.0 & AIS-140 GPS Integrated</span>
            <button
              onClick={onToggleLang}
              className="px-2 py-0.5 rounded text-xs font-semibold bg-red-800 hover:bg-red-900 text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
            <button
              onClick={onToggleTheme}
              className="p-1 rounded text-red-100 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Desktop Top Bar Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <button 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                {lang === 'kn' ? 'ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ' : 'KSRTC'}{' '}
                <span className="text-red-600 dark:text-red-500 font-bold">Smart Bus</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                {lang === 'kn' ? 'ಲೈವ್ ಬಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ & ಬುಕಿಂಗ್' : 'Where Is My Bus & Ticket Reservation'}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navItems.slice(0, 9).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile & AI Assistant actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAICustomerCare}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-slate-900 text-white font-extrabold text-xs shadow-md shadow-red-600/20 hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer border border-red-500/30"
              title="Open KSRTC Sahayaka AI Customer Care"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{lang === 'kn' ? 'AI ಸಹಾಯಕ' : 'AI Customer Care'}</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                Voice/Doubts
              </span>
            </button>

            {onOpenQRScanner && (
              <button
                onClick={onOpenQRScanner}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={t.scanTicketSubtitle}
              >
                <QrCode className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="hidden sm:inline">{t.navScanTicket}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('profile')}
              className={`p-2 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                currentTab === 'profile'
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navProfile}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar (Ergonomic Thumb-zone) */}
      <nav 
        aria-label="Mobile Navigation"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {[
            { id: 'home', label: t.navHome, icon: Bus },
            { id: 'tracking', label: t.navLiveTracking, icon: Compass, badge: liveBusesCount },
            { id: 'search', label: t.navSearchBuses, icon: Search },
            { id: 'booking', label: t.navBookTickets, icon: Ticket },
            { id: 'directory', label: lang === 'kn' ? 'ಗ್ರಾಮಗಳು' : 'Directory', icon: MapPin }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
                  isActive ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-red-600 text-white leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
