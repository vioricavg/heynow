import { useEffect } from 'react';
import { useVoiceNotes } from '@/hooks/useVoiceNotes';
import { useAutoAccount } from '@/hooks/useAutoAccount';
import { usePublishProfile } from '@/hooks/usePublishProfile';
import { VoiceNote } from '@/components/VoiceNote';
import { RecordButton } from '@/components/RecordButton';

export function HomePage() {
  const { user, isReady } = useAutoAccount();
  const { data: voiceNotes, isLoading } = useVoiceNotes();
  
  // Publish profile metadata
  usePublishProfile();

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
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Title */}
      <div className="absolute top-8 left-8 text-white/20 text-sm font-light tracking-widest">
        heynow
      </div>
      
      {/* User info */}
      <div className="absolute top-8 right-8 text-right">
        <div className="text-gray-600 text-xs">you are</div>
        <div className="text-gray-400 text-sm">{user?.name}</div>
      </div>

      {/* Voice notes canvas */}
      <div className="relative w-full h-full">
        {voiceNotes?.map((voiceNote) => (
          <VoiceNote 
            key={voiceNote.id} 
            voiceNote={voiceNote}
          />
        ))}
        
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-gray-700 text-xs">listening to the void...</div>
          </div>
        )}
        
        {!isLoading && (!voiceNotes || voiceNotes.length === 0) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-gray-700 text-xs text-center">
              <div>the cosmos is silent</div>
              <div className="mt-2">be the first voice</div>
            </div>
          </div>
        )}
      </div>

      {/* Record button */}
      <RecordButton />
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-8 text-gray-700 text-xs">
        click to listen • click + to speak
      </div>
    </div>
  );
}