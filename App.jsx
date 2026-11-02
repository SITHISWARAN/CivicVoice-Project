import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, AudioLines, Check, CheckCircle2, ChevronDown, CircleHelp,
  Clock3, Copy, FileText, Headphones, LocateFixed, MapPin, Mic, MicOff, Navigation,
  Pause, Play, Plus, Radio, RefreshCw, Search, Send, ShieldCheck, Sparkles, Volume2,
  Waves, X, Zap, Moon, Sun
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

const API = '/api';
const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect (recommended)', tag: 'AUTO', tts: 'auto' },
  { value: 'ta-IN', label: 'Tamil', tag: 'தமிழ்', tts: 'ta-IN' },
  { value: 'ta-Latn', label: 'Tanglish', tag: 'TA + EN', tts: 'ta-IN' },
  { value: 'te-IN', label: 'Telugu', tag: 'తెలుగు', tts: 'te-IN' },
  { value: 'te-Latn', label: 'Telugish', tag: 'TE + EN', tts: 'te-IN' },
  { value: 'en-IN', label: 'English', tag: 'EN', tts: 'en-IN' },
];
const CATEGORY_OPTIONS = ['Streetlight', 'Water supply', 'Water quality', 'Water leakage', 'Drainage', 'Open manhole', 'Stormwater flooding', 'Garbage', 'Illegal dumping', 'Pothole', 'Road damage', 'Road obstruction', 'Road signage', 'Illegal parking', 'Footpath damage', 'Power outage', 'Traffic signal', 'Public toilet', 'Public transport facility', 'Mosquito nuisance', 'Stray animals', 'Fallen tree', 'Construction debris', 'Air pollution', 'Noise nuisance', 'Park maintenance', 'Public infrastructure', 'Public safety', 'Other'];
const DEFAULT_CENTER = [13.0850, 80.2101];
const PRESET_LOCATIONS = [
  { id: 'anna-nagar-second-street', label: 'Anna Nagar · 2nd Street', address: 'Anna Nagar 2nd Street, Anna Nagar, Chennai, Tamil Nadu, India', lat: 13.08518, lng: 80.21022 },
  { id: 'mogappair-main-road', label: 'Mogappair · Main Road', address: 'Mogappair Main Road, Mogappair, Chennai, Tamil Nadu, India', lat: 13.08350, lng: 80.17650 },
];
const CATEGORY_COLORS = {
  Streetlight: '#f59e0b', 'Water supply': '#0ea5e9', 'Water quality': '#06b6d4', 'Water leakage': '#38bdf8', Garbage: '#34d399', 'Illegal dumping': '#059669', Pothole: '#fb7185',
  Drainage: '#818cf8', 'Open manhole': '#7c3aed', 'Stormwater flooding': '#2563eb', 'Road damage': '#d97706', 'Road obstruction': '#b45309', 'Road signage': '#a16207', 'Illegal parking': '#c2410c', 'Footpath damage': '#a78bfa',
  'Power outage': '#eab308', 'Traffic signal': '#f97316', 'Public toilet': '#14b8a6', 'Public transport facility': '#0891b2', 'Mosquito nuisance': '#84cc16',
  'Stray animals': '#c084fc', 'Fallen tree': '#16a34a', 'Construction debris': '#78716c', 'Air pollution': '#6b7280', 'Noise nuisance': '#64748b',
  'Park maintenance': '#22c55e', 'Public infrastructure': '#475569', 'Public safety': '#f43f5e', Other: '#94a3b8'
};
const HELLO = {
  'ta-IN': ['வணக்கம்! என்ன பிரச்சினை? சொல்லுங்கள்.', 'வணக்கம்! என்ன உதவி தேவை என்று கூறுங்கள்.', 'வணக்கம்! உங்கள் பகுதியில் என்ன சிக்கல் இருக்கிறது?'],
  'ta-Latn': ['வணக்கம்! என்ன பிரச்சினை? சொல்லுங்கள்.', 'வணக்கம்! என்ன உதவி தேவை என்று கூறுங்கள்.', 'வணக்கம்! உங்கள் பகுதியில் என்ன சிக்கல் இருக்கிறது?'],
  'te-IN': ['నమస్కారం! ఏం సమస్య? చెప్పండి.', 'నమస్కారం! మీకు ఏ సహాయం కావాలి?', 'నమస్కారం! మీ ప్రాంతంలో ఏమి సమస్య ఉంది?'],
  'te-Latn': ['నమస్కారం! ఏం సమస్య? చెప్పండి.', 'నమస్కారం! మీకు ఏ సహాయం కావాలి?', 'నమస్కారం! మీ ప్రాంతంలో ఏమి సమస్య ఉంది?'],
  'en-IN': ['Hello! What happened? Tell me in your own words.', 'Hello! What problem can I help you report today?', 'Hi there. Tell me what is happening in your neighbourhood.']
};
const CATEGORY_WORDS = {
  Streetlight: 'Streetlight / தெரு விளக்கு / వీధి లైట్', 'Water supply': 'Water supply / குடிநீர் / నీటి సరఫరా', 'Water quality': 'Water quality / குடிநீர் தரம் / తాగునీటి నాణ్యత', 'Water leakage': 'Water leakage / தண்ணீர் கசிவு / నీటి లీక్',
  Garbage: 'Garbage / குப்பை / చెత్త', 'Illegal dumping': 'Illegal dumping / குப்பை கொட்டுதல் / అక్రమ చెత్త వేయడం', Pothole: 'Pothole / சாலை பள்ளம் / రోడ్డు గుంత', Drainage: 'Drainage / வடிகால் / డ్రైనేజీ', 'Open manhole': 'Open manhole / திறந்த மேன்ஹோல் / మ్యాన్‌హోల్ మూత లేదు',
  'Stormwater flooding': 'Flooding / மழைநீர் தேக்கம் / వరద', 'Road damage': 'Road damage / சாலை சேதம்', 'Road obstruction': 'Road obstruction / சாலை தடங்கல் / రహదారి అడ్డంకి', 'Road signage': 'Road signage / சாலை பெயர் பலகை / రోడ్ సైన్', 'Illegal parking': 'Illegal parking / தவறான வாகன நிறுத்தம் / తప్పు పార్కింగ్', 'Footpath damage': 'Footpath / நடைபாதை',
  'Power outage': 'Power outage / மின்தடை / విద్యుత్ అంతరాయం', 'Traffic signal': 'Traffic signal / போக்குவரத்து சிக்னல்',
  'Public toilet': 'Public toilet / பொது கழிப்பறை', 'Public transport facility': 'Bus stop / பேருந்து நிறுத்தம் / బస్ స్టాప్', 'Mosquito nuisance': 'Mosquito nuisance / கொசு தொல்லை', 'Stray animals': 'Stray animals / தெரு விலங்குகள்',
  'Fallen tree': 'Fallen tree / விழுந்த மரம்', 'Construction debris': 'Construction debris / கட்டுமானக் கழிவு', 'Air pollution': 'Air pollution / காற்று மாசு / వాయు కాలుష్యం', 'Noise nuisance': 'Noise nuisance / சத்தத் தொல்லை',
  'Park maintenance': 'Park maintenance / பூங்கா பராமரிப்பு', 'Public infrastructure': 'Public infrastructure / பொது வசதிகள் / ప్రజా సదుపాయాలు', 'Public safety': 'Public safety / பாதுகாப்பு / భద్రత', Other: 'Other'
};

