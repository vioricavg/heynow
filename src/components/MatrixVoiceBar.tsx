import { useEffect, useRef, useState, memo } from 'react';
import { VoiceNote as VoiceNoteType } from '@/hooks/useVoiceNotes';
import { useAuthor } from '@/hooks/useAuthor';
import { useAutoAccount } from '@/hooks/useAutoAccount';

interface MatrixVoiceBarProps {
  voiceNote: VoiceNoteType;
  index: number;
  totalBars: number;
}

export const MatrixVoiceBar = memo(function MatrixVoiceBar({ voiceNote, index, totalBars }: MatrixVoiceBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const author = useAuthor(voiceNote.author);
  const { user } = useAutoAccount();
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || voiceNote.author.slice(0, 8);
  const isOwnNote = user?.publicKey === voiceNote.author;
  
  // Calculate opacity based on age
  const calculateOpacity = () => {
    const now = Math.floor(Date.now() / 1000);
    const age = now - voiceNote.timestamp;
    const maxAge = 10 * 60; // 10 minutes
    const fadeStartAge = 9 * 60; // Start fading at 9 minutes
    
    if (age >= maxAge) return 0;
    if (age >= fadeStartAge) {
      return 1 - ((age - fadeStartAge) / (maxAge - fadeStartAge));
    }
    return 1;
  };
  
  const [opacity, setOpacity] = useState(calculateOpacity());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(calculateOpacity());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [voiceNote.timestamp]);
  
  // Audio ended handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
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
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };
  
  // Calculate bar position
  const barWidth = 100 / totalBars;
  const leftPosition = index * barWidth;
  
  // Generate falling characters
  const [characters, setCharacters] = useState<Array<{ char: string; offset: number }>>([]);
  
  useEffect(() => {
    // Generate random characters for this bar
    const chars: Array<{ char: string; offset: number }> = [];
    const charCount = Math.floor(window.innerHeight / 20); // One character per 20px
    
    for (let i = 0; i < charCount; i++) {
      chars.push({
        char: String.fromCharCode(0x30A0 + Math.random() * 96), // Random katakana
        offset: Math.random() * 100
      });
    }
    setCharacters(chars);
  }, []);
  
  return (
    <div
      className="absolute top-0 bottom-0 cursor-pointer transition-all duration-300"
      style={{
        left: `${leftPosition}%`,
        width: `${barWidth}%`,
        opacity,
        filter: isHovered ? 'brightness(1.5)' : 'brightness(1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Falling characters */}
      <div className="relative h-full overflow-hidden">
        {characters.map((char, i) => (
          <div
            key={i}
            className="absolute text-green-400 font-mono text-sm"
            style={{
              top: `${(char.offset + (isPlaying ? Date.now() / 50 : 0)) % 100}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: isOwnNote ? 1 : 0.3 + (isPlaying ? 0.4 : 0),
              animation: isPlaying ? 'matrixFall 3s linear infinite' : 'none',
              animationDelay: `${i * 0.1}s`,
              textShadow: isOwnNote 
                ? '0 0 5px #00ff00, 0 0 10px #00ff00' 
                : '0 0 3px #00ff00',
            }}
          >
            {char.char}
          </div>
        ))}
      </div>
      
      {/* Bar highlight */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-green-400/20 to-transparent pointer-events-none"
        style={{
          opacity: isPlaying ? 0.8 : 0.2,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      
      {/* Bottom label */}
      {isHovered && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">
          <div className="font-mono text-center">
            {displayName}
            {isOwnNote && <div className="text-green-300">your voice</div>}
          </div>
        </div>
      )}
      
      <audio
        ref={audioRef}
        src={voiceNote.audioUrl}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
});