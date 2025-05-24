import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';
import { createSigner } from '@/lib/createSigner';
import { useAutoAccount } from './useAutoAccount';

export function useUploadFile() {
  const { user } = useAutoAccount();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('User not initialized');
      }

      // Create signer from stored secret key
      const secretKey = new Uint8Array(user.secretKey);
      const signer = createSigner(secretKey);

      const uploader = new BlossomUploader({
        servers: [
          'https://blossom.primal.net/',
        ],
        signer,
      });

      const tags = await uploader.upload(file);
      return tags;
    },
  });
}