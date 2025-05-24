export function createSigner(secretKey: Uint8Array) {
  return {
    getPublicKey: async () => {
      const { getPublicKey } = await import('nostr-tools/pure');
      return getPublicKey(secretKey);
    },
    signEvent: async (event: any) => {
      const { finalizeEvent } = await import('nostr-tools/pure');
      return finalizeEvent(event, secretKey);
    }
  };
}