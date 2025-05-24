import { getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { NostrEvent, NostrSigner } from '@nostrify/nostrify';

export function createSigner(secretKey: Uint8Array): NostrSigner {
  const pubkey = getPublicKey(secretKey);
  
  return {
    getPublicKey: async () => pubkey,
    
    signEvent: async (event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>) => {
      const fullEvent = {
        ...event,
        pubkey,
        created_at: event.created_at || Math.floor(Date.now() / 1000),
      };
      
      return finalizeEvent(fullEvent, secretKey);
    },
    
    nip04: {
      encrypt: async () => {
        throw new Error('NIP-04 encryption not implemented');
      },
      decrypt: async () => {
        throw new Error('NIP-04 decryption not implemented');
      }
    }
  };
}