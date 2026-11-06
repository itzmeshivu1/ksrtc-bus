import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  IndianRupee, 
  ShieldCheck, 
  Clock, 
  Bus, 
  MapPin, 
  Compass, 
  Ticket, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { Language, LiveBusTracking, KSRTCRoute, BusSchedule } from '../types';
import { getT } from '../data/translations';

interface AICustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onTrackBus?: (busNumber: string) => void;
  onSelectScheduleForBooking?: (schedule: BusSchedule, route: KSRTCRoute) => void;
  onNavigateTab?: (tab: string) => void;
  buses?: LiveBusTracking[];
  routes?: KSRTCRoute[];
  schedules?: BusSchedule[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ actionType: string; label: string; payload?: any }>;
}

export const AICustomerCareModal: React.FC<AICustomerCareModalProps> = ({
  isOpen,
  onClose,
  lang,
  onTrackBus,
  onSelectScheduleForBooking,
  onNavigateTab,
  buses = [],
  routes = [],
  schedules = []
}) => {
  const t = getT(lang);

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'refund' | 'voice_finder' | 'policies'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init_welcome',
      sender: 'ai',
      text: lang === 'kn'
        ? `ನಮಸ್ಕಾರ! ನಾನು **ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಸಹಾಯಕ** (KSRTC AI Assistant).\n\nನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n- ಟಿಕೆಟ್ ರದ್ದತಿ ಮತ್ತು ಮರುಪಾವತಿ ಲೆಕ್ಕಾಚಾರ (Refund Calculation)\n- ಶಕ್ತಿ ಯೋಜನೆ ಮಹಿಳೆಯರ ಉಚಿತ ಪ್ರಯಾಣದ ನಿಯಮಗಳು\n- ಲಭ್ಯವಿರುವ ಬಸ್‌ಗಳು ಮತ್ತು ಗ್ರಾಮ ಸಾರಿಗೆ ವಿವರಗಳು\n- ಲೈವ್ ಬಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ & ಧರ್ಮಸ್ಥಳ, ಹಳೇಬೀಡು, ಹಂಪಿ ಮಾರ್ಗಗಳು\n\nಧ್ವನಿಯ ಮೂಲಕ (Voice) ಅಥವಾ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ!`
        : `Namaskara! I am **KSRTC Sahayaka AI**, your official customer care & transport advisor.\n\nI can clarify your doubts on:\n- **Ticket Cancellation & Exact Refund Calculations**\n- **Shakti Scheme Rules for Women Travelers**\n- **Available Buses, Timings & Grama Sarige Feeder Routes**\n- **Live GPS Tracking & Luggage Rules**\n\nAsk me via voice recognition or type your doubt below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { actionType: 'quick_refund', label: lang === 'kn' ? 'ಮರುಪಾವತಿ ಲೆಕ್ಕಾಚಾರ' : 'Calculate Refund Amount' },
        { actionType: 'quick_shakti', label: lang === 'kn' ? 'ಶಕ್ತಿ ಯೋಜನೆ ನಿಯಮಗಳು' : 'Shakti Scheme Rules' },
        { actionType: 'quick_buses', label: lang === 'kn' ? 'ಬೆಂಗಳೂರು-ಧರ್ಮಸ್ಥಳ ಬಸ್' : 'Buses to Dharmasthala' },
        { actionType: 'quick_airavat', label: lang === 'kn' ? 'ಐರಾವತ vs ಅಂಬಾರಿ ವ್ಯತ್ಯಾಸ' : 'Airavat vs Ambari Class' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refund Calculator state
  const [calcFare, setCalcFare] = useState<number>(500);
  const [calcTimeWindow, setCalcTimeWindow] = useState<string>('MORE_THAN_72');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeSubTab]);

  // Clean speech synthesis when closed
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech Recognition Handler
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        lang === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ವಾಯ್ಸ್ ರೆಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.'
          : 'Speech recognition is not supported in this browser. Please type your query.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically handle voice query
        handleSend(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechError(
          event.error === 'not-allowed'
            ? 'Microphone permission denied. Enable microphone access in browser settings.'
            : `Voice error: ${event.error}`
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting symbols
    const cleanText = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Send message to Gemini AI backend
  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai/customer-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          lang
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Thank you for contacting KSRTC Customer Care.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Customer care query failed:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text:
          lang === 'kn'
            ? `ಕ್ಷಮಿಸಿ, ಜಾಲಬಂಧ ಸಮಸ್ಯೆಯಿಂದ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.\n\n**ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಅಧಿಕೃತ ನಿಯಮಗಳು**:\n- ಮರುಪಾವತಿ: 72 ಗಂಟೆಗಳ ಮೊದಲು 90%, 72-24 ಗಂಟೆ ಮೊದಲು 85%, 24-2 ಗಂಟೆ ಮೊದಲು 75%.\n- ಮಹಿಳೆಯರಿಗೆ ಶಕ್ತಿ ಯೋಜನೆಯಡಿ ಸಾಮಾನ್ಯ ಬಸ್‌ಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರಯಾಣ.\n- 24x7 ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ: 080-49596666 / 080-26252625.`
            : `I experienced a connectivity delay, but here are the official KSRTC customer care policies:\n- **Refunds**: >72h = 90%, 72-24h = 85%, 24-2h = 75%, <2h = No refund.\n- **Women Free Travel**: Valid on all Karnataka Sarige services with domicile photo ID.\n- **24/7 Helpline**: 080-49596666 / 080-26252625.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { actionType: 'refund_table', label: 'View Refund Rules' },
          { actionType: 'search_buses', label: 'Find Buses' }
        ]
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action chip clicks
  const handleActionClick = (action: { actionType: string; label: string; payload?: any }) => {
    if (action.actionType === 'quick_refund') {
      setActiveSubTab('refund');
      return;
    }
    if (action.actionType === 'quick_shakti') {
      handleSend(lang === 'kn' ? 'ಶಕ್ತಿ ಯೋಜನೆಯ ಮಹಿಳೆಯರ ಉಚಿತ ಪ್ರಯಾಣದ ಸಂಪೂರ್ಣ ನಿಯಮಗಳೇನು?' : 'What are the complete rules and valid ID cards for Shakti Scheme free travel?');
      return;
    }
    if (action.actionType === 'quick_buses') {
      handleSend(lang === 'kn' ? 'ಬೆಂಗಳೂರಿನಿಂದ ಧರ್ಮಸ್ಥಳಕ್ಕೆ ಯಾವ ಬಸ್‌ಗಳು ಲಭ್ಯವಿದೆ?' : 'Which buses run from Bengaluru to Dharmasthala Kshetra and what is the fare?');
      return;
    }
    if (action.actionType === 'quick_airavat') {
      handleSend(lang === 'kn' ? 'ಐರಾವತ ಕ್ಲಬ್ ಕ್ಲಾಸ್ ಮತ್ತು ಅಂಬಾರಿ ಉತ್ಸವ ಬಸ್‌ಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?' : 'What is the difference in amenities between Airavat Club Class and Ambari Utsav Sleeper?');
      return;
    }
    if (action.actionType === 'navigate_tracking') {
      onClose();
      if (onNavigateTab) onNavigateTab('tracking');
      return;
    }
    if (action.actionType === 'navigate_search') {
      onClose();
      if (onNavigateTab) onNavigateTab('search');
      return;
    }
    if (action.actionType === 'navigate_directory') {
      onClose();
      if (onNavigateTab) onNavigateTab('directory');
      return;
    }
    if (action.actionType === 'navigate_booking_history') {
      onClose();
      if (onNavigateTab) onNavigateTab('booking');
      return;
    }

    // Default trigger message
    handleSend(action.label);
  };

  // Refund Calculation logic
  const calculateRefund = () => {
    let deductionPercentage = 10;
    if (calcTimeWindow === 'MORE_THAN_72') deductionPercentage = 10;
    else if (calcTimeWindow === 'BETWEEN_72_AND_24') deductionPercentage = 15;
    else if (calcTimeWindow === 'BETWEEN_24_AND_2') deductionPercentage = 25;
    else if (calcTimeWindow === 'LESS_THAN_2') deductionPercentage = 100;

    const cancellationCharge = Math.round((calcFare * deductionPercentage) / 100);
    const refundAmount = Math.max(0, calcFare - cancellationCharge);
    return { deductionPercentage, cancellationCharge, refundAmount };
  };

  const refundDetails = calculateRefund();

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl h-[90vh] max-h-[760px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {lang === 'kn' ? 'ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಸಹಾಯಕ AI' : 'KSRTC Sahayaka AI Customer Care'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-red-100 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {lang === 'kn' ? 'ಅಧಿಕೃತ ಗ್ರಾಹಕ ಸೇವೆ • ವಾಯ್ಸ್ & ಮರುಪಾವತಿ ನೆರವು' : 'Official Passenger Doubts, Refund Calculator & Voice Assistant'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close customer care modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'AI ಚಾಟ್ & ಸಂದೇಹ ನಿವಾರಣೆ' : 'AI Doubts & Chat'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('refund')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'refund'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಮರುಪಾವತಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Refund Calculator'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'policies'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಶಕ್ತಿ ಯೋಜನೆ & ನಿಯಮಾವಳಿ' : 'Shakti Scheme & FAQ'}</span>
          </button>
        </div>

        {/* TAB 1: CHAT & VOICE INTERACTION */}
        {activeSubTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Scrollable Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {msg.sender === 'user' ? (lang === 'kn' ? 'ನೀವು' : 'You') : 'KSRTC Sahayaka AI'}
                    </span>
                    <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-red-600 text-white shadow-md rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 shadow-sm rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* AI Message Action Bar (Text-to-Speech + Action Buttons) */}
                    {msg.sender === 'ai' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => speakText(msg.text)}
                          className="px-2 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Read out message aloud in voice"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                              <span className="text-red-600">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen Aloud</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action)}
                          className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit text-xs text-slate-500">
                  <Bot className="w-4 h-4 text-red-600 animate-spin" />
                  <span>KSRTC Sahayaka AI is thinking and retrieving live transport data...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Speech error notification */}
            {speechError && (
              <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <span>{speechError}</span>
                <button
                  onClick={() => setSpeechError(null)}
                  className="font-bold underline text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Voice input banner if currently recording */}
            {isListening && (
              <div className="px-4 py-2 bg-red-600 text-white text-xs flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span className="font-bold">
                    {lang === 'kn' ? 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ' : 'Listening... Speak your bus query or doubt clearly'}
                  </span>
                </div>
                <button
                  onClick={toggleListening}
                  className="px-2 py-0.5 rounded bg-white text-red-700 font-bold text-[10px]"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {/* Input Controls */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-bounce'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'
                  }`}
                  title={lang === 'kn' ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice Query)' : 'Voice Recognition (Speak in English or Kannada)'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  placeholder={
                    lang === 'kn'
                      ? 'ಪ್ರಶ್ನೆ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ (ಉದಾ: ಮರುಪಾವತಿ ನಿಯಮಗಳು, ಧರ್ಮಸ್ಥಳ ಬಸ್)...'
                      : 'Ask doubt or speak (e.g. "Refund for ₹480 ticket", "Shakti pass rules")...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE REFUND CALCULATOR */}
        {activeSubTab === 'refund' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 text-red-600" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'kn' ? 'ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ಅಧಿಕೃತ ಮರುಪಾವತಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Official KSRTC Refund & Cancellation Calculator'}
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Calculate the exact amount you will get back when cancelling an electronic ticket, verified by KSRTC rules.
              </p>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ticket Fare Paid (₹):
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={calcFare}
                      onChange={(e) => setCalcFare(Number(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cancellation Timing:
                  </label>
                  <select
                    value={calcTimeWindow}
                    onChange={(e) => setCalcTimeWindow(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="MORE_THAN_72">More than 72 hours before departure (10% fee)</option>
                    <option value="BETWEEN_72_AND_24">Between 72 and 24 hours before (15% fee)</option>
                    <option value="BETWEEN_24_AND_2">Between 24 and 2 hours before (25% fee)</option>
                    <option value="LESS_THAN_2">Under 2 hours or after departure (No refund)</option>
                  </select>
                </div>
              </div>

              {/* Computed Refund Display Card */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/40 dark:via-slate-800 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Deduction</div>
                    <div className="text-xl font-black text-amber-600 mt-1 font-mono">
                      {refundDetails.deductionPercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Cancellation Fee</div>
                    <div className="text-xl font-black text-rose-600 mt-1 font-mono">
                      ₹{refundDetails.cancellationCharge}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Net Refund Amount</div>
                    <div className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">
                      ₹{refundDetails.refundAmount}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Refund processed to original source account within 3–5 working days.</span>
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateTab) onNavigateTab('booking');
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>My Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Official Cancellation Slab Reference Table */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                KSRTC Official Cancellation Tariff Slabs
              </h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">&gt; 72 hours before departure</span>
                  <span className="font-mono font-bold text-emerald-600">90% Refund (10% deduction)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">72 to 24 hours before departure</span>
                  <span className="font-mono font-bold text-emerald-600">85% Refund (15% deduction)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">24 to 2 hours before departure</span>
                  <span className="font-mono font-bold text-amber-600">75% Refund (25% deduction)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Less than 2 hours or after departure</span>
                  <span className="font-mono font-bold text-rose-600">0% Refund (Non-refundable)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Bus breakdown or KSRTC cancellation</span>
                  <span className="font-mono font-bold text-emerald-600">100% Full Refund (0% deduction)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHAKTI SCHEME & POLICIES FAQ */}
        {activeSubTab === 'policies' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಶಕ್ತಿ ಯೋಜನೆ ನಿಯಮಗಳು' : 'Government of Karnataka Shakti Scheme (Free Travel for Women)'}
                </h4>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                <li><strong>Eligible Beneficiaries</strong>: All women, girl students, and transgender persons who are residents/domicile of Karnataka.</li>
                <li><strong>Applicable Bus Categories</strong>: Karnataka Sarige (Red Buses), City Transport Services, Ordinary and Rural Feeder services.</li>
                <li><strong>Non-Applicable Services</strong>: Luxury AC coaches (Airavat Club Class, Ambari Dream Class, Ambari Utsav, EV Power Plus, Flybus, Rajahamsa).</li>
                <li><strong>Mandatory Requirement</strong>: Must show original Government of Karnataka photo ID (Aadhaar Card with Karnataka address, Voter ID, Ration Card, or Driving License) to the conductor to receive a zero-fare ticket.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                Luggage, Pets & Passenger Amenities
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                <li><strong>Free Luggage</strong>: Up to 30 kg per adult passenger. Excess luggage is charged as per conductor luggage billing table.</li>
                <li><strong>Pets Policy</strong>: Pets are allowed only in Non-AC Sarige buses with an accompaniment dog ticket. Not permitted in AC luxury services.</li>
                <li><strong>Boarding Point Modification</strong>: Permitted free of charge up to 2 hours before the scheduled bus start time via the portal.</li>
                <li><strong>Senior Citizens Concession</strong>: 25% fare discount for Karnataka residents aged 60+ on presenting Senior Citizen Identity Card.</li>
              </ul>
            </div>

            {/* Official KSRTC Contact Desk */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase text-red-200">24x7 KSRTC Call Center</div>
                <div className="text-lg font-black font-mono">080-49596666 / 080-26252625</div>
                <div className="text-xs text-red-100">Email: ksrtc@karnataka.gov.in • AWATAR 2.0</div>
              </div>
              <a
                href="tel:08049596666"
                className="px-4 py-2 rounded-xl bg-white text-red-700 font-bold text-xs shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
