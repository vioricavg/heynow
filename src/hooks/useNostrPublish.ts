import { useNostr } from "@nostrify/react";
import { useMutation } from "@tanstack/react-query";
import { createSigner } from '@/lib/createSigner';
import { useAutoAccount } from './useAutoAccount';

interface EventTemplate {
  kind: number;
  content?: string;
  tags?: string[][];
  created_at?: number;
}

export function useNostrPublish() {
  const { nostr } = useNostr();
  const { user } = useAutoAccount();

  return useMutation({
    mutationFn: async (t: EventTemplate) => {
      if (user) {
        const tags = t.tags ?? [];

        // Add the client tag if it doesn't exist
        if (!tags.some((tag) => tag[0] === "client")) {
          tags.push(["client", "heynow"]);
        }

        // Create signer from stored secret key
        const secretKey = new Uint8Array(user.secretKey);
        const signer = createSigner(secretKey);

        const event = await signer.signEvent({
          kind: t.kind,
          content: t.content ?? "",
          tags,
          created_at: t.created_at ?? Math.floor(Date.now() / 1000),
        });

        await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      } else {
        throw new Error("User is not initialized");
      }
    },
    onError: (error) => {
      console.error("Failed to publish event:", error);
    },
    onSuccess: (data) => {
      console.log("Event published successfully:", data);
    },
  });
}