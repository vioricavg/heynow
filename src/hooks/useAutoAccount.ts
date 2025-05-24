import { useEffect, useState } from 'react';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { generateName } from '@/lib/generateName';

export interface AutoUser {
  secretKey: number[];
  publicKey: string;
  name: string;
}

// Store the user in memory for the session only
let sessionUser: AutoUser | null = null;

export function useAutoAccount() {
  const [user, setUser] = useState<AutoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we already have a user for this session
    if (sessionUser) {
      setUser(sessionUser);
      setIsReady(true);
    } else {
      // Generate new account for this session
      const secretKey = generateSecretKey();
      const publicKey = getPublicKey(secretKey);
      
      const name = generateName();
      
      const newUser: AutoUser = {
        secretKey: Array.from(secretKey),
        publicKey,
        name
      };
      
      // Store in memory for this session only
      sessionUser = newUser;
      
      setUser(newUser);
      setIsReady(true);
    }
  }, []);

  return { user, isReady };
}