function localeFor(language) {
  const value = String(language || 'en-IN');
  if (value.startsWith('ta')) return 'ta-IN';
  if (value.startsWith('te')) return 'te-IN';
  return 'en-IN';
}
function initialDraft() {
  return { category: '', description: '', durationText: '', durationDays: null, address: '', lat: null, lng: null, locationConfirmed: false, safetyRisk: null, urgency: 'standard' };
}
function timeAgo(date) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center?.length === 2 && center.every(Number.isFinite)) map.setView(center, 14, { animate: true }); }, [center, map]);
  return null;
}
function ClickableMap({ enabled, onPick }) {
  useMapEvents({ click(event) { if (enabled) onPick(event.latlng); } });
  return null;
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = window.localStorage.getItem('civicvoice-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch { return 'light'; }
  });
  const [language, setLanguage] = useState('auto');
  const [detectedLanguage, setDetectedLanguage] = useState('ta-IN');
  const [lastDetection, setLastDetection] = useState({ language: '', confidence: '', candidatesSucceeded: 0 });
  const [transcriptReview, setTranscriptReview] = useState(null);
  const [reviewTranscript, setReviewTranscript] = useState('');
  const [reviewLanguage, setReviewLanguage] = useState('ta-IN');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [stage, setStage] = useState('complaint');
  const [voiceState, setVoiceState] = useState('ready');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState(initialDraft);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, recurring: 0, inProgress: 0, resolved: 0 });
  const [apiHealth, setApiHealth] = useState({ ok: false, apiKeyConfigured: false });
  const [notice, setNotice] = useState('');
  const [locationStatus, setLocationStatus] = useState({ kind: 'idle', text: 'Location not shared yet' });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapPickMode, setMapPickMode] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [statusLookup, setStatusLookup] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [activeView, setActiveView] = useState('assistant');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedComplaint, setSavedComplaint] = useState(null);
  const [showAllReports, setShowAllReports] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const speechRequestRef = useRef(0);
  const playbackCancelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const conversationListRef = useRef(null);
  const voiceStartInProgressRef = useRef(false);
  const activeLanguage = language === 'auto' ? detectedLanguage : localeFor(language);
  const stateRef = useRef({ draft, stage, language, activeLanguage });
  stateRef.current = { draft, stage, language, activeLanguage };

  const langOption = LANGUAGES.find(item => item.value === language) || LANGUAGES[0];
  const uiLocale = activeLanguage;

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, complaintsRes, statsRes] = await Promise.all([
        fetch(`${API}/health`), fetch(`${API}/complaints`), fetch(`${API}/stats`)
      ]);
      if (healthRes.ok) setApiHealth(await healthRes.json());
      if (complaintsRes.ok) setComplaints((await complaintsRes.json()).complaints || []);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      setApiHealth({ ok: false, apiKeyConfigured: false });
      setNotice('Backend not connected. Start the API server and refresh the page.');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const handleKeyDown = event => { if (event.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);
  useEffect(() => {
    try { window.localStorage.setItem('civicvoice-theme', theme); } catch { /* storage may be disabled */ }
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = theme;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0a1220' : '#f3f6fb');
    }
  }, [theme]);
  useEffect(() => {
    // Scroll only the message viewport. scrollIntoView also moves the whole page,
    // which made the mic and composer jump out of view after every spoken turn.
    const viewport = conversationListRef.current;
    if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages, voiceState]);
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
    window.speechSynthesis?.cancel();
  }, []);

  const pushMessage = useCallback((role, text, extra = {}) => {
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text, createdAt: new Date().toISOString(), ...extra };
    setMessages(prev => [...prev, item]);
    return item;
  }, []);

  const browserSpeak = useCallback((text, locale) => new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale || 'en-IN';
    utterance.rate = 1.0;
    const availableVoices = window.speechSynthesis.getVoices();
    const preferredVoice = availableVoices.find(voice => voice.lang?.toLowerCase() === String(locale || 'en-IN').toLowerCase())
      || availableVoices.find(voice => voice.lang?.toLowerCase().startsWith(String(locale || 'en-IN').slice(0, 2).toLowerCase()));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  }), []);

  const speakText = useCallback(async (text, messageId = null, chosenLanguage = activeLanguage) => {
    if (!text) return;

    // A single speech request owns playback at a time. This also prevents an older
    // pending TTS response from starting after a newer response has begun.
    const requestId = ++speechRequestRef.current;
    const isCurrentRequest = () => requestId === speechRequestRef.current;
    const cancelPendingPlayback = playbackCancelRef.current;
    playbackCancelRef.current = null;
    if (cancelPendingPlayback) cancelPendingPlayback();

    const previousAudio = audioRef.current;
    if (previousAudio) {
      const previousUrl = previousAudio.src;
      previousAudio.onended = null;
      previousAudio.onerror = null;
      previousAudio.onabort = null;
      previousAudio.pause();
      previousAudio.removeAttribute('src');
      previousAudio.load();
      if (previousUrl.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
      audioRef.current = null;
    }
    // Never allow browser speech and Gnani audio to overlap.
    window.speechSynthesis?.cancel();

    const apiLanguage = localeFor(chosenLanguage);
    setVoiceState('speaking');
    setPlayingMessageId(messageId);

    const releaseAudio = (audio) => {
      if (!audio) return;
      const url = audio.src;
      audio.onended = null;
      audio.onerror = null;
      audio.onabort = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      if (audioRef.current === audio) audioRef.current = null;
    };

    try {
      const response = await fetch(`${API}/tts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: apiLanguage })
      });
      if (!isCurrentRequest()) return;
      if (!response.ok) {
        let error = 'Gnani TTS is not available.';
        try { error = (await response.json()).error || error; } catch { /* use generic error */ }
        throw new Error(error);
      }

      const blob = await response.blob();
      if (!isCurrentRequest()) return;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.preload = 'auto';
      // Let Timbre control pacing; changing playback rate can distort pitch.
      audio.playbackRate = 1.0;
      if ('preservesPitch' in audio) audio.preservesPitch = true;
      audioRef.current = audio;

      // Route playback errors through one rejected promise. Previously both the
      // audio.onerror handler and audio.play() catch could launch browser TTS,
      // causing the same response to be spoken twice.
      await new Promise((resolve, reject) => {
        let settled = false;
        let cancelThisPlayback;
        const finish = (error = null) => {
          if (settled) return;
          settled = true;
          audio.onended = null;
          audio.onerror = null;
          audio.onabort = null;
          if (playbackCancelRef.current === cancelThisPlayback) playbackCancelRef.current = null;
          if (error) reject(error);
          else resolve();
        };
        cancelThisPlayback = () => finish(new Error('Speech playback cancelled.'));
        playbackCancelRef.current = cancelThisPlayback;
        audio.onended = () => finish();
        audio.onerror = () => finish(new Error('Gnani audio playback failed.'));
        audio.onabort = () => finish(new Error('Speech playback was interrupted.'));
        audio.play().catch(error => finish(error || new Error('Audio playback failed.')));
      });

      if (!isCurrentRequest()) return;
      releaseAudio(audio);
      setVoiceState('ready');
      setPlayingMessageId(null);
    } catch (error) {
      if (!isCurrentRequest()) return;
      if (audioRef.current) releaseAudio(audioRef.current);
      if (playbackCancelRef.current) playbackCancelRef.current = null;
      setNotice(`${error.message || 'Gnani audio playback failed.'} Using browser voice fallback when available.`);
      // This is the only fallback call for a failed TTS request.
      await browserSpeak(text, apiLanguage);
      if (!isCurrentRequest()) return;
      setVoiceState('ready');
      setPlayingMessageId(null);
    }
  }, [activeLanguage, browserSpeak]);

  const say = useCallback(async (text, extra = {}, spokenLanguage = null) => {
    const msg = pushMessage('assistant', text, extra);
    await speakText(text, msg.id, spokenLanguage || stateRef.current.activeLanguage);
    return msg;
  }, [pushMessage, speakText]);

  const startSession = async () => {
    if (sessionStarted) return;
    setSessionStarted(true);
    setNotice('');
    const greetingChoices = language === 'auto' ? HELLO['ta-IN'] : (HELLO[language] || HELLO[activeLanguage] || HELLO['en-IN']);
    const greeting = Array.isArray(greetingChoices)
      ? greetingChoices.filter(item => item !== messages[messages.length - 1]?.text)[Math.floor(Math.random() * Math.max(1, greetingChoices.filter(item => item !== messages[messages.length - 1]?.text).length))] || greetingChoices[0]
      : greetingChoices;
    await say(greeting, { kind: 'greeting' }, language === 'auto' ? 'ta-IN' : activeLanguage);
  };

  const stopCurrentAudio = () => {
    speechRequestRef.current += 1;
    const cancelPendingPlayback = playbackCancelRef.current;
    playbackCancelRef.current = null;
    if (cancelPendingPlayback) cancelPendingPlayback();
    if (audioRef.current) {
      const audio = audioRef.current;
      const url = audio.src;
      audio.onended = null;
      audio.onerror = null;
      audio.onabort = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setVoiceState('ready');
    setPlayingMessageId(null);
  };

  const centerOnLocation = (lat, lng) => setMapCenter([lat, lng]);

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const text = 'This browser does not support geolocation. Search or pin a location manually.';
      setLocationStatus({ kind: 'error', text });
      if (sessionStarted) await say(activeLanguage.startsWith('te') ? 'ఈ బ్రౌజర్ లొకేషన్ పొందలేకపోయింది. చిరునామా వెతకండి లేదా మ్యాప్‌లో పిన్ పెట్టండి.' : activeLanguage.startsWith('ta') ? 'இந்த உலாவியில் இருப்பிடத்தைப் பெற முடியவில்லை. முகவரியைத் தேடுங்கள் அல்லது வரைபடத்தில் பின் வையுங்கள்.' : text);
      return;
    }
    setLocationStatus({ kind: 'loading', text: 'Requesting device location permission…' });
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude, lng = position.coords.longitude;
      const updated = { ...stateRef.current.draft, address: 'Current device location', lat, lng, locationConfirmed: true };
      setDraft(updated);
      centerOnLocation(lat, lng);
      setLocationStatus({ kind: 'success', text: `Location permission granted · accuracy ±${Math.round(position.coords.accuracy)} m · selected for this complaint` });
      setMapPickMode(false);
      const next = getNextStage(updated);
      setStage(next);
      if (sessionStarted) await say(activeLanguage === 'en-IN'
        ? `Current device location selected (accuracy about ${Math.round(position.coords.accuracy)} metres). You can change the pin on the map. ${promptForStage(next, updated, activeLanguage)}`
        : activeLanguage.startsWith('te')
          ? `మీ ప్రస్తుత లొకేషన్ ఎంచుకున్నాను. మ్యాప్‌లో మార్చవచ్చు. ${promptForStage(next, updated, activeLanguage)}`
          : language.endsWith('Latn')
            ? `Current location select panniten. Map-la pin change pannalaam. ${promptForStage(next, updated, activeLanguage)}`
            : `உங்கள் தற்போதைய இருப்பிடம் தேர்ந்தெடுக்கப்பட்டது. வரைபடத்தில் மாற்றலாம். ${promptForStage(next, updated, activeLanguage)}`);
    }, async error => {
      const explanation = error.code === 1 ? 'Location permission denied' : error.code === 2 ? 'Location unavailable' : 'Location request timed out';
      setLocationStatus({ kind: 'error', text: `${explanation}. You can still search the address or pin it manually.` });
      setNotice(`${explanation}. Manual location is available.`);
      if (sessionStarted) await say(activeLanguage.startsWith('te') ? 'లొకేషన్ పొందలేకపోయాను. మీరు చిరునామా చెప్పవచ్చు లేదా మ్యాప్‌లో పిన్ పెట్టవచ్చు.' : activeLanguage.startsWith('ta') ? 'இருப்பிடத்தைப் பெற முடியவில்லை. முகவரியைச் சொல்லலாம் அல்லது வரைபடத்தில் பின் வைக்கலாம்.' : 'I could not get your location. Please say the address or choose a pin manually.');
    }, { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 });
  };

  const geocodeAddress = async (query) => {
    const q = /\bindia\b/i.test(query) ? query : `${query}, India`;
    // Do not silently force a citizen's address into Chennai. The map pin is shown for confirmation.
    const response = await fetch(`${API}/geocode?q=${encodeURIComponent(q)}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not search this address.');
    return body.results || [];
  };

  const searchForLocation = async () => {
    if (!searchAddress.trim()) return;
    setSearchingAddress(true);
    setNotice('');
    try {
      const results = await geocodeAddress(searchAddress.trim());
      if (!results.length) throw new Error('No matching location found. Try adding the area, city or a nearby landmark.');
      const best = results[0];
      setDraft(prev => ({ ...prev, address: best.displayName, lat: best.lat, lng: best.lng, locationConfirmed: false }));
      centerOnLocation(best.lat, best.lng);
      setLocationStatus({ kind: 'success', text: 'Address found. Confirm the pin on the map before saving.' });
      setMapPickMode(false);
      setNotice('Check the map pin. Select “Confirm map pin” when the location is correct.');
      if (sessionStarted) {
        setStage('location_confirm');
        await say(activeLanguage.startsWith('te') ? 'ఈ ప్రదేశాన్ని మ్యాప్‌లో కనుగొన్నాను. పిన్ సరైన ప్రదేశంలో ఉందో చూసి నిర్ధారించండి.' : activeLanguage.startsWith('ta') ? 'இந்த இடத்தை வரைபடத்தில் கண்டுபிடித்துள்ளேன். பின் சரியான இடத்தில் உள்ளதா என்று பார்த்து உறுதிப்படுத்துங்கள்.' : 'I found this address. Please verify the map pin and confirm it before continuing.');
      }
    } catch (error) {
      setLocationStatus({ kind: 'error', text: error.message });
      setNotice(error.message);
    } finally { setSearchingAddress(false); }
  };

  const confirmMapPin = async () => {
    if (!Number.isFinite(Number(draft.lat)) || !Number.isFinite(Number(draft.lng))) {
      setNotice('Search an address or click the map to choose a pin first.'); return;
    }
    const updated = { ...draft, locationConfirmed: true };
    setDraft(updated);
    setMapPickMode(false);
    setLocationStatus({ kind: 'success', text: 'Map pin confirmed for this complaint.' });
    const next = getNextStage(updated);
    setStage(next);
    if (next === 'confirm') setShowConfirmDialog(true);
    if (sessionStarted) await say(promptForStage(next, updated, activeLanguage), {}, activeLanguage);
  };

  const choosePresetLocation = async (place) => {
    const updated = { ...stateRef.current.draft, address: place.address, lat: place.lat, lng: place.lng, locationConfirmed: false };
    setDraft(updated);
    centerOnLocation(place.lat, place.lng);
    setMapPickMode(false);
    setStage('location_confirm');
    setLocationStatus({ kind: 'success', text: `Location selected: ${place.label}. Confirm the pin before continuing.` });
    if (sessionStarted) {
      const localizedLabel = activeLanguage.startsWith('ta')
        ? (place.id === 'anna-nagar-second-street' ? 'அண்ணா நகர் இரண்டாவது தெரு' : 'முகப்பேர் மெயின் ரோடு')
        : activeLanguage.startsWith('te')
          ? (place.id === 'anna-nagar-second-street' ? 'అన్నా నగర్ రెండవ వీధి' : 'మొగప్పైర్ మెయిన్ రోడ్')
          : place.label;
      const message = activeLanguage.startsWith('te')
        ? `మ్యాప్‌లో ${localizedLabel} ఎంచుకున్నాను. పిన్ సరైనదో చూసి నిర్ధారించండి.`
        : activeLanguage.startsWith('ta')
          ? `வரைபடத்தில் ${localizedLabel} இடத்தைத் தேர்ந்தெடுத்துள்ளேன். பின் சரியான இடத்தில் உள்ளதா என்று உறுதிப்படுத்துங்கள்.`
          : `I selected ${localizedLabel} on the map. Please confirm that the pin is correct.`;
      await say(message, {}, activeLanguage);
    }
  };

  function getNextStage(value) {
    if (!value.category) return 'complaint';
    if (!value.address || !Number.isFinite(Number(value.lat)) || !Number.isFinite(Number(value.lng)) || !value.locationConfirmed) return 'location';
    if (!value.durationText) return 'duration';
    return 'confirm';
  }
  function promptForStage(next, value, lang) {
    if (next === 'complaint') return lang.startsWith('te') ? 'మీరు ఏ సమస్యను నివేదించాలనుకుంటున్నారు? చెప్పండి.' : lang.startsWith('ta') && lang.endsWith('Latn') ? 'Enna problem report pannanum-nu sollunga.' : lang.startsWith('ta') ? 'என்ன பிரச்சினையைப் புகாராகச் சொல்ல விரும்புகிறீர்கள்?' : 'Tell me what problem you want to report.';
    if (next === 'location') return lang.startsWith('te') ? 'ఈ సమస్య ఏ వీధిలో లేదా ఏ ప్రాంతంలో ఉంది? దగ్గరలోని ల్యాండ్‌మార్క్ చెప్పండి.' : lang.startsWith('ta') ? 'இந்தப் பிரச்சினை எந்தத் தெருவில் அல்லது எந்தப் பகுதியில் உள்ளது? அருகிலுள்ள அடையாளத்தையும் சொல்லுங்கள்.' : 'Which street or area is affected? Please say a nearby landmark if possible.';
    if (next === 'duration') return lang.startsWith('te') ? 'ఈ సమస్య ఎన్ని రోజులుగా లేదా వారాలుగా ఉంది?' : lang.startsWith('ta') ? 'இந்தப் பிரச்சினை எத்தனை நாட்களாக அல்லது வாரங்களாக உள்ளது?' : 'How long has this problem existed?';
    return makeSummary(value, lang);
  }

  const saveComplaint = async (value = draft) => {
    if (!value.category || !value.description || !value.durationText || !value.address || value.lat == null || value.lng == null || !Number.isFinite(Number(value.lat)) || !Number.isFinite(Number(value.lng)) || !value.locationConfirmed) {
      setNotice('Complete the complaint details and confirm the map pin before saving.'); return;
    }
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`${API}/complaints`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...value, confirmed: true })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not save the complaint.');
      const complaint = body.complaint;
      setSavedComplaint({ ...complaint, repeated: body.repeated, matchingCount: body.matchingCount });
      setStage('complete');
      // Keep the completed form visible alongside the generated complaint ID.
      setEditing(false);
      await fetchData();
      const completion = body.repeated
        ? (activeLanguage.startsWith('te') ? `మీ ఫిర్యాదు ${complaint.id} గా CivicVoice‌లో నమోదు అయింది. దగ్గరలోని ${body.matchingCount} ఇలాంటి ఫిర్యాదులను కూడా గుర్తించాను; దీనిని ప్రాధాన్యత సమీక్షకు గుర్తించాను.` : activeLanguage.startsWith('ta') ? `உங்கள் புகார் ${complaint.id} என CivicVoice-ல் பதிவு செய்யப்பட்டது. அருகிலுள்ள ${body.matchingCount} ஒத்த புகார்களையும் கண்டறிந்துள்ளேன்; இதை முன்னுரிமை மதிப்பாய்வுக்குக் குறித்துள்ளேன்.` : `Your complaint ${complaint.id} has been saved in CivicVoice. I found ${body.matchingCount} similar nearby reports and flagged this for priority review.`)
        : (activeLanguage.startsWith('te') ? `మీ ఫిర్యాదు ${complaint.id} గా CivicVoice‌లో సేవ్ అయింది.` : activeLanguage.startsWith('ta') ? `உங்கள் புகார் ${complaint.id} என CivicVoice-ல் பதிவு செய்யப்பட்டது.` : `Your complaint ${complaint.id} has been saved in CivicVoice.`);
      await say(completion, { kind: 'completion', complaintId: complaint.id });
    } catch (error) {
      setNotice(error.message);
    } finally { setBusy(false); }
  };

  const handleTranscript = async (transcript, recognizedLanguage = null) => {
    const { draft: currentDraft, stage: currentStage } = stateRef.current;
    const currentLanguage = recognizedLanguage || stateRef.current.activeLanguage;
    pushMessage('user', transcript, { kind: 'transcript' });
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`${API}/conversation/turn`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, stage: currentStage === 'complete' ? 'complaint' : currentStage, language: currentLanguage, draft: currentDraft })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not process this conversation turn.');
      if (body.classification?.needsReview) {
        const options = (body.classification.candidates || []).map(item => item.category).filter(Boolean).slice(0, 2);
        setNotice(`AI classification needs a quick check${options.length ? `: ${options.join(' or ')}` : ''}. Add one detail or choose the category manually before saving.`);
      }
      let nextDraft = body.draft || currentDraft;
      let nextStage = body.nextStage || currentStage;
      let responseText = body.response || 'Please continue.';

      if (body.action === 'use_location') {
        setBusy(false);
        setStage('location');
        await useCurrentLocation();
        return;
      }
      if (body.action === 'select_location' && body.selectedLocation) {
        const picked = body.selectedLocation;
        nextDraft = { ...nextDraft, address: picked.displayName, lat: Number(picked.lat), lng: Number(picked.lng), locationConfirmed: false };
        nextStage = 'location_confirm';
        centerOnLocation(Number(picked.lat), Number(picked.lng));
        setLocationStatus({ kind: 'success', text: `Location matched: ${picked.shortName || picked.displayName}. Confirm the map pin.` });
        setMapPickMode(false);
        const spokenPlaceLabel = currentLanguage.startsWith('ta')
          ? (picked.id === 'anna-nagar-second-street' ? 'அண்ணா நகர் இரண்டாவது தெரு' : 'முகப்பேர் மெயின் ரோடு')
          : currentLanguage.startsWith('te')
            ? (picked.id === 'anna-nagar-second-street' ? 'అన్నా నగర్ రెండవ వీధి' : 'మొగప్పైర్ మెయిన్ రోడ్')
            : (picked.shortName || picked.displayName);
        responseText = currentLanguage.startsWith('te')
          ? `మ్యాప్‌లో ${spokenPlaceLabel} గుర్తించాను. పిన్ సరైనదో చూసి నిర్ధారించండి.`
          : currentLanguage.startsWith('ta')
            ? `வரைபடத்தில் ${spokenPlaceLabel} இடத்தைக் கண்டறிந்தேன். பின் சரியான இடத்தில் உள்ளதா என்று உறுதிப்படுத்துங்கள்.`
            : `I matched ${spokenPlaceLabel} on the map. Please confirm the pin is correct.`;
      } else if (body.action === 'geocode_location') {
        try {
          const results = await geocodeAddress(nextDraft.address);
          if (!results.length) throw new Error('No address match');
          nextDraft = { ...nextDraft, address: results[0].displayName, lat: results[0].lat, lng: results[0].lng, locationConfirmed: false };
          nextStage = 'location_confirm';
          centerOnLocation(results[0].lat, results[0].lng);
          setLocationStatus({ kind: 'success', text: 'Possible location found. Confirm the pin on the map.' });
          responseText = currentLanguage.startsWith('te') ? 'ఈ ప్రదేశాన్ని మ్యాప్‌లో కనుగొన్నాను. పిన్ సరైనదో చూసి నిర్ధారించండి.' : currentLanguage.startsWith('ta') ? 'இந்த இடத்தை வரைபடத்தில் கண்டுபிடித்துள்ளேன். வரைபடப் பின் சரியான இடத்தில் உள்ளதா என்று உறுதிப்படுத்துங்கள்.' : 'I found a possible location. Please check the map pin and confirm that it is correct.';
        } catch {
          nextStage = 'location';
          responseText = currentLanguage.startsWith('te') ? 'ఆ ప్రదేశాన్ని కనుగొనలేకపోయాను. దగ్గరలోని ల్యాండ్‌మార్క్ చెప్పండి లేదా మ్యాప్‌లో పిన్ పెట్టండి.' : currentLanguage.startsWith('ta') ? 'அந்த இடத்தைக் கண்டுபிடிக்க முடியவில்லை. அருகிலுள்ள அடையாளத்தைச் சொல்லுங்கள் அல்லது வரைபடத்தில் பின் வையுங்கள்.' : 'I could not find that exact location. Try a nearby landmark or place a pin manually.';
          setLocationStatus({ kind: 'error', text: 'Address not found. Try a landmark or choose a pin manually.' });
        }
      }
      setDraft(nextDraft);
      setStage(nextStage);
      if (nextStage === 'confirm' && body.action !== 'confirm') setShowConfirmDialog(true);
      if (body.action === 'cancel') { setShowConfirmDialog(false);
        setDraft(initialDraft()); setStage('complaint'); setSavedComplaint(null); setEditing(false);
        setBusy(false); await say(responseText, {}, currentLanguage); return;
      }
      if (body.action === 'confirm') {
        setShowConfirmDialog(false);
        setBusy(false);
        await saveComplaint(nextDraft);
        return;
      }
      if (body.action === 'show_edit') setEditing(true);
      setBusy(false);
      await say(responseText, {}, currentLanguage);
    } catch (error) {
      setBusy(false);
      setNotice(error.message);
      await say(activeLanguage.startsWith('te') ? 'క్షమించండి, ఈ దశను ప్రాసెస్ చేయలేకపోయాను. మళ్లీ ప్రయత్నించండి లేదా వివరాలను చేతితో సవరించండి.' : activeLanguage.startsWith('ta') ? 'மன்னிக்கவும், இந்தப் படியை செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது விவரங்களை கைமுறையாக மாற்றவும்.' : 'Sorry, I could not process that step. Please retry or edit the details manually.', {}, currentLanguage);
    }
  };

  const transcribeAudio = async (blob) => {
    setVoiceState('processing');
    setBusy(true);
    setNotice('');
    try {
      const form = new FormData();
      form.append('audio', blob, `civicvoice-${Date.now()}.webm`);
      form.append('language', language === 'auto' ? 'auto' : localeFor(language));
      const response = await fetch(`${API}/stt`, { method: 'POST', body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Speech recognition failed.');
      if (!body.transcript?.trim()) throw new Error('I could not hear clear words. Please try again.');
      const resolvedLanguage = body.detectedLanguage || (language === 'auto' ? detectedLanguage : localeFor(language));
      setDetectedLanguage(resolvedLanguage);
      setLastDetection({ language: resolvedLanguage, confidence: body.detectionConfidence || (language === 'auto' ? 'unknown' : 'manual'), candidatesSucceeded: body.candidatesSucceeded || 1 });
      if (language === 'auto' && body.detectionConfidence === 'low') setNotice('Language detection was uncertain. Check the transcript; choose Tamil, Telugu or English manually if it is wrong. Auto-detect may compare language candidates when needed.');
      else if (language === 'auto') setNotice(`Detected ${resolvedLanguage === 'ta-IN' ? 'Tamil' : resolvedLanguage === 'te-IN' ? 'Telugu' : 'English'} from the recording.`);
      const alternatives = (Array.isArray(body.alternatives) ? body.alternatives : [{ transcript: body.transcript.trim(), language: resolvedLanguage }])
        .filter(item => item?.transcript?.trim())
        .filter((item, index, items) => items.findIndex(other => other.transcript.trim() === item.transcript.trim() && other.language === item.language) === index);
      // Keep the interaction conversational: handle good/selected-language transcripts automatically.
      // Only stop for manual review when auto-detection itself is genuinely ambiguous.
      const needsHumanReview = language === 'auto' && body.detectionConfidence === 'low' && alternatives.length > 1;
      if (needsHumanReview) {
        setTranscriptReview({ alternatives, autoDetect: true });
        setReviewTranscript(body.transcript.trim());
        setReviewLanguage(resolvedLanguage);
        setVoiceState('ready');
        setBusy(false);
        setNotice('I’m not fully sure which language result is right. Pick or edit the words below; I’ll continue the conversation after that.');
        return;
      }
      setTranscriptReview(null);
      setReviewTranscript('');
      setVoiceState('ready');
      setBusy(false);
      await handleTranscript(body.transcript.trim(), resolvedLanguage);
    } catch (error) {
      setVoiceState('ready');
      setBusy(false);
      setNotice(error.message);
      await say(activeLanguage.startsWith('te') ? 'క్షమించండి, మీ మాటలను గుర్తించలేకపోయాను. మళ్లీ ప్రయత్నించండి.' : activeLanguage.startsWith('ta') ? 'மன்னிக்கவும், உங்கள் பேச்சைப் புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Sorry, I could not transcribe that recording. Please try again.');
    }
  };

  const applyTranscriptReview = async () => {
    const transcript = reviewTranscript.trim();
    if (!transcript) { setNotice('Transcript is empty. Please edit it or record again.'); return; }
    const spokenLanguage = reviewLanguage || activeLanguage;
    setTranscriptReview(null);
    setNotice('');
    await handleTranscript(transcript, spokenLanguage);
  };

  const cancelTranscriptReview = () => {
    setTranscriptReview(null);
    setReviewTranscript('');
    setNotice('Transcript review cancelled. Your complaint draft was not changed.');
  };

  const startRecording = async (allowFirstSession = false) => {
    // The first tap may greet the user, then proceed into recording on the same toggle.
    if (!sessionStarted && !allowFirstSession) { await startSession(); return; }
    if (voiceState === 'speaking') { stopCurrentAudio(); }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNotice('This browser cannot record audio. Please use a current version of Chrome or Edge over localhost/HTTPS.'); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      chunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus' } : undefined;
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;
      recorder.ondataavailable = event => { if (event.data?.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingSeconds(0);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        if (blob.size < 1000) {
          setIsRecording(false); setVoiceState('ready'); setNotice('Recording was too short. Hold the microphone for a moment and try again.'); return;
        }
        setIsRecording(false);
        transcribeAudio(blob);
      };
      recorder.start(250);
      setIsRecording(true);
      setVoiceState('recording');
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(value => {
        if (value >= 59) { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); return 60; }
        return value + 1;
      }), 1000);
    } catch (error) {
      setNotice(error.name === 'NotAllowedError' ? 'Microphone permission denied. Allow microphone access in your browser or use the text box as a fallback.' : `Could not start microphone: ${error.message}`);
      setVoiceState('ready');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    // Prevent rapid taps from opening multiple permission prompts / recorders.
    if (voiceStartInProgressRef.current) return;
    voiceStartInProgressRef.current = true;
    try {
      if (!sessionStarted) await startSession();
      // `sessionStarted` in this render may be stale after the greeting, so explicitly
      // allow recording to continue on the same first tap.
      await startRecording(true);
    } finally {
      voiceStartInProgressRef.current = false;
    }
  };

  const clickMapPoint = (latlng) => {
    setDraft(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng, address: `Manual map pin (${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)})`, locationConfirmed: false }));
    setLocationStatus({ kind: 'pending', text: 'Pin selected. Confirm it before saving.' });
    setMapCenter([latlng.lat, latlng.lng]);
    setMapPickMode(false);
    setNotice('Pin selected. Review the address and choose Confirm map pin.');
    if (sessionStarted) setStage('location_confirm');
  };

  const submitTypedTurn = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = form.elements.namedItem('typedTurn')?.value?.trim();
    if (!value || busy) return;

    // Typing is a first-class way to start a conversation; do not require microphone access.
    form.reset();
    if (!sessionStarted) setSessionStarted(true);
    await handleTranscript(value);
  };

  const updateDraftField = (key, value) => setDraft(prev => key === 'address' && value !== prev.address ? ({ ...prev, address: value, lat: null, lng: null, locationConfirmed: false }) : ({ ...prev, [key]: value }));

  const discardDraft = async () => {
    if (!window.confirm('Discard this unconfirmed complaint draft? Nothing will be saved.')) return;
    setDraft(initialDraft()); setStage('complaint'); setSavedComplaint(null); setEditing(false); setShowConfirmDialog(false); setTranscriptReview(null); setReviewTranscript(''); setNotice('');
    const text = activeLanguage.startsWith('te') ? 'డ్రాఫ్ట్ రద్దు చేయబడింది. ఏ ఫిర్యాదూ సేవ్ చేయలేదు.' : activeLanguage.startsWith('ta') ? 'டிராஃப்ட் ரத்து செய்யப்பட்டது. எந்தப் புகாரும் சேமிக்கப்படவில்லை.' : 'Draft discarded. No complaint was saved.';
    await say(text);
  };

  const startNewComplaint = async () => {
    setDraft(initialDraft()); setStage('complaint'); setSavedComplaint(null); setEditing(false); setShowConfirmDialog(false); setTranscriptReview(null); setReviewTranscript(''); setNotice('');
    const greeting = activeLanguage.startsWith('te') ? 'సరే, కొత్త ఫిర్యాదు. ఏం జరిగింది?' : activeLanguage.startsWith('ta') ? 'சரி, புதிய புகார். என்ன நடந்தது?' : 'Okay, let’s start a new complaint. What happened?';
    await say(greeting, { kind: 'prompt' }, activeLanguage);
  };

  const makeSummary = (value = draft, lang = activeLanguage) => {
    const loc = value.address || (lang.startsWith('ta') ? 'இடம் தேர்வு செய்யப்படவில்லை' : lang.startsWith('te') ? 'స్థానం ఎంచుకోలేదు' : 'location not selected');
    const duration = value.durationText || (lang.startsWith('ta') ? 'காலம் குறிப்பிடப்படவில்லை' : lang.startsWith('te') ? 'వ్యవధి చెప్పలేదు' : 'duration not specified');
    if (lang.startsWith('te')) return `సరే, ${value.category || 'సమస్య'} ఫిర్యాదు. స్థలం ${loc}. వ్యవధి ${duration}. ఈ వివరాలతో ఫిర్యాదును నమోదు చేయనా?`;
    if (lang.startsWith('ta')) return `சரி, ${value.category || 'பிரச்சினை'} புகார். இடம் ${loc}. காலம் ${duration}. இந்த விவரங்களுடன் புகாரைப் பதிவு செய்யலாமா?`;
    return `Okay, a ${value.category || 'civic'} complaint at ${loc}, reported for ${duration}. Shall I save it?`;
  };

  const runStatusLookup = async (event) => {
    event.preventDefault();
    setLookupResult(null);
    if (!statusLookup.trim()) return;
    try {
      const response = await fetch(`${API}/complaints/${encodeURIComponent(statusLookup.trim())}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not find that ID.');
      setLookupResult(body.complaint);
      const item = body.complaint;
      await say(activeLanguage.startsWith('te') ? `ఫిర్యాదు ${item.id} స్థితి ${item.status}.` : activeLanguage.startsWith('ta') ? `புகார் ${item.id} நிலை: ${item.status}.` : `Complaint ${item.id} status: ${item.status}.`);
    } catch (error) { setNotice(error.message); }
  };

  const visibleComplaints = useMemo(() => showAllReports ? complaints : complaints.slice(0, 9), [complaints, showAllReports]);
  const mapPoints = useMemo(() => complaints.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng)), [complaints]);
  const mapRecurringCount = useMemo(() => mapPoints.filter(item => item.recurringFlag).length, [mapPoints]);
  const mapCategoryCount = useMemo(() => new Set(mapPoints.map(item => item.category).filter(Boolean)).size, [mapPoints]);
  const mapLegendItems = useMemo(() => {
    const counts = new Map();
    mapPoints.forEach(item => { if (item.category) counts.set(item.category, (counts.get(item.category) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([category, count]) => ({ category, count }));
  }, [mapPoints]);
  const matchingCount = useMemo(() => {
    if (!draft.category || draft.lat == null || draft.lng == null || !Number.isFinite(Number(draft.lat)) || !Number.isFinite(Number(draft.lng))) return 0;
    return complaints.filter(item => item.category === draft.category && !/Resolved/i.test(item.status) && distanceMeters(Number(draft.lat), Number(draft.lng), item.lat, item.lng) <= 100).length;
  }, [complaints, draft.category, draft.lat, draft.lng]);

  return (
    <div className="app-shell" data-theme={theme} data-sidebar-open={sidebarOpen ? 'true' : 'false'}>
      <button type="button" className={`drawer-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" tabIndex={sidebarOpen ? 0 : -1} />
      <aside id="civicvoice-sidebar" className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-hidden={!sidebarOpen}>
        <button type="button" className="sidebar-dismiss" onClick={() => setSidebarOpen(false)} aria-label="Close workspace menu"><X size={18} /></button>
        <div className="brand-lockup">
          <div className="brand-symbol"><AudioLines size={23} strokeWidth={2.4} /></div>
          <div><div className="brand-name">CivicVoice<span> AI</span></div><div className="brand-tagline">VOICE COMPLAINT → ACTION</div></div>
        </div>
        <div className="environment-pill"><span className="live-dot" /> CivicVoice workspace</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={`nav-item ${activeView === 'assistant' ? 'active' : ''}`} onClick={() => { setActiveView('assistant'); setSidebarOpen(false); }}><Mic size={18} /> Voice assistant <span className="nav-hotkey">01</span></button>
          <button className={`nav-item ${activeView === 'reports' ? 'active' : ''}`} onClick={() => { setActiveView('reports'); setSidebarOpen(false); }}><FileText size={18} /> Complaint records <span className="nav-count">{stats.total}</span></button>
          <button className={`nav-item ${activeView === 'status' ? 'active' : ''}`} onClick={() => { setActiveView('status'); setSidebarOpen(false); }}><Activity size={18} /> Track status</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="api-health-card">
            <div className="api-health-title"><span className={`status-dot ${apiHealth.apiKeyConfigured ? 'ok' : 'warn'}`} /> API connection</div>
            <div className="api-health-copy">{apiHealth.apiKeyConfigured ? 'Gnani key configured on server' : 'Add your key to server/.env'}</div>
            <button className="tiny-link" onClick={fetchData}><RefreshCw size={13} /> Check connection</button>
          </div>
          <div className="user-mini"><div className="user-avatar">CV</div><div><strong>CivicVoice workspace</strong><span>Voice-first complaint workflow</span></div><ShieldCheck size={17} className="shield-muted" /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title-row">
            <button type="button" className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open workspace menu" aria-controls="civicvoice-sidebar" aria-expanded={sidebarOpen} title="Open workspace menu">
              <span className="hamburger-lines" aria-hidden="true"><i /><i /><i /></span><span className="menu-toggle-label">Menu</span>
            </button>
            <div><div className="eyebrow">CIVIC INTELLIGENCE / WORKSPACE</div><h1>{activeView === 'assistant' ? 'Voice complaint assistant' : activeView === 'reports' ? 'Complaint records' : 'Track a complaint'}</h1></div>
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-pressed={theme === 'dark'}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </button>
            <div className="language-control"><Waves size={15} /><select value={language} onChange={event => setLanguage(event.target.value)} aria-label="Conversation language">{LANGUAGES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={14} className="select-chevron" /></div><div className="language-hint" title="Auto-detect recognizes Tamil, Telugu or English; selecting a language uses one recognition request.">{language === 'auto' ? `Auto · detected: ${lastDetection.language ? ({'ta-IN': 'Tamil', 'te-IN': 'Telugu', 'en-IN': 'English'}[lastDetection.language] || lastDetection.language) : 'not yet'} · auto language detection` : `${LANGUAGES.find(item => item.value === language)?.label || 'Selected language'} · 1 STT call`}</div>
            <div className="system-pill"><span className="live-dot" /> Workspace</div>
          </div>
        </header>

        {notice && <div className="notice-banner" role="status"><AlertTriangle size={17} /><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={16} /></button></div>}

        {showConfirmDialog && stage === 'confirm' && !savedComplaint && <div className="confirm-overlay" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className="dialog-close" onClick={() => setShowConfirmDialog(false)} aria-label="Close confirmation"><X size={18} /></button><div className="dialog-icon"><CheckCircle2 size={26} /></div><div className="dialog-eyebrow">READY TO SAVE</div><h2 id="confirm-title">Review your complaint</h2><p className="dialog-subtitle">CivicVoice has organised the details you shared. Confirm to save this report.</p><div className="confirm-summary"><div><span>ISSUE</span><strong>{draft.category || 'Civic issue'}</strong></div><div><span>DURATION</span><strong>{draft.durationText || 'Not provided'}</strong></div><div className="summary-location"><span>LOCATION</span><strong>{draft.address || 'Location not selected'}</strong></div><div className="summary-description"><span>DESCRIPTION</span><strong>{draft.description || 'No description yet'}</strong></div>{matchingCount > 0 && <div className="summary-match"><Sparkles size={15} /><span>{matchingCount} similar nearby report{matchingCount === 1 ? '' : 's'} found</span></div>}</div><div className="dialog-actions"><button className="dialog-secondary" onClick={() => { setShowConfirmDialog(false); setEditing(true); }}><FileText size={16} /> Edit details</button><button className="dialog-primary" disabled={busy || !draft.durationText || !draft.locationConfirmed} onClick={() => saveComplaint(draft)}>{busy ? <span className="dialog-spinner" /> : <CheckCircle2 size={17} />} {busy ? 'Saving…' : 'Confirm & save'}</button></div><div className="dialog-footnote"><ShieldCheck size={14} /> Nothing is saved until you confirm.</div></section></div>}

        {activeView === 'assistant' && (
          <>
          <div className="overview-strip" aria-label="How CivicVoice works">
            <div className="overview-item"><div className="overview-icon mint"><ShieldCheck size={17} /></div><div><strong>Tap to speak</strong><span>Mic stays off between turns</span></div></div>
            <div className="overview-separator" />
            <div className="overview-item"><div className="overview-icon blue"><MapPin size={17} /></div><div><strong>Confirm the place</strong><span>You choose the final map pin</span></div></div>
            <div className="overview-separator" />
            <div className="overview-item"><div className="overview-icon violet"><CheckCircle2 size={17} /></div><div><strong>Review, then save</strong><span>Your approval comes first</span></div></div>
          </div>
          <div className="workspace-grid">
            <section className="left-column">
              {transcriptReview && <div className="transcript-review panel">
                <div className="panel-heading"><div><h3>Review recognized words</h3><p>Correct any speech-to-text mistake before filling the complaint form.</p></div><span className="review-tag"><Sparkles size={13} /> STT REVIEW</span></div>
                {transcriptReview.alternatives.length > 1 && <div className="candidate-list" aria-label="Alternative transcriptions">
                  <span className="candidate-label">Choose the best recognition result</span>
                  <div className="candidate-options">{transcriptReview.alternatives.map((candidate, index) => <button key={`${candidate.language}-${index}`} className={`candidate-option ${reviewLanguage === candidate.language && reviewTranscript === candidate.transcript ? 'active' : ''}`} onClick={() => { setReviewTranscript(candidate.transcript); setReviewLanguage(candidate.language); setDetectedLanguage(candidate.language); setLastDetection(prev => ({ ...prev, language: candidate.language })); }}><strong>{candidate.language === 'ta-IN' ? 'Tamil result' : candidate.language === 'te-IN' ? 'Telugu result' : 'English result'}</strong><span>{candidate.transcript}</span></button>)}</div>
                </div>}
                <label className="review-transcript-label">Recognized transcript <textarea className="review-textarea" rows={3} value={reviewTranscript} onChange={event => setReviewTranscript(event.target.value)} placeholder="Edit the words if recognition made a mistake" /></label>
                <div className="review-language-row"><span>Language for assistant replies</span><select value={reviewLanguage} onChange={event => setReviewLanguage(event.target.value)}><option value="ta-IN">Tamil</option><option value="te-IN">Telugu</option><option value="en-IN">English</option></select><span className="candidate-helper">To change speech recognition, use the language selector before recording. Your edited words fill the form.</span></div>
                <div className="review-actions"><button className="outline-button" onClick={cancelTranscriptReview}><X size={15} /> Discard transcript</button><button className="primary-button" disabled={busy || !reviewTranscript.trim()} onClick={applyTranscriptReview}><CheckCircle2 size={16} /> Apply words to complaint</button></div>
              </div>}

              <div className={`conversation-panel panel ${voiceState}`}>
                <div className="conversation-header">
                  <div>
                    <div className="section-kicker"><span className="kicker-dot" /> CIVICVOICE · VOICE ASSISTANT</div>
                    <h2>Let’s sort this out.</h2>
                    <p>Speak naturally. I’ll capture the issue, location and duration as we go.</p>
                  </div>
                  <div className={`chat-state-pill ${voiceState}`}><span />{!sessionStarted ? 'Ready to start' : voiceState === 'recording' ? 'Listening' : voiceState === 'processing' ? 'Understanding' : voiceState === 'speaking' ? 'Speaking' : stage === 'complete' ? 'Recorded' : 'Ready'}</div>
                </div>
                <div className="conversation-subhead"><div><h3>Conversation</h3><p>Your spoken turns and assistant replies</p></div><span className="turn-count">{messages.length} messages</span></div>
                {messages.length === 0 ? <div className="empty-conversation"><div className="empty-icon"><AudioLines size={21} /></div><strong>Your conversation will appear here</strong><span>Type a message below or use push-to-talk to begin. You can speak or type at any time.</span></div> : <div className="conversation-list" ref={conversationListRef}>
                  {messages.map(message => <div key={message.id} className={`message-row ${message.role}`}>
                    <div className={`message-avatar ${message.role}`}>{message.role === 'user' ? <Mic size={15} /> : <AudioLines size={15} />}</div>
                    <div className="message-content"><div className="message-meta"><strong>{message.role === 'user' ? 'YOU' : 'CIVICVOICE AI'}</strong><span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{message.role === 'assistant' && <button className="replay-button" title="Replay spoken response" onClick={() => speakText(message.text, message.id)}><Volume2 size={14} /> {playingMessageId === message.id ? 'Playing' : 'Replay'}</button>}</div><div className="message-bubble">{message.text}</div></div>
                  </div>)}<div ref={messagesEndRef} /></div>}
                <form className="typed-fallback chat-composer" onSubmit={submitTypedTurn}>
                  <div className="chat-composer-tools">
                    <div className="chat-status-copy"><span className={`chat-live-dot ${voiceState}`} /><span>{isRecording ? `Recording · 00:${String(recordingSeconds).padStart(2, '0')}` : voiceState === 'processing' ? 'Understanding your message…' : voiceState === 'speaking' ? 'CivicVoice is speaking' : !sessionStarted ? 'Type below or tap the mic to start' : 'Mic stays off between turns'}</span></div>
                    <div className="chat-quick-actions">
                      <button type="button" className="soft-button" onClick={useCurrentLocation} disabled={locationStatus.kind === 'loading'} title="Use your device location"><LocateFixed size={14} /><span>My location</span></button>
                      <button type="button" className="soft-button" onClick={() => speakText(activeLanguage.startsWith('te') ? 'నమస్కారం! మీ సమస్య చెప్పండి.' : activeLanguage.startsWith('ta') ? 'வணக்கம்! உங்கள் பிரச்சினையைச் சொல்லுங்கள்.' : 'Hello! Tell me what happened.', null, activeLanguage)} disabled={busy || voiceState === 'speaking'} title="Test the assistant voice"><Volume2 size={14} /><span>Test voice</span></button>
                      {voiceState === 'speaking' && <button type="button" className="soft-button" onClick={stopCurrentAudio}><Pause size={14} /><span>Stop voice</span></button>}
                    </div>
                  </div>
                  <div className="chat-voice-control">
                    <strong className="chat-voice-kicker">PUSH TO TALK</strong>
                    <button type="button" className={`voice-dock-button ${isRecording ? 'recording' : ''}`} onClick={toggleVoiceRecording} disabled={(busy && !isRecording) || Boolean(transcriptReview)} aria-label={isRecording ? 'Stop recording' : 'Start recording'} title={isRecording ? 'Tap to stop recording and transcribe' : 'Tap to start recording'}>
                      {voiceState === 'processing' ? <RefreshCw size={21} className="spin" /> : isRecording ? <Pause size={21} fill="currentColor" /> : sessionStarted ? <Mic size={21} /> : <Play size={19} fill="currentColor" />}
                    </button>
                    <span>{isRecording ? `Listening · 00:${String(recordingSeconds).padStart(2, '0')} — tap to finish` : voiceState === 'processing' ? 'Understanding your message…' : voiceState === 'speaking' ? 'CivicVoice is replying' : sessionStarted ? 'Tap the microphone to speak' : 'Tap to start your conversation'}</span>
                  </div>
                  <div className="typed-input-wrap chat-input-wrap">
                    <input name="typedTurn" placeholder="Type a message to start or add a detail…" aria-label="Type a conversation message" autoComplete="off" disabled={busy} />
                    <button type="submit" className="send-turn-button" disabled={busy} aria-label="Send typed message" title="Send message"><Send size={17} /></button>
                  </div>
                  <div className="chat-composer-foot"><span>Push-to-talk · no background listening</span><span>Confirm details before saving</span></div>
                </form>
              </div>
            </section>

            <section className="right-column">
              <div className="map-panel panel">
                <div className="panel-heading map-heading"><div><h3>Issue location map</h3><p>Explore mapped reports and verify the affected place</p></div><div className="map-heading-actions"><span className="map-count-pill"><MapPin size={13} /> {mapPoints.length} mapped</span><button className={`icon-button ${mapPickMode ? 'selected' : ''}`} title="Click map to choose a location" aria-label="Choose complaint location on map" onClick={() => setMapPickMode(value => !value)}><MapPin size={17} /></button></div></div>
                <div className={`map-instruction ${mapPickMode ? 'active' : ''}`}><span className="map-instruction-dot" />{mapPickMode ? 'Pin mode active · click the map where the issue happened.' : 'Select a marker to inspect a complaint. Zoom in for street-level detail.'}</div>
                <div className="map-confirm-top-row">
                  <span>{draft.locationConfirmed ? 'Map pin confirmed' : draft.lat != null && draft.lng != null ? 'Location selected · confirm to continue' : 'Choose a location to enable confirmation'}</span>
                  <button type="button" className="confirm-pin-button" onClick={confirmMapPin} disabled={draft.lat == null || draft.lng == null || !Number.isFinite(Number(draft.lat)) || !Number.isFinite(Number(draft.lng))}><Check size={14} /> Confirm map pin</button>
                </div>
                <div className="map-canvas">
                  <div className="map-overlay-meta"><span className="map-overlay-live"><i /> {mapPickMode ? 'PICK A LOCATION' : 'MAP OVERVIEW'}</span><span>{mapPoints.length} reports · {mapCategoryCount} issue types</span></div>
                  <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={true} zoomControl={true} attributionControl={true}>
                    <MapUpdater center={mapCenter} />
                    <ClickableMap enabled={mapPickMode} onPick={clickMapPoint} />
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {mapPoints.map(item => <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={item.recurringFlag ? 9 : 6} pathOptions={{ color: '#ffffff', fillColor: item.recurringFlag ? '#fb7185' : CATEGORY_COLORS[item.category] || '#94a3b8', fillOpacity: 0.95, weight: item.recurringFlag ? 3 : 2 }}>
                      <Popup><div className="map-popup"><strong>{item.category}</strong><span>{item.id}</span><p>{item.address}</p><span className={item.recurringFlag ? 'popup-alert' : ''}>{item.recurringFlag ? 'Recurring issue · priority review' : item.status}</span><small>COMPLAINT DATA</small></div></Popup>
                    </CircleMarker>)}
                    {draft.lat != null && draft.lng != null && Number.isFinite(Number(draft.lat)) && Number.isFinite(Number(draft.lng)) && <CircleMarker center={[Number(draft.lat), Number(draft.lng)]} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: draft.locationConfirmed ? '#25c7a3' : '#8b5cf6', fillOpacity: 1 }}><Popup><div className="map-popup"><strong>Your complaint location</strong><span>{draft.address || 'Selected pin'}</span><small>{draft.locationConfirmed ? 'PIN CONFIRMED' : 'NEEDS CONFIRMATION'}</small></div></Popup></CircleMarker>}
                  </MapContainer>
                </div>
                <div className="map-stats-strip" aria-label="Map summary">
                  <div><span>REPORTS MAPPED</span><strong>{mapPoints.length}</strong><small>With saved coordinates</small></div>
                  <div><span>ISSUE TYPES</span><strong>{mapCategoryCount}</strong><small>Categories represented</small></div>
                  <div><span>RECURRING</span><strong>{mapRecurringCount}</strong><small>Flagged for review</small></div>
                </div>
                <div className="map-legend" aria-label="Map legend">
                  {mapLegendItems.map(item => <span key={item.category}><i style={{ background: CATEGORY_COLORS[item.category] || '#94a3b8' }} />{item.category} <b>{item.count}</b></span>)}
                  {mapPoints.length === 0 && <span className="map-legend-empty">No geolocated reports yet</span>}
                  <span><i className="draft-pin-legend" />Current draft pin</span><span><i style={{ background: '#fb7185' }} />Recurring issue</span>
                </div>
                <div className="location-search"><div className="location-input"><Search size={16} /><input value={searchAddress} onChange={event => setSearchAddress(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); searchForLocation(); } }} placeholder="Search street, area or landmark" aria-label="Search street area or landmark" /><button onClick={searchForLocation} disabled={searchingAddress || searchAddress.trim().length < 3} aria-label="Search location">{searchingAddress ? <RefreshCw size={15} className="spin" /> : <Search size={15} />}</button></div>
                  <div className="preset-location-row" aria-label="Quick location picks">{PRESET_LOCATIONS.map(place => <button key={place.id} type="button" className="preset-location-chip" onClick={() => choosePresetLocation(place)}><MapPin size={13} />{place.label}</button>)}</div>
                  <div className="location-action-row"><button className="link-button" onClick={() => { setMapPickMode(value => !value); setNotice(mapPickMode ? '' : 'Click the map to choose the complaint location.'); }}><Plus size={14} /> {mapPickMode ? 'Cancel pin selection' : 'Pin manually on map'}</button></div>
                  <div className={`location-status-line ${locationStatus.kind}`}><span className="status-dot" />{locationStatus.text}</div>
                </div>
              </div>

              <div className="draft-panel panel">
                <div className="panel-heading"><div><h3>Complaint details</h3><p>Review before confirming</p></div><div className="heading-actions"><button className="text-action" onClick={() => setEditing(value => !value)}>{editing ? 'Done editing' : 'Edit fields'}</button>{(draft.category || draft.description) && <button className="text-action danger-text" onClick={discardDraft}>Discard draft</button>}</div></div>
                {editing ? <div className="draft-form">
                  <label>Category<select value={draft.category} onChange={event => updateDraftField('category', event.target.value)}><option value="">Choose category</option>{CATEGORY_OPTIONS.map(item => <option key={item}>{item}</option>)}</select></label>
                  <label>What happened?<textarea rows="3" value={draft.description} onChange={event => updateDraftField('description', event.target.value)} placeholder="Complaint description" /></label>
                  <label>Duration<input value={draft.durationText} onChange={event => updateDraftField('durationText', event.target.value)} placeholder="e.g. 2 weeks" /></label>
                  <label>Location<input value={draft.address} onChange={event => updateDraftField('address', event.target.value)} placeholder="Street or landmark" /></label>
                  <button className="confirm-pin-button full" onClick={() => setEditing(false)}><Check size={14} /> Apply edits</button>
                </div> : <>
                  <div className="draft-fields">
                    <div className="draft-field"><div className="field-icon amber"><Zap size={15} /></div><div><span>ISSUE CATEGORY</span><strong>{draft.category || 'Waiting for your report'}</strong></div></div>
                    <div className="draft-field"><div className="field-icon blue"><Clock3 size={15} /></div><div><span>DURATION</span><strong>{draft.durationText || 'Not captured yet'}</strong></div></div>
                    <div className="draft-field"><div className="field-icon violet"><MapPin size={15} /></div><div><span>LOCATION</span><strong className="location-field-value">{draft.address || 'Awaiting location'}</strong><small>{draft.locationConfirmed ? 'Map pin confirmed' : draft.address ? 'Confirm pin on map' : 'Device permission or manual pin'}</small></div></div>
                    <div className="draft-field description-field"><div className="field-icon blue"><FileText size={15} /></div><div><span>COMPLAINT DESCRIPTION</span><strong>{draft.description || 'Your spoken report will be converted into a complaint description here.'}</strong></div></div>
                  </div>
                  {draft.category && draft.lat != null && <div className={`recurrence-callout ${matchingCount >= 1 ? 'alert' : ''}`}><div className="recurrence-icon">{matchingCount >= 1 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}</div><div><strong>{matchingCount >= 1 ? 'Possible recurring issue' : 'Duplicate check ready'}</strong><span>{matchingCount >= 1 ? `${matchingCount} similar open report(s) found within 100 m.` : 'Nearby similar reports will be checked when you confirm.'}</span></div></div>}
                  <div className="draft-buttons"><button className="outline-button" onClick={() => setEditing(true)}><FileText size={15} /> Review details</button><button className="primary-button" disabled={busy || !draft.category || !draft.description || !draft.durationText || !draft.locationConfirmed || !draft.address} onClick={() => { setStage('confirm'); setShowConfirmDialog(true); say(makeSummary()); }}><CheckCircle2 size={16} /> Review & confirm</button></div>
                  <div className="save-hint"><ShieldCheck size={14} /> Review the details and confirm when everything looks right.</div>
                  
                </>}
              </div>
              {savedComplaint && <div className="saved-card panel"><div className="saved-icon"><CheckCircle2 size={19} /></div><div><div className="saved-label">COMPLAINT SAVED</div><strong>{savedComplaint.id}</strong><p>{savedComplaint.repeated ? `Recurring issue · ${savedComplaint.matchingCount} similar nearby reports` : 'Saved for review workflow'}</p></div><button className="icon-button" onClick={() => { navigator.clipboard?.writeText(savedComplaint.id); setNotice('Complaint ID copied.'); }} title="Copy complaint ID"><Copy size={15} /></button><button className="confirm-pin-button" onClick={startNewComplaint}><Plus size={14} /> New report</button></div>}
            </section>
          </div>
          </>
        )}

        {activeView === 'reports' && <div className="full-view-grid"><div className="metrics-row"><Metric icon={<FileText size={19} />} label="Total reports" value={stats.total} tone="blue" /><Metric icon={<AlertTriangle size={19} />} label="Recurring flagged" value={stats.recurring} tone="rose" /><Metric icon={<Activity size={19} />} label="In progress" value={stats.inProgress} tone="violet" /><Metric icon={<CheckCircle2 size={19} />} label="Resolved" value={stats.resolved} tone="green" /></div><div className="panel reports-panel"><div className="panel-heading"><div><h3>All complaint records</h3><p>Complaint records in this workspace</p></div><button className="outline-button" onClick={fetchData}><RefreshCw size={15} /> Refresh</button></div><div className="table-wrap"><table><thead><tr><th>Complaint ID</th><th>Issue</th><th>Location</th><th>Priority</th><th>Status</th><th>Reported</th></tr></thead><tbody>{visibleComplaints.map(item => <tr key={item.id}><td><strong>{item.id}</strong><small>RECORDED</small></td><td><span className="table-category"><i style={{ background: CATEGORY_COLORS[item.category] || '#94a3b8' }} />{item.category}</span>{item.recurringFlag && <span className="table-badge">Recurring</span>}</td><td className="table-location">{item.address}</td><td><span className={`priority-pill ${item.urgency === 'priority review' ? 'priority' : ''}`}>{item.urgency}</span></td><td><span className="status-pill">{item.status}</span></td><td>{timeAgo(item.createdAt)}</td></tr>)}</tbody></table></div><button className="text-action load-more" onClick={() => setShowAllReports(value => !value)}>{showAllReports ? 'Show fewer' : `Show all ${complaints.length} records`} <ChevronDown size={15} className={showAllReports ? 'rotate-up' : ''} /></button></div></div>}

        {activeView === 'status' && <div className="status-page"><div className="status-hero panel"><div className="status-hero-icon"><Navigation size={24} /></div><div><div className="section-kicker"><span className="kicker-dot" /> STATUS LOOKUP</div><h2>Where is your complaint now?</h2><p>Enter a CivicVoice complaint ID. The assistant will also speak the status aloud.</p></div><form className="status-search" onSubmit={runStatusLookup}><input value={statusLookup} onChange={event => setStatusLookup(event.target.value)} placeholder="e.g. CV-081" aria-label="Complaint ID" /><button className="primary-button" type="submit" disabled={!statusLookup.trim()}><Search size={16} /> Check status</button></form>{lookupResult && <div className="lookup-result"><div className="lookup-result-head"><CheckCircle2 size={18} /><strong>{lookupResult.id}</strong><span className="status-pill">{lookupResult.status}</span></div><div className="lookup-result-grid"><div><span>Issue</span><strong>{lookupResult.category}</strong></div><div><span>Location</span><strong>{lookupResult.address}</strong></div><div><span>Priority</span><strong>{lookupResult.urgency}</strong></div><div><span>Type</span><strong>Complaint record</strong></div></div></div>}<div className="status-disclaimer"><AlertTriangle size={15} /> Status shown here reflects the CivicVoice workflow.</div></div><div className="panel sample-ids"><div className="panel-heading"><div><h3>Recent complaint IDs</h3><p>Select a recent complaint to check its status</p></div></div><div className="sample-list">{complaints.slice(0, 5).map(item => <button key={item.id} onClick={() => setStatusLookup(item.id)}><div><strong>{item.id}</strong><span>{item.category} · {item.address}</span></div><ChevronDown size={16} className="sample-arrow" /></button>)}</div></div></div>}

        <footer className="app-footer"><span>© CivicVoice AI · Voice Complaint → Action</span><span><span className="footer-dot" /> Voice-first civic workflow</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map data © OpenStreetMap</a></footer>
      </main>
    </div>
  );
}

function Metric({ icon, label, value, tone }) {
  return <div className="metric-card panel"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>Live workflow</small></div></div>;
}
function distanceMeters(lat1, lng1, lat2, lng2) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default App;
