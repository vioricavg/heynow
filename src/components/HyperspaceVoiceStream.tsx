import { useState, useRef, useEffect, memo } from 'react';
import { VoiceNote as VoiceNoteType } from '@/hooks/useVoiceNotes';
import { useAuthor } from '@/hooks/useAuthor';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { formatDistanceToNow } from 'date-fns';

interface HyperspaceVoiceStreamProps {
  voiceNote: VoiceNoteType;
  index: number;
  totalStreams: number;
}

export const HyperspaceVoiceStream = memo(function HyperspaceVoiceStream({ 
  voiceNote, 
  index, 
  totalStreams 
}: HyperspaceVoiceStreamProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamOffset, setStreamOffset] = useState(Math.random() * 100);
  const audioRef = useRef<HTMLAudioElement>(null);
  const author = useAuthor(voiceNote.author);
  const { user } = useAutoAccount();
  const animationRef = useRef<number | null>(null);
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || voiceNote.author.slice(0, 8);
  const isOwnNote = user?.publicKey === voiceNote.author;
  
  // Calculate opacity based on age
  const calculateOpacity = () => {
    const now = Math.floor(Date.now() / 1000);
    const age = now - voiceNote.timestamp;
    const maxAge = 21 * 60; // 21 minutes in seconds
    const fadeStartAge = 20 * 60; // Start fading at 20 minutes
    
    if (age >= maxAge) {
      return 0;
    } else if (age >= fadeStartAge) {
      const fadeProgress = (age - fadeStartAge) / (maxAge - fadeStartAge);
      return 1 - fadeProgress;
    }
    return 1;
  };
  
  const [opacity, setOpacity] = useState(calculateOpacity());
  
  // Update opacity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(calculateOpacity());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [voiceNote.timestamp]);
  
  // Stream animation
  useEffect(() => {
    const animate = () => {
      setStreamOffset((prev) => {
        const newOffset = prev + (isPlaying ? 8 : 2);
        return newOffset > 200 ? -100 : newOffset;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  const handleClick = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  }, []);
  
  // Generate rainbow colors for the stream
  const generateRainbowGradient = () => {
    const hueShift = (index * 360 / totalStreams) % 360;
    const colors = [
      `hsl(${(hueShift + 0) % 360}, 100%, 50%)`,
      `hsl(${(hueShift + 60) % 360}, 100%, 50%)`,
      `hsl(${(hueShift + 120) % 360}, 100%, 50%)`,
      `hsl(${(hueShift + 180) % 360}, 100%, 50%)`,
      `hsl(${(hueShift + 240) % 360}, 100%, 50%)`,
      `hsl(${(hueShift + 300) % 360}, 100%, 50%)`,
    ];
    return colors;
  };
  
  const colors = generateRainbowGradient();
  
  // Position stream angularly from center
  const angle = (index / totalStreams) * Math.PI * 2;
  const centerX = 50;
  const centerY = 50;
  
  // Create light streaks
  const streaks = Array.from({ length: 3 }, (_, i) => {
    const offsetAngle = angle + (i - 1) * 0.1;
    const x1 = centerX + Math.cos(offsetAngle) * 10;
    const y1 = centerY + Math.sin(offsetAngle) * 10;
    const x2 = centerX + Math.cos(offsetAngle) * 150;
    const y2 = centerY + Math.sin(offsetAngle) * 150;
    
    return { x1, y1, x2, y2, delay: i * 0.2 };
  });
  
  return (
    <div
      className="absolute inset-0 cursor-pointer"
      style={{
        opacity,
        transition: 'opacity 1s ease',
      }}
      onClick={handleClick}
    >
      {/* Light streaks */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: isPlaying ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }}
      >
        <defs>
          {/* Create gradient for each streak */}
          {streaks.map((_, i) => (
            <linearGradient
              key={i}
              id={`hyperspace-gradient-${voiceNote.id}-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0" />
              <stop offset="20%" stopColor={colors[1]} stopOpacity="0.3" />
              <stop offset="40%" stopColor={colors[2]} stopOpacity="0.6" />
              <stop offset="60%" stopColor={colors[3]} stopOpacity="0.8" />
              <stop offset="80%" stopColor={colors[4]} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colors[5]} stopOpacity="0" />
            </linearGradient>
          ))}
          
          {/* Radial gradient for center glow */}
          <radialGradient id={`center-glow-${voiceNote.id}`}>
            <stop offset="0%" stopColor={isOwnNote ? '#4ade80' : colors[2]} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isOwnNote ? '#4ade80' : colors[3]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isOwnNote ? '#4ade80' : colors[4]} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Animated light streaks */}
        {streaks.map((streak, i) => (
          <line
            key={i}
            x1={`${streak.x1}%`}
            y1={`${streak.y1}%`}
            x2={`${streak.x2}%`}
            y2={`${streak.y2}%`}
            stroke={`url(#hyperspace-gradient-${voiceNote.id}-${i})`}
            strokeWidth={isPlaying ? 3 : 1.5}
            strokeLinecap="round"
            style={{
              strokeDasharray: '50 150',
              strokeDashoffset: streamOffset + streak.delay * 20,
              filter: `blur(${isPlaying ? 1 : 0.5}px)`,
              transition: 'stroke-width 0.3s ease, filter 0.3s ease',
            }}
          />
        ))}
        
        {/* Center core */}
        <circle
          cx={`${centerX}%`}
          cy={`${centerY}%`}
          r={isPlaying ? 8 : 5}
          fill={`url(#center-glow-${voiceNote.id})`}
          style={{
            filter: `blur(${isPlaying ? 2 : 1}px)`,
            transition: 'r 0.3s ease, filter 0.3s ease',
          }}
        />
        
        {/* Outer ring when playing */}
        {isPlaying && (
          <circle
            cx={`${centerX}%`}
            cy={`${centerY}%`}
            r="15"
            fill="none"
            stroke={isOwnNote ? '#4ade80' : colors[3]}
            strokeWidth="0.5"
            strokeOpacity="0.5"
            style={{
              animation: 'slowPulse 2s ease-in-out infinite',
            }}
          />
        )}
      </svg>
      
      {/* Voice info overlay */}
      <div
        className="absolute left-1/2 bottom-1/4 transform -translate-x-1/2 pointer-events-none"
        style={{
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-full text-xs whitespace-nowrap border border-gray-800">
          <span 
            className="font-bold"
            style={{ 
              color: isOwnNote ? '#4ade80' : colors[2],
              textShadow: `0 0 10px ${isOwnNote ? '#4ade80' : colors[2]}`,
            }}
          >
            {displayName}
          </span>
          <span className="text-gray-500 ml-2">•</span>
          <span className="text-gray-400 ml-2">
            {formatDistanceToNow(voiceNote.timestamp * 1000)} ago
          </span>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={voiceNote.audioUrl}
        preload="none"
        playsInline
      />
    </div>
  );
});