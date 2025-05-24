import { useEffect, useRef } from 'react';
import { useNostrPublish } from './useNostrPublish';
import { useAutoAccount } from './useAutoAccount';

export function usePublishProfile() {
  const { user } = useAutoAccount();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const hasPublished = useRef(false);

  useEffect(() => {
    if (user && !hasPublished.current) {
      // Publish profile metadata
      publishEvent({
        kind: 0,
        content: JSON.stringify({
          name: user.name,
          about: 'floating voice in the cosmos',
          picture: `https://robohash.org/${user.publicKey}.png?set=set4&size=200x200`
        })
      }).then(() => {
        hasPublished.current = true;
      }).catch(console.error);
    }
  }, [user, publishEvent]);
}