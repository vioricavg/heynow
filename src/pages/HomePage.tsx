import { useEffect, useMemo } from 'react';
import { useVoiceNotes } from '@/hooks/useVoiceNotes';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { usePublishProfile } from '@/hooks/usePublishProfile';
import { VoiceNote } from '@/components/VoiceNote';
import { MatrixVoiceBar } from '@/components/MatrixVoiceBar';
import { VibesVoiceWave } from '@/components/VibesVoiceWave';
import { RecordButton } from '@/components/RecordButton';
import { useViewMode } from '@/contexts/ViewModeContext';

export function HomePage() {
  const { user, isReady } = useAutoAccount();
  const { data: voiceNotes, isLoading } = useVoiceNotes();
  const { viewMode, setViewMode } = useViewMode();
  
  // Publish profile metadata
  usePublishProfile();

  // Memoize voice notes to prevent unnecessary re-renders
  const memoizedVoiceNotes = useMemo(() => voiceNotes || [], [voiceNotes]);

  useEffect(() => {
    // Add animation styles once
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      @keyframes toastFadeIn {
        0% {
          opacity: 0;
          transform: translate(-50%, 20px) scale(0.9);
          filter: blur(4px);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
          filter: blur(0);
        }
      }
      
      @keyframes breathe {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: inherit;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.15);
          opacity: calc(inherit * 1.3);
        }
      }
      
      @keyframes slowPulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 0.8;
        }
        50% {
          opacity: 0.4;
        }
      }
      
      @keyframes matrixFall {
        0% {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateX(-50%) translateY(100vh);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-gray-600 text-sm animate-pulse">
          initializing cosmic connection...
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden ${viewMode === 'vibes' ? 'bg-gradient-to-b from-purple-950/20 to-black' : 'bg-black'}`}>
      {/* Mode selector */}
      <div className="absolute top-8 left-8 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cosmos')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'cosmos' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-gray-600 hover:bg-white/10 hover:text-gray-400'
            }`}
          >
            cosmos
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'matrix' 
                ? 'bg-green-900/50 text-green-400' 
                : 'bg-white/5 text-gray-600 hover:bg-green-900/30 hover:text-green-600'
            }`}
          >
            matrix
          </button>
          <button
            onClick={() => setViewMode('vibes')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'vibes' 
                ? 'bg-purple-900/50 text-purple-400' 
                : 'bg-white/5 text-gray-600 hover:bg-purple-900/30 hover:text-purple-600'
            }`}
          >
            vibes
          </button>
        </div>
      </div>
      
      {/* User info */}
      <div className="absolute top-8 right-8 text-right z-50">
        <div className={`text-xs ${viewMode === 'matrix' ? 'text-green-600' : viewMode === 'vibes' ? 'text-purple-600' : 'text-gray-600'}`}>you are</div>
        <div className={`text-sm ${viewMode === 'matrix' ? 'text-green-400 font-mono' : viewMode === 'vibes' ? 'text-purple-400' : 'text-gray-400'}`}>{user?.name}</div>
      </div>

      {/* Voice notes canvas */}
      <div className="relative w-full h-full">
        {viewMode === 'cosmos' ? (
          // Cosmos mode - floating orbs
          <>
            {memoizedVoiceNotes.map((voiceNote) => (
              <VoiceNote 
                key={voiceNote.id} 
                voiceNote={voiceNote}
              />
            ))}
          </>
        ) : viewMode === 'matrix' ? (
          // Matrix mode - vertical bars
          <div className="relative w-full h-full">
            {/* Matrix background effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-gradient-to-b from-green-400/20 to-transparent" />
            </div>
            
            {/* Ambient matrix rain effect */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="absolute text-green-500 font-mono text-xs"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animation: `matrixFall ${10 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`,
                  }}
                >
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </div>
              ))}
            </div>
            
            {memoizedVoiceNotes.map((voiceNote, index) => (
              <MatrixVoiceBar
                key={voiceNote.id}
                voiceNote={voiceNote}
                index={index}
                totalBars={memoizedVoiceNotes.length || 1}
              />
            ))}
          </div>
        ) : (
          // Vibes mode - flowing waves
          <div className="relative w-full h-full">
            {/* Vibes background effect */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-gradient-to-t from-purple-600/10 via-transparent to-transparent" />
            </div>
            
            {memoizedVoiceNotes.map((voiceNote, index) => (
              <VibesVoiceWave
                key={voiceNote.id}
                voiceNote={voiceNote}
                index={index}
                totalWaves={memoizedVoiceNotes.length || 1}
              />
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-xs ${viewMode === 'matrix' ? 'text-green-700 font-mono' : viewMode === 'vibes' ? 'text-purple-700' : 'text-gray-700'}`}>
              {viewMode === 'matrix' ? 'connecting to matrix...' : viewMode === 'vibes' ? 'tuning into the vibes...' : 'listening to the void...'}
            </div>
          </div>
        )}
        
        {!isLoading && memoizedVoiceNotes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-xs text-center ${viewMode === 'matrix' ? 'text-green-700 font-mono' : viewMode === 'vibes' ? 'text-purple-700' : 'text-gray-700'}`}>
              <div>{viewMode === 'matrix' ? 'no signals detected' : viewMode === 'vibes' ? 'no vibes yet' : 'the cosmos is silent'}</div>
              <div className="mt-2">{viewMode === 'matrix' ? 'upload your voice' : viewMode === 'vibes' ? 'share your vibe' : 'be the first voice'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Record button */}
      <RecordButton />
      
      {/* Instructions */}
      <div className={`absolute bottom-8 left-8 text-xs ${viewMode === 'matrix' ? 'text-green-700 font-mono' : viewMode === 'vibes' ? 'text-purple-700' : 'text-gray-700'}`}>
        {viewMode === 'matrix' ? 'hover bars to decode • click + to transmit' : viewMode === 'vibes' ? 'hover waves to feel • click + to vibe' : 'hover to listen • click + to speak'}
      </div>
    </div>
  );
}