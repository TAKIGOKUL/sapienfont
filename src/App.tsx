import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageCircle, Heart, Sparkles, Moon, Sun, Zap, Star, User, Activity } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface PoseKeypoint {
  x: number;
  y: number;
  confidence: number;
}

interface PoseData {
  nose: PoseKeypoint;
  leftEye: PoseKeypoint;
  rightEye: PoseKeypoint;
  leftEar: PoseKeypoint;
  rightEar: PoseKeypoint;
  leftShoulder: PoseKeypoint;
  rightShoulder: PoseKeypoint;
  leftElbow: PoseKeypoint;
  rightElbow: PoseKeypoint;
  leftWrist: PoseKeypoint;
  rightWrist: PoseKeypoint;
  leftHip: PoseKeypoint;
  rightHip: PoseKeypoint;
  leftKnee: PoseKeypoint;
  rightKnee: PoseKeypoint;
  leftAnkle: PoseKeypoint;
  rightAnkle: PoseKeypoint;
}

interface HandGesture {
  type: 'palm' | 'fist' | 'none';
  confidence: number;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to SapienFont! 🧬 Transform your body into living typography. Strike poses to spell, use palm for space, fist to delete, and step away to send!",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [handGesture, setHandGesture] = useState<HandGesture>({ type: 'none', confidence: 0 });
  const [humanPresent, setHumanPresent] = useState<boolean>(true);
  const [gradientOffset, setGradientOffset] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Animated gradient and glow effects
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientOffset(prev => (prev + 1) % 360);
      setGlowIntensity(prev => Math.sin(Date.now() * 0.003) * 0.5 + 0.5);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Advanced pose detection with gesture recognition
  useEffect(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const gestures: HandGesture['type'][] = ['palm', 'fist', 'none'];
    
    const interval = setInterval(() => {
      // Generate realistic pose keypoints with more detail
      const centerX = 320;
      const centerY = 240;
      const time = Date.now() * 0.001;
      
      const mockPose: PoseData = {
        // Head keypoints
        nose: { x: centerX + Math.sin(time) * 8, y: centerY - 160 + Math.cos(time) * 4, confidence: 0.96 },
        leftEye: { x: centerX - 15 + Math.sin(time) * 6, y: centerY - 170 + Math.cos(time) * 3, confidence: 0.94 },
        rightEye: { x: centerX + 15 + Math.sin(time) * 6, y: centerY - 170 + Math.cos(time) * 3, confidence: 0.94 },
        leftEar: { x: centerX - 25 + Math.sin(time) * 5, y: centerY - 165 + Math.cos(time) * 3, confidence: 0.89 },
        rightEar: { x: centerX + 25 + Math.sin(time) * 5, y: centerY - 165 + Math.cos(time) * 3, confidence: 0.89 },
        
        // Upper body
        leftShoulder: { x: centerX - 60 + Math.sin(time * 0.8) * 12, y: centerY - 80, confidence: 0.95 },
        rightShoulder: { x: centerX + 60 + Math.cos(time * 0.8) * 12, y: centerY - 80, confidence: 0.95 },
        leftElbow: { x: centerX - 90 + Math.sin(time * 1.2) * 25, y: centerY - 20, confidence: 0.91 },
        rightElbow: { x: centerX + 90 + Math.cos(time * 1.2) * 25, y: centerY - 20, confidence: 0.91 },
        leftWrist: { x: centerX - 110 + Math.sin(time * 1.5) * 35, y: centerY + 40, confidence: 0.87 },
        rightWrist: { x: centerX + 110 + Math.cos(time * 1.5) * 35, y: centerY + 40, confidence: 0.87 },
        
        // Lower body
        leftHip: { x: centerX - 40, y: centerY + 100, confidence: 0.93 },
        rightHip: { x: centerX + 40, y: centerY + 100, confidence: 0.93 },
        leftKnee: { x: centerX - 45 + Math.sin(time * 0.6) * 15, y: centerY + 180, confidence: 0.90 },
        rightKnee: { x: centerX + 45 + Math.cos(time * 0.6) * 15, y: centerY + 180, confidence: 0.90 },
        leftAnkle: { x: centerX - 50 + Math.sin(time * 0.9) * 10, y: centerY + 260, confidence: 0.86 },
        rightAnkle: { x: centerX + 50 + Math.cos(time * 0.9) * 10, y: centerY + 260, confidence: 0.86 }
      };
      
      setPoseData(mockPose);
      
      // Simulate human presence detection
      const presenceRandom = Math.random();
      const isPresent = presenceRandom > 0.1; // 90% chance of being present
      setHumanPresent(isPresent);
      
      if (isPresent) {
        // Simulate gesture detection
        const gestureRandom = Math.random();
        let detectedGesture: HandGesture = { type: 'none', confidence: 0 };
        
        if (gestureRandom > 0.85) {
          detectedGesture = {
            type: gestures[Math.floor(Math.random() * 2)] as 'palm' | 'fist',
            confidence: Math.random() * 25 + 75 // 75-100%
          };
        }
        
        setHandGesture(detectedGesture);
        
        // Handle gesture actions
        if (detectedGesture.confidence > 90) {
          if (detectedGesture.type === 'palm') {
            setTypedText(prev => prev + ' ');
          } else if (detectedGesture.type === 'fist') {
            setTypedText(prev => prev.slice(0, -1));
          }
        }
        
        // Simulate letter detection
        if (Math.random() > 0.4 && detectedGesture.type === 'none') {
          const randomLetter = letters[Math.floor(Math.random() * letters.length)];
          const detectionConfidence = Math.random() * 30 + 70; // 70-100%
          setCurrentLetter(randomLetter);
          setConfidence(detectionConfidence);
          
          // Auto-type if confidence > 90%
          if (detectionConfidence > 90) {
            setTypedText(prev => prev + randomLetter);
          }
        } else if (detectedGesture.type === 'none') {
          setCurrentLetter('');
          setConfidence(0);
        }
      } else {
        // No human present - auto send message
        if (typedText.trim()) {
          setTimeout(() => sendMessage(), 1000);
        }
        setCurrentLetter('');
        setConfidence(0);
        setHandGesture({ type: 'none', confidence: 0 });
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [typedText]);

  // Start webcam
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!typedText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: typedText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTypedText('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const responses = [
        "Incredible biomechanical typography! Your body language speaks volumes! 🤖✨",
        "The way you embody letters is pure digital artistry! 🧬💫",
        "SapienFont detected flawless human-to-text conversion! 📝🤸‍♀️",
        "Your pose-to-letter accuracy is off the charts! Keep spelling! 💪📊",
        "Amazing! You're a living, breathing font renderer! 🔤🌟",
        "That gesture control mastery is next level! 🎯🚀"
      ];
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const clearText = () => {
    setTypedText('');
  };

  const renderAdvancedPoseSkeleton = () => {
    if (!poseData) return null;

    const connections = [
      // Head connections
      [poseData.leftEye, poseData.rightEye],
      [poseData.leftEye, poseData.nose],
      [poseData.rightEye, poseData.nose],
      [poseData.leftEar, poseData.leftEye],
      [poseData.rightEar, poseData.rightEye],
      
      // Neck to shoulders
      [poseData.nose, poseData.leftShoulder],
      [poseData.nose, poseData.rightShoulder],
      
      // Shoulder line
      [poseData.leftShoulder, poseData.rightShoulder],
      
      // Left arm
      [poseData.leftShoulder, poseData.leftElbow],
      [poseData.leftElbow, poseData.leftWrist],
      
      // Right arm
      [poseData.rightShoulder, poseData.rightElbow],
      [poseData.rightElbow, poseData.rightWrist],
      
      // Torso
      [poseData.leftShoulder, poseData.leftHip],
      [poseData.rightShoulder, poseData.rightHip],
      [poseData.leftHip, poseData.rightHip],
      
      // Left leg
      [poseData.leftHip, poseData.leftKnee],
      [poseData.leftKnee, poseData.leftAnkle],
      
      // Right leg
      [poseData.rightHip, poseData.rightKnee],
      [poseData.rightKnee, poseData.rightAnkle]
    ];

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 640 480">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Render connections with Tron-style glow */}
        {connections.map((connection, index) => {
          const [point1, point2] = connection;
          if (point1.confidence > 0.6 && point2.confidence > 0.6) {
            const avgConfidence = (point1.confidence + point2.confidence) / 2;
            return (
              <line
                key={`connection-${index}`}
                x1={point1.x}
                y1={point1.y}
                x2={point2.x}
                y2={point2.y}
                stroke={isDarkMode ? "#00ffff" : "#ff6b35"}
                strokeWidth="2"
                filter="url(#glow)"
                opacity={avgConfidence * glowIntensity}
                className="animate-pulse"
              />
            );
          }
          return null;
        })}
        
        {/* Render keypoints with enhanced visualization */}
        {Object.entries(poseData).map(([key, point]) => (
          <g key={key}>
            {/* Outer glow ring */}
            <circle
              cx={point.x}
              cy={point.y}
              r={point.confidence > 0.9 ? "12" : "8"}
              fill="none"
              stroke={isDarkMode ? "#00ffff" : "#ff6b35"}
              strokeWidth="2"
              opacity={point.confidence * 0.3}
              filter="url(#glow)"
              className="animate-ping"
            />
            {/* Main keypoint */}
            <circle
              cx={point.x}
              cy={point.y}
              r={point.confidence > 0.9 ? "6" : "4"}
              fill={isDarkMode ? "#00ffff" : "#ff6b35"}
              opacity={point.confidence}
              filter="url(#glow)"
            />
            {/* Confidence indicator */}
            <text
              x={point.x + 10}
              y={point.y - 10}
              fill={isDarkMode ? "#00ffff" : "#ff6b35"}
              fontSize="10"
              opacity={point.confidence > 0.8 ? 0.8 : 0}
              className="font-mono"
            >
              {(point.confidence * 100).toFixed(0)}%
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const backgroundStyle = {
    background: isDarkMode 
      ? `linear-gradient(${gradientOffset}deg, #000000 0%, #001122 25%, #003366 50%, #001122 75%, #000000 100%)`
      : `linear-gradient(${gradientOffset}deg, #00ffff 0%, #ffffff 25%, #00ff88 50%, #ffffff 75%, #00ffff 100%)`,
    backgroundSize: '400% 400%'
  };

  return (
    <div className="min-h-screen transition-all duration-500" style={backgroundStyle}>
      <style jsx>{`
        @keyframes tronGlow {
          0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
          50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        .tron-glow {
          animation: tronGlow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Tron-style grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`w-full h-full opacity-10 ${
          isDarkMode ? 'bg-cyan-400' : 'bg-orange-500'
        }`} style={{
          backgroundImage: `
            linear-gradient(${isDarkMode ? '#00ffff' : '#ff6b35'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDarkMode ? '#00ffff' : '#ff6b35'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className={`fixed animate-bounce pointer-events-none z-10 ${
            isDarkMode ? 'text-cyan-400' : 'text-orange-500'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <Zap size={8} />
        </div>
      ))}

      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b-2 tron-glow ${
        isDarkMode 
          ? 'bg-black/50 border-cyan-400 text-cyan-400' 
          : 'bg-white/50 border-orange-500 text-orange-600'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Activity className={`mr-3 tron-glow ${isDarkMode ? 'text-cyan-400' : 'text-orange-600'}`} size={36} />
                <h1 className={`text-3xl md:text-5xl font-black bg-clip-text text-transparent ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400'
                    : 'bg-gradient-to-r from-orange-600 via-green-600 to-orange-600'
                }`}>
                  SAPIENFONT
                </h1>
              </div>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 tron-glow ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black'
                  : 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
              }`}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
          
          <p className={`text-center mt-2 text-sm md:text-lg font-bold ${
            isDarkMode ? 'text-cyan-300' : 'text-orange-700'
          }`}>
            Body Language Typography • Neural Pose Recognition • Gesture Control Interface
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Chat Section */}
        <div className={`flex-1 rounded-3xl border-2 tron-glow ${
          isDarkMode
            ? 'bg-black/60 border-cyan-400 shadow-cyan-400/20'
            : 'bg-white/60 border-orange-500 shadow-orange-500/20'
        } shadow-2xl overflow-hidden backdrop-blur-lg`}>
          <div className={`p-4 border-b-2 ${
            isDarkMode ? 'border-cyan-400 bg-cyan-900/30' : 'border-orange-500 bg-orange-200/30'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full tron-glow ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-r from-orange-500 to-green-500'
                } flex items-center justify-center animate-pulse`}>
                  <User className="text-white" size={24} />
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                  isDarkMode ? 'bg-cyan-400' : 'bg-orange-500'
                } animate-ping`}></div>
              </div>
              <div>
                <h3 className={`font-bold text-lg ${
                  isDarkMode ? 'text-cyan-300' : 'text-orange-700'
                }`}>
                  SapienFont Neural AI
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-cyan-200' : 'text-orange-600'
                }`}>
                  Biomechanical Typography Assistant
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col h-[calc(100%-120px)]">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transform hover:scale-105 transition-all tron-glow ${
                      message.sender === 'user'
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                        : isDarkMode
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                    } shadow-lg`}
                  >
                    <p className="font-medium">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl tron-glow ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      : 'bg-gradient-to-r from-green-500 to-orange-500'
                  } text-white`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className={`p-4 border-t-2 ${
              isDarkMode ? 'border-cyan-400 bg-black/30' : 'border-orange-500 bg-white/30'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`flex-1 px-4 py-3 rounded-full tron-glow ${
                  isDarkMode
                    ? 'bg-black/70 text-cyan-300 border-2 border-cyan-400'
                    : 'bg-white/70 text-orange-700 border-2 border-orange-500'
                } font-mono text-lg backdrop-blur-sm`}>
                  {typedText || 'Strike poses to type...'}
                </div>
                <button
                  onClick={clearText}
                  className={`px-4 py-2 rounded-full font-bold transition-all hover:scale-105 tron-glow ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-500 hover:bg-red-400 text-white'
                  }`}
                >
                  Clear
                </button>
              </div>
              
              <div className={`text-center text-sm mb-3 ${
                isDarkMode ? 'text-cyan-300' : 'text-orange-600'
              }`}>
                {!humanPresent 
                  ? "🚀 No human detected - Auto-sending message..."
                  : "🤖 Pose for letters • 🖐️ Palm = Space • ✊ Fist = Delete • 🚶 Step away = Send"
                }
              </div>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div className={`flex-1 rounded-3xl border-2 tron-glow ${
          isDarkMode
            ? 'bg-black/60 border-blue-500 shadow-blue-500/20'
            : 'bg-white/60 border-green-500 shadow-green-500/20'
        } shadow-2xl overflow-hidden backdrop-blur-lg`}>
          <div className={`p-4 border-b-2 ${
            isDarkMode ? 'border-blue-500 bg-blue-900/30' : 'border-green-500 bg-green-200/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Camera className={`${isDarkMode ? 'text-blue-400' : 'text-green-600'}`} size={32} />
                <div>
                  <h3 className={`font-bold text-lg ${
                    isDarkMode ? 'text-blue-300' : 'text-green-700'
                  }`}>
                    Neural Pose Detection Engine
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-200' : 'text-green-600'
                  }`}>
                    Advanced Biomechanical Analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {handGesture.type !== 'none' && handGesture.confidence > 90 && (
                  <div className={`flex items-center space-x-2 animate-pulse ${
                    isDarkMode ? 'text-cyan-400' : 'text-orange-600'
                  }`}>
                    <Zap size={20} />
                    <span className="font-bold">
                      {handGesture.type === 'palm' ? 'SPACE' : 'DELETE'}
                    </span>
                  </div>
                )}
                
                {currentLetter && confidence > 90 && (
                  <div className={`flex items-center space-x-2 animate-pulse ${
                    isDarkMode ? 'text-cyan-400' : 'text-orange-600'
                  }`}>
                    <Star size={20} />
                    <span className="font-bold">AUTO-TYPED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative h-[calc(100%-80px)]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Advanced Pose Detection Overlay */}
            <div className="absolute inset-0">
              {renderAdvancedPoseSkeleton()}
            </div>
            
            {/* Human Presence Indicator */}
            <div className={`absolute top-4 right-4 px-3 py-2 rounded-full text-sm font-bold tron-glow ${
              humanPresent
                ? isDarkMode
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 text-white'
                : isDarkMode
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500 text-white animate-pulse'
            }`}>
              {humanPresent ? '👤 HUMAN DETECTED' : '🚫 NO HUMAN'}
            </div>
            
            {/* Detection Results */}
            <div className="absolute top-4 left-4 right-16">
              <div className={`rounded-2xl p-4 tron-glow ${
                isDarkMode
                  ? 'bg-black/90 border-2 border-blue-400'
                  : 'bg-white/90 border-2 border-green-500'
              } backdrop-blur-xl`}>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className={`font-bold text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-green-700'
                    }`}>
                      Letter:
                    </span>
                    <div className={`text-3xl font-black ${
                      currentLetter 
                        ? confidence > 90
                          ? isDarkMode ? 'text-cyan-400 animate-pulse' : 'text-orange-600 animate-pulse'
                          : isDarkMode ? 'text-blue-400' : 'text-green-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {currentLetter || '?'}
                    </div>
                  </div>
                  
                  <div>
                    <span className={`font-bold text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-green-700'
                    }`}>
                      Gesture:
                    </span>
                    <div className={`text-2xl font-black ${
                      handGesture.type !== 'none'
                        ? handGesture.confidence > 90
                          ? isDarkMode ? 'text-cyan-400 animate-pulse' : 'text-orange-600 animate-pulse'
                          : isDarkMode ? 'text-blue-400' : 'text-green-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {handGesture.type === 'palm' ? '🖐️' : handGesture.type === 'fist' ? '✊' : '❓'}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-green-600'
                    }`}>
                      Confidence:
                    </span>
                    <span className={`text-sm font-bold ${
                      Math.max(confidence, handGesture.confidence) > 90 
                        ? isDarkMode ? 'text-cyan-400' : 'text-orange-600'
                        : Math.max(confidence, handGesture.confidence) > 75
                          ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                          : isDarkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                      {Math.max(confidence, handGesture.confidence).toFixed(1)}%
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 tron-glow ${
                        Math.max(confidence, handGesture.confidence) > 90
                          ? isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-gradient-to-r from-orange-500 to-green-500'
                          : Math.max(confidence, handGesture.confidence) > 75
                            ? isDarkMode ? 'bg-gradient-to-r from-yellow-400 to-blue-400' : 'bg-gradient-to-r from-yellow-500 to-green-500'
                            : isDarkMode ? 'bg-gradient-to-r from-red-400 to-gray-400' : 'bg-gradient-to-r from-red-500 to-gray-500'
                      }`}
                      style={{ width: `${Math.max(confidence, handGesture.confidence)}%` }}
                    />
                  </div>
                </div>
                
                <div className={`text-xs text-center font-medium ${
                  isDarkMode ? 'text-blue-200' : 'text-green-600'
                }`}>
                  {Math.max(confidence, handGesture.confidence) > 90 
                    ? "🎯 Neural lock achieved! Auto-executing..." 
                    : Math.max(confidence, handGesture.confidence) > 75 
                      ? "⚡ Signal strong! Refine pose alignment!"
                      : Math.max(confidence, handGesture.confidence) > 50
                        ? "🔄 Detecting patterns... adjust positioning!"
                        : "🤖 Scanning for biomechanical signatures..."
                  }
                </div>
                
                {(confidence > 90 || handGesture.confidence > 90) && (
                  <div className={`mt-2 text-center text-xs ${
                    isDarkMode ? 'text-cyan-400' : 'text-orange-600'
                  } animate-bounce`}>
                    ⚡ Neural command executed! ⚡
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;