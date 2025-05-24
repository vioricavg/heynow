import { useState, useRef, useEffect, memo } from 'react';
import { VoiceNote as VoiceNoteType } from '@/hooks/useVoiceNotes';
import { useAuthor } from '@/hooks/useAuthor';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { formatDistanceToNow } from 'date-fns';

interface VibesVoiceWaveProps {
  voiceNote: VoiceNoteType;
  index: number;
  totalWaves: number;
}

export const VibesVoiceWave = memo(function VibesVoiceWave({ voiceNote, index, totalWaves }: VibesVoiceWaveProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [waveOffset, setWaveOffset] = useState(0);
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
  
  // Wave animation
  useEffect(() => {
    const animate = () => {
      setWaveOffset((prev) => (prev + 0.5) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // Handle autoplay policy restrictions
          console.log('Autoplay blocked:', error);
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

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
  
  // Color scheme
  const colors = {
    own: {
      primary: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.5)',
      gradient: ['rgba(74, 222, 128, 0)', 'rgba(74, 222, 128, 0.3)', 'rgba(74, 222, 128, 0)']
    },
    other: {
      primary: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.5)',
      gradient: ['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.3)', 'rgba(167, 139, 250, 0)']
    }
  };
  
  const colorScheme = isOwnNote ? colors.own : colors.other;
  
  // Calculate wave path
  const generateWavePath = () => {
    const width = window.innerWidth;
    const points = 50;
    const amplitude = isHovered || isPlaying ? 30 : 15;
    const frequency = 2;
    
    let path = `M 0 50`;
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const angle = ((i / points) * Math.PI * 2 * frequency) + (waveOffset * Math.PI / 180);
      const y = 50 + Math.sin(angle) * amplitude;
      path += ` L ${x} ${y}`;
    }
    
    return path;
  };
  
  // Position wave vertically - use a persistent random position based on note ID
  const getRandomPosition = (id: string) => {
    // Create a simple hash from the ID to get a consistent random value
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to a position between 15% and 85%
    return 15 + (Math.abs(hash) % 70);
  };
  
  const yPosition = getRandomPosition(voiceNote.id);
  
  return (
    <div
      className="absolute w-full cursor-pointer"
      style={{
        top: `${yPosition}%`,
        transform: 'translateY(-50%)',
        opacity,
        transition: 'opacity 1s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Wave visualization */}
      <svg
        className="absolute w-full"
        height="100"
        style={{
          filter: isHovered || isPlaying ? `drop-shadow(0 0 15px ${colorScheme.glow})` : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        <defs>
          <linearGradient id={`wave-gradient-${voiceNote.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorScheme.gradient[0]} />
            <stop offset="50%" stopColor={colorScheme.gradient[1]} />
            <stop offset="100%" stopColor={colorScheme.gradient[2]} />
          </linearGradient>
        </defs>
        
        <path
          d={generateWavePath()}
          fill="none"
          stroke={`url(#wave-gradient-${voiceNote.id})`}
          strokeWidth={isHovered || isPlaying ? 3 : 2}
          style={{
            transition: 'stroke-width 0.3s ease',
          }}
        />
        
        {/* Center dot */}
        <circle
          cx={window.innerWidth / 2}
          cy="50"
          r={isHovered || isPlaying ? 5 : 3}
          fill={colorScheme.primary}
          style={{
            transition: 'r 0.3s ease',
          }}
        />
      </svg>
      
      {/* Voice info */}
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-full text-xs whitespace-nowrap border border-gray-800">
          <span className={isOwnNote ? 'text-green-400' : 'text-purple-400'}>
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