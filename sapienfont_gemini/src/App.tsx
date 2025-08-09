import React, { useState, useEffect, useRef } from 'react';
import { Camera, Moon, Sun, User, Activity, WifiOff, Loader, XCircle, Bot } from 'lucide-react';

// --- Type Definitions ---
type AppStatus = 'INITIALIZING' | 'NO_CAMERA' | 'READY' | 'HOLDING' | 'DETECTING' | 'ERROR';
interface Message { id: number; text: string; sender: 'user' | 'ai'; }

// --- Main App Component ---
export default function App() {
  // --- State Management ---
  const [status, setStatus] = useState<AppStatus>('INITIALIZING');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "Welcome! Hold a hand sign steady in front of the camera to type.", sender: 'ai' }]);
  const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const motionDetectionIntervalRef = useRef<number | null>(null);
  const lastImageDataRef = useRef<ImageData | null>(null);
  const isDetectingRef = useRef(false);

  // --- Gemini API Key ---
  // IMPORTANT: For this to work, you MUST provide your own Google Gemini API key here.
  const GEMINI_API_KEY = ""; // PASTE YOUR GEMINI API KEY HERE

  // --- Core Logic: Camera Setup ---
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('READY');
      } catch (err) {
        console.error("Camera access denied:", err);
        setStatus('NO_CAMERA');
        setError("Camera access is required for this app to work.");
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (motionDetectionIntervalRef.current) clearInterval(motionDetectionIntervalRef.current);
    };
  }, []);

  // --- Motion Detection Loop ---
  useEffect(() => {
    if (status === 'READY' || status === 'HOLDING') {
      motionDetectionIntervalRef.current = window.setInterval(detectMotion, 100);
    }
    return () => {
      if (motionDetectionIntervalRef.current) clearInterval(motionDetectionIntervalRef.current);
    };
  }, [status]);
  
  // --- Trigger API call when progress reaches 100% ---
  useEffect(() => {
    if (holdProgress >= 100 && !isDetectingRef.current) {
      captureAndDetect();
      setHoldProgress(0); // Reset after triggering
    }
  }, [holdProgress]);

  // --- Motion Detection Logic ---
  const detectMotion = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    // Use a small canvas for performance
    canvas.width = 64; 
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastImageDataRef.current) {
      let motion = 0;
      const data = currentImageData.data;
      const lastData = lastImageDataRef.current.data;
      for (let i = 0; i < data.length; i += 4) {
        motion += Math.abs(data[i] - lastData[i]);
      }
      
      const motionThreshold = 150000; // Tweak this value based on camera sensitivity
      if (motion < motionThreshold) {
        setStatus('HOLDING');
        setHoldProgress(prev => Math.min(100, prev + 10)); // Increase progress
      } else {
        setStatus('READY');
        setHoldProgress(0); // Reset progress
      }
    }
    lastImageDataRef.current = currentImageData;
  };

  // --- Gemini API Call ---
  const captureAndDetect = async () => {
    if (isDetectingRef.current || !videoRef.current || !GEMINI_API_KEY) {
        if (!GEMINI_API_KEY) setError("Please add your Gemini API key in App.tsx");
        return;
    }

    isDetectingRef.current = true;
    setStatus('DETECTING');
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64ImageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze the hand sign in this image. Respond with a JSON object containing two keys: 'letter' and 'confidence'. The 'letter' should be the single English letter (A-Z) you detect. If no clear, single letter hand sign is visible, 'letter' should be 'None'. 'confidence' should be a number from 0.0 to 1.0 representing your certainty." },
              { inlineData: { mimeType: 'image/jpeg', data: base64ImageData } }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const result = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
      
      const letter = result.letter?.toUpperCase() || 'None';
      const conf = result.confidence || 0;

      setConfidence(conf * 100);
      if (letter !== 'None' && conf > 0.75) {
        setDetectedLetter(letter);
        setTypedText(prev => prev + letter);
      } else {
        setDetectedLetter(null);
      }

    } catch (err) {
      console.error("Gemini API call failed:", err);
      setError("Analysis failed. Check API key or console.");
    } finally {
      isDetectingRef.current = false;
      setStatus('READY');
    }
  };

  // --- UI Effects & Chat Logic ---
  useEffect(() => { document.documentElement.className = isDarkMode ? 'dark' : ''; }, [isDarkMode]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!typedText.trim() || isTyping) return;
    const userMessage: Message = { id: Date.now(), text: typedText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setTypedText('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = ["Wow, you typed that with your hands!", "That's so clever!", "What will you sign next?", "I'm ready for your next message!"];
      const aiMessage: Message = { id: Date.now() + 1, text: responses[Math.floor(Math.random() * responses.length)], sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getStatusText = () => {
    switch (status) {
        case 'READY': return 'Show a hand sign';
        case 'HOLDING': return 'Hold still...';
        case 'DETECTING': return 'Analyzing...';
        case 'ERROR': return <span className="text-red-400">{error}</span>;
        default: return 'Waiting for camera...';
    }
  }

  return (
    <div className={'min-h-screen font-sans bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors'}>
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"><div className="container mx-auto px-4 py-3 flex justify-between items-center"><div className="flex items-center space-x-3"><Activity className="text-neon-purple" size={32} /><h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">SAPIENFONT</h1></div><button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">{isDarkMode ? <Sun /> : <Moon />}</button></div></header>
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-70px)]">
        <div className="flex flex-col bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-3"><div className="relative"><Bot className="text-white bg-gradient-to-br from-neon-purple to-neon-pink p-2 rounded-full w-10 h-10" /><span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 dark:border-gray-800"></span></div><div><h3 className="font-bold">AI Girlfriend</h3><p className="text-sm text-gray-500 dark:text-gray-400">Online</p></div></div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">{messages.map(msg => (<div key={msg.id} className={'flex items-end gap-2 ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')}><div className={'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ' + (msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none')}><p>{msg.text}</p></div></div>))}{isTyping && <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div></div></div>}<div ref={chatEndRef} /></div>
          <div className="p-4 border-t dark:border-gray-700 flex items-center space-x-2"><div className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-900/80 border dark:border-gray-600 font-mono text-lg min-h-[44px]">{typedText}<span className="animate-ping">|</span></div><button onClick={() => setTypedText('')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XCircle /></button><button onClick={sendMessage} disabled={!typedText.trim() || isTyping} className="px-4 py-2 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400">Send</button></div>
        </div>
        <div className="relative bg-black rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg flex items-center justify-center">
          {status === 'NO_CAMERA' && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20"><Camera size={48} className="mb-4 text-red-400"/><p className="text-xl text-white">{error}</p></div>}
          <video ref={videoRef} muted className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/60 backdrop-blur-sm text-white font-mono text-center flex items-center space-x-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36"><circle className="text-gray-600" strokeWidth="2" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" /><circle className="text-neon-cyan" strokeWidth="2" strokeDasharray={`${holdProgress}, 100`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18"/></svg>
                <div className={'text-6xl font-black ' + (detectedLetter ? 'text-neon-cyan tron-glow' : 'text-neon-pink')}>{detectedLetter || '_'}</div>
            </div>
            <div>
                <div className="text-lg">{getStatusText()}</div>
                {detectedLetter && <div className="text-sm">Confidence: {confidence.toFixed(0)}%</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
