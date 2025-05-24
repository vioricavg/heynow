import { useEffect, useMemo } from 'react';
import { useVoiceNotes } from '@/hooks/useVoiceNotes';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { usePublishProfile } from '@/hooks/usePublishProfile';
import { VoiceNote } from '@/components/VoiceNote';
import { MatrixVoiceBar } from '@/components/MatrixVoiceBar';
import { VibesVoiceWave } from '@/components/VibesVoiceWave';
import { HyperspaceVoiceStream } from '@/components/HyperspaceVoiceStream';
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
    <div className={`fixed inset-0 overflow-hidden ${
      viewMode === 'vibes' ? 'bg-gradient-to-b from-purple-950/20 to-black' : 
      viewMode === 'hyperspace' ? 'bg-black' : 
      'bg-black'
    }`}>
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
          <button
            onClick={() => setViewMode('hyperspace')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'hyperspace' 
                ? 'bg-gradient-to-r from-red-500/50 via-yellow-500/50 to-blue-500/50 text-white' 
                : 'bg-white/5 text-gray-600 hover:bg-gradient-to-r hover:from-red-500/20 hover:via-yellow-500/20 hover:to-blue-500/20 hover:text-gray-400'
            }`}
          >
            hyperspace
          </button>
        </div>
      </div>
      
      {/* User info */}
      <div className="absolute top-8 right-8 text-right z-50">
        <div className={`text-xs ${
          viewMode === 'matrix' ? 'text-green-600' : 
          viewMode === 'vibes' ? 'text-purple-600' : 
          viewMode === 'hyperspace' ? 'text-cyan-600' :
          'text-gray-600'
        }`}>you are</div>
        <div className={`text-sm ${
          viewMode === 'matrix' ? 'text-green-400 font-mono' : 
          viewMode === 'vibes' ? 'text-purple-400' : 
          viewMode === 'hyperspace' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' :
          'text-gray-400'
        }`}>{user?.name}</div>
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
            
            {memoizedVoiceNotes.map((voiceNote, index) => (
              <MatrixVoiceBar
                key={voiceNote.id}
                voiceNote={voiceNote}
                index={index}
                totalBars={memoizedVoiceNotes.length || 1}
              />
            ))}
          </div>
        ) : viewMode === 'vibes' ? (
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
        ) : (
          // Hyperspace mode - radiating light streams
          <div className="relative w-full h-full">
            {/* Hyperspace background effect */}
            <div className="absolute inset-0">
              <div className="h-full w-full bg-black">
                {/* Radial gradient overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 70%, black 100%)',
                  }}
                />
              </div>
            </div>
            
            {/* All voice notes rendered as overlapping streams */}
            <div className="absolute inset-0">
              {memoizedVoiceNotes.map((voiceNote, index) => (
                <HyperspaceVoiceStream
                  key={voiceNote.id}
                  voiceNote={voiceNote}
                  index={index}
                  totalStreams={memoizedVoiceNotes.length || 1}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-xs ${
              viewMode === 'matrix' ? 'text-green-700 font-mono' : 
              viewMode === 'vibes' ? 'text-purple-700' : 
              viewMode === 'hyperspace' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' :
              'text-gray-700'
            }`}>
              {viewMode === 'matrix' ? 'connecting to matrix...' : 
               viewMode === 'vibes' ? 'tuning into the vibes...' : 
               viewMode === 'hyperspace' ? 'entering hyperspace...' :
               'listening to the void...'}
            </div>
          </div>
        )}
        
        {!isLoading && memoizedVoiceNotes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-xs text-center ${
              viewMode === 'matrix' ? 'text-green-700 font-mono' : 
              viewMode === 'vibes' ? 'text-purple-700' : 
              viewMode === 'hyperspace' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' :
              'text-gray-700'
            }`}>
              <div>{viewMode === 'matrix' ? 'no signals detected' : 
                    viewMode === 'vibes' ? 'no vibes yet' : 
                    viewMode === 'hyperspace' ? 'hyperspace empty' :
                    'the cosmos is silent'}</div>
              <div className="mt-2">{viewMode === 'matrix' ? 'upload your voice' : 
                                    viewMode === 'vibes' ? 'share your vibe' : 
                                    viewMode === 'hyperspace' ? 'launch your voice' :
                                    'be the first voice'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Record button */}
      <RecordButton />
      
      {/* Instructions */}
      <div className={`absolute bottom-8 left-8 text-xs ${
        viewMode === 'matrix' ? 'text-green-700 font-mono' : 
        viewMode === 'vibes' ? 'text-purple-700' : 
        viewMode === 'hyperspace' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' :
        'text-gray-700'
      }`}>
        {viewMode === 'matrix' ? 'hover bars to decode • click + to transmit' : 
         viewMode === 'vibes' ? 'click waves to feel • click + to vibe' : 
         viewMode === 'hyperspace' ? 'click streams to activate • click + to launch' :
         'click to listen • click + to speak'}
      </div>
    </div>
  );
}