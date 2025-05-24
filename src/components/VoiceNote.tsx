import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VoiceNote as VoiceNoteType } from '@/hooks/useVoiceNotes';
import { useAuthor } from '@/hooks/useAuthor';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { formatDistanceToNow } from 'date-fns';

interface VoiceNoteProps {
  voiceNote: VoiceNoteType;
  allVoiceNotes: VoiceNoteType[];
  positions: Map<string, { x: number; y: number }>;
  onPositionUpdate: (id: string, position: { x: number; y: number }) => void;
}

export function VoiceNote({ voiceNote, allVoiceNotes, positions, onPositionUpdate }: VoiceNoteProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: voiceNote.x || 50, y: voiceNote.y || 50 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const author = useAuthor(voiceNote.author);
  const { user } = useAutoAccount();
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || voiceNote.author.slice(0, 8);
  const isOwnNote = user?.publicKey === voiceNote.author;
  
  // Random movement parameters for each orb
  const movementParams = useRef({
    speedX: (Math.random() - 0.5) * 0.01, // -0.005 to 0.005 per frame
    speedY: (Math.random() - 0.5) * 0.01,
    wobbleX: Math.random() * Math.PI * 2,
    wobbleY: Math.random() * Math.PI * 2,
    wobbleSpeedX: 0.0001 + Math.random() * 0.0001,
    wobbleSpeedY: 0.0001 + Math.random() * 0.0001,
    wobbleAmplitudeX: 0.5 + Math.random() * 1,
    wobbleAmplitudeY: 0.5 + Math.random() * 1,
  }).current;
  
  // Update position in parent component
  useEffect(() => {
    onPositionUpdate(voiceNote.id, position);
  }, [position, voiceNote.id, onPositionUpdate]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!isHovered) {
        setPosition(prev => {
          let newX = prev.x + movementParams.speedX;
          let newY = prev.y + movementParams.speedY;
          
          // Add wobble effect
          movementParams.wobbleX += movementParams.wobbleSpeedX;
          movementParams.wobbleY += movementParams.wobbleSpeedY;
          
          const wobbleOffsetX = Math.sin(movementParams.wobbleX) * movementParams.wobbleAmplitudeX * 0.01;
          const wobbleOffsetY = Math.cos(movementParams.wobbleY) * movementParams.wobbleAmplitudeY * 0.01;
          
          newX += wobbleOffsetX;
          newY += wobbleOffsetY;
          
          // Define orb radius once
          const orbRadius = 3; // Approximate radius in percentage
          const padding = 3; // 3% from edge
          
          // Simple edge bouncing - check position without collision first
          if (newX <= padding) {
            newX = padding + 0.1;
            movementParams.speedX = Math.abs(movementParams.speedX) * 0.8;
          } else if (newX >= 100 - padding) {
            newX = 100 - padding - 0.1;
            movementParams.speedX = -Math.abs(movementParams.speedX) * 0.8;
          }
          
          if (newY <= padding) {
            newY = padding + 0.1;
            movementParams.speedY = Math.abs(movementParams.speedY) * 0.8;
          } else if (newY >= 100 - padding) {
            newY = 100 - padding - 0.1;
            movementParams.speedY = -Math.abs(movementParams.speedY) * 0.8;
          }
          
          // Check collision with other orbs only after edge handling
          let collisionOccurred = false;
          allVoiceNotes.forEach(otherNote => {
            if (otherNote.id !== voiceNote.id && !collisionOccurred) {
              const otherPos = positions.get(otherNote.id) || { x: otherNote.x || 50, y: otherNote.y || 50 };
              const dx = newX - otherPos.x;
              const dy = newY - otherPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < orbRadius * 2 && distance > 0) {
                // Simple bounce - just reverse direction
                movementParams.speedX *= -0.8;
                movementParams.speedY *= -0.8;
                collisionOccurred = true;
                
                // Move away from collision
                const angle = Math.atan2(dy, dx);
                newX = otherPos.x + Math.cos(angle) * orbRadius * 2.1;
                newY = otherPos.y + Math.sin(angle) * orbRadius * 2.1;
              }
            }
          });
          
          // Ensure position stays in bounds
          newX = Math.max(padding, Math.min(100 - padding, newX));
          newY = Math.max(padding, Math.min(100 - padding, newY));
          
          return { x: newX, y: newY };
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, movementParams, voiceNote.id, allVoiceNotes, positions]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Show tooltip with a slight delay
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 200);
    
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // Handle autoplay policy restrictions
          console.log('Autoplay blocked:', error);
          // Don't set isPlaying to true if autoplay fails
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    
    // Clear the tooltip timeout if it exists
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleClick = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Failed to play audio:', error);
          });
      }
    }
  };

  // Generate a color for non-own notes (using publicKey for consistency)
  const getOrbColor = () => {
    if (isOwnNote) return 'rgb(74 222 128)'; // green-400
    
    // Extended color palette with even more variety
    const colors = [
      'rgb(251 146 60)', // orange-400
      'rgb(250 204 21)', // yellow-400
      'rgb(147 51 234)', // purple-600
      'rgb(236 72 153)', // pink-500
      'rgb(59 130 246)', // blue-500
      'rgb(168 85 247)', // purple-500
      'rgb(249 115 22)', // orange-500
      'rgb(239 68 68)',  // red-500
      'rgb(34 197 94)',  // green-500
      'rgb(14 165 233)', // sky-500
      'rgb(99 102 241)', // indigo-500
      'rgb(244 63 94)',  // rose-500
      'rgb(245 158 11)', // amber-500
      'rgb(16 185 129)', // emerald-500
      'rgb(6 182 212)',  // cyan-500
      'rgb(217 70 239)', // fuchsia-500
      'rgb(124 58 237)', // violet-600
      'rgb(220 38 38)',  // red-600
      'rgb(37 99 235)',  // blue-600
      'rgb(251 191 36)', // amber-400
      'rgb(252 165 165)', // red-300
      'rgb(253 186 116)', // orange-300
      'rgb(253 224 71)', // yellow-300
      'rgb(134 239 172)', // green-300
      'rgb(147 197 253)', // blue-300
      'rgb(196 181 253)', // purple-300
      'rgb(249 168 212)', // pink-300
      'rgb(165 243 252)', // cyan-300
      'rgb(233 213 255)', // purple-200
      'rgb(254 202 202)', // red-200
      'rgb(254 215 170)', // orange-200
      'rgb(254 240 138)', // yellow-200
      'rgb(187 247 208)', // green-200
      'rgb(191 219 254)', // blue-200
      'rgb(221 214 254)', // purple-200
      'rgb(251 207 232)', // pink-200
      'rgb(207 250 254)', // cyan-200
      'rgb(248 113 113)', // red-400
      'rgb(96 165 250)', // blue-400
      'rgb(167 139 250)', // purple-400
      'rgb(244 114 182)', // pink-400
      'rgb(34 211 238)', // cyan-400
      'rgb(129 140 248)', // indigo-400
      'rgb(52 211 153)', // emerald-400
      'rgb(45 212 191)', // teal-400
      'rgb(56 189 248)', // sky-400
      'rgb(192 132 252)', // violet-400
      'rgb(232 121 249)', // fuchsia-400
      'rgb(250 176 5)', // yellow-500
      'rgb(234 179 8)', // yellow-600
      'rgb(202 138 4)', // yellow-700
      'rgb(161 98 7)', // yellow-800
      'rgb(234 88 12)', // orange-600
      'rgb(194 65 12)', // orange-700
      'rgb(154 52 18)', // orange-800
      'rgb(127 29 29)', // red-800
      'rgb(153 27 27)', // red-900
      'rgb(30 41 59)', // slate-800
      'rgb(51 65 85)', // slate-700
      'rgb(71 85 105)', // slate-600
      'rgb(100 116 139)', // slate-500
      'rgb(148 163 184)', // slate-400
      'rgb(203 213 225)', // slate-300
      'rgb(31 41 55)', // gray-800
      'rgb(55 65 81)', // gray-700
      'rgb(75 85 99)', // gray-600
      'rgb(107 114 128)', // gray-500
      'rgb(156 163 175)', // gray-400
      'rgb(209 213 219)', // gray-300
      // Additional vibrant colors
      'rgb(255 0 128)', // hot pink
      'rgb(0 255 255)', // aqua
      'rgb(255 128 0)', // dark orange
      'rgb(128 0 255)', // purple
      'rgb(0 255 128)', // spring green
      'rgb(255 0 255)', // magenta
      'rgb(128 255 0)', // lime
      'rgb(0 128 255)', // sky blue
      'rgb(255 255 0)', // yellow
      'rgb(255 0 64)',  // crimson
      'rgb(0 255 192)', // turquoise
      'rgb(255 192 0)', // gold
      'rgb(192 0 255)', // violet
      'rgb(0 192 255)', // light blue
      'rgb(255 64 0)',  // red orange
      'rgb(64 0 255)',  // indigo
      'rgb(0 255 64)',  // green
      'rgb(255 128 128)', // light coral
      'rgb(128 255 128)', // light green
      'rgb(128 128 255)', // light blue
      'rgb(255 128 255)', // light magenta
      'rgb(128 255 255)', // light cyan
      'rgb(255 255 128)', // light yellow
      'rgb(192 192 192)', // silver
      'rgb(255 192 203)', // pink
      'rgb(255 218 185)', // peach puff
      'rgb(255 228 196)', // bisque
      'rgb(255 248 220)', // cornsilk
      'rgb(255 255 240)', // ivory
      'rgb(240 248 255)', // alice blue
      'rgb(230 230 250)', // lavender
      'rgb(216 191 216)', // thistle
      'rgb(221 160 221)', // plum
      'rgb(238 130 238)', // violet
      'rgb(255 105 180)', // hot pink
      'rgb(255 20 147)',  // deep pink
      'rgb(255 69 0)',    // orange red
      'rgb(255 140 0)',   // dark orange
      'rgb(255 165 0)',   // orange
      'rgb(255 215 0)',   // gold
      'rgb(255 228 181)', // moccasin
      'rgb(255 222 173)', // navajo white
      'rgb(255 228 225)', // misty rose
      'rgb(255 240 245)', // lavender blush
      'rgb(250 235 215)', // antique white
      'rgb(250 250 210)', // light goldenrod yellow
      'rgb(255 250 205)', // lemon chiffon
      'rgb(240 255 240)', // honeydew
      'rgb(245 255 250)', // mint cream
      'rgb(240 255 255)', // azure
      'rgb(240 248 255)', // alice blue
      'rgb(248 248 255)', // ghost white
      'rgb(245 245 245)', // white smoke
      'rgb(255 245 238)', // seashell
      'rgb(245 245 220)', // beige
      'rgb(253 245 230)', // old lace
      'rgb(255 250 240)', // floral white
      'rgb(255 255 240)', // ivory
      'rgb(250 240 230)', // linen
    ];
    
    const index = parseInt(voiceNote.author.slice(0, 8), 16) % colors.length;
    return colors[index];
  };
  
  const orbColor = getOrbColor();
  
  return (
    <>
      <div
        ref={orbRef}
        className="absolute cursor-pointer transition-transform duration-300"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%)`,
          opacity: 0,
          animation: 'fadeIn 2s ease-out forwards',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
      {/* Container for all orb elements */}
      <div className="relative" style={{ width: '48px', height: '48px' }}>
        {/* Outer glow */}
        <div
          className="absolute rounded-full blur-xl"
          style={{
            width: '70px',
            height: '70px',
            background: orbColor,
            opacity: isHovered ? 0.2 : 0.15,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            animation: isPlaying ? 'slowPulse 1.5s ease-in-out infinite' : 'breathe 4s ease-in-out infinite',
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
        
        {/* Middle glow */}
        <div
          className="absolute rounded-full blur-md"
          style={{
            width: '55px',
            height: '55px',
            background: orbColor,
            opacity: isHovered ? 0.35 : 0.25,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            animation: isPlaying ? 'slowPulse 1.5s ease-in-out infinite 0.2s' : 'breathe 4s ease-in-out infinite 0.5s',
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
        
        {/* Inner glow */}
        <div
          className="absolute rounded-full blur-sm"
          style={{
            width: '45px',
            height: '45px',
            background: orbColor,
            opacity: isHovered ? 0.4 : 0.3,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            animation: isPlaying ? 'slowPulse 1.5s ease-in-out infinite 0.4s' : 'breathe 4s ease-in-out infinite 1s',
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
        
        {/* Core orb */}
        <div
          className="relative w-12 h-12 rounded-full"
          style={{
            backgroundColor: orbColor,
            boxShadow: isHovered 
              ? `0 0 30px ${orbColor}, inset 0 0 15px rgba(255,255,255,0.4)` 
              : `0 0 20px ${orbColor}, inset 0 0 10px rgba(255,255,255,0.3)`,
            transition: 'box-shadow 0.5s ease-in-out',
          }}
        />
      </div>
      
      <audio
        ref={audioRef}
        src={voiceNote.audioUrl}
        preload="none"
        playsInline
      />
    </div>
    
    {/* Toast notification rendered via portal */}
    {showTooltip && createPortal(
      <div 
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500"
        style={{ 
          animation: 'toastFadeIn 0.5s ease-out forwards',
        }}
      >
        <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full text-sm text-gray-300 shadow-2xl flex items-center gap-3 border border-gray-800">
          <span className="font-medium text-white">{displayName}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">
            {formatDistanceToNow(voiceNote.timestamp * 1000)} ago
          </span>
          {isOwnNote && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-green-400/90 text-xs">your voice</span>
            </>
          )}
        </div>
      </div>,
      document.body
    )}
    </>
  );
}