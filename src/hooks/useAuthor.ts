import { type NostrEvent, type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export function useAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<{ event?: NostrEvent; metadata?: NostrMetadata }>({
    queryKey: ['author', pubkey ?? ''],
    queryFn: async ({ signal }) => {
      if (!pubkey) {
        return {};
      }

      // Create abort signal - use fallback for Safari compatibility
      let querySignal: AbortSignal;
      if ('any' in AbortSignal && typeof AbortSignal.any === 'function') {
        querySignal = AbortSignal.any([signal, AbortSignal.timeout(1500)]);
      } else {
        // Fallback for browsers without AbortSignal.any
        const controller = new AbortController();
        querySignal = controller.signal;
        
        // Set timeout manually
        setTimeout(() => controller.abort(), 1500);
        
        // Also abort if the query is cancelled
        signal.addEventListener('abort', () => controller.abort());
      }

      const [event] = await nostr.query(
        [{ kinds: [0], authors: [pubkey!], limit: 1 }],
        { signal: querySignal },
      );

      if (!event) {
        throw new Error('No event found');
      }

      try {
        const metadata = n.json().pipe(n.metadata()).parse(event.content);
        return { metadata, event };
      } catch {
        return { event };
      }
    },
    retry: 3,
  });
}
