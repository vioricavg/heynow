import { ReactNode, useRef } from 'react';
import { NostrEvent, NPool, NRelay1 } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';

interface AutoNostrProviderProps {
  children: ReactNode;
}

export function AutoNostrProvider({ children }: AutoNostrProviderProps) {
  const relayUrls = [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
    'wss://relay.snort.social',
    'wss://relay.primal.net'
  ];

  // Create NPool instance only once
  const pool = useRef<NPool | undefined>(undefined);

  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        return new NRelay1(url);
      },
      reqRouter(filters) {
        return new Map(relayUrls.map((url) => [url, filters]));
      },
      eventRouter(_event: NostrEvent) {
        return relayUrls;
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
}