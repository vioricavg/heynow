export function generateName(): string {
  const adjectives = [
    'cosmic', 'ethereal', 'floating', 'dreamy', 'silent', 'whispered',
    'distant', 'gentle', 'soft', 'quiet', 'peaceful', 'serene',
    'drifting', 'wandering', 'glowing', 'shimmering', 'radiant', 'luminous',
    'nebulous', 'celestial', 'astral', 'stellar', 'lunar', 'solar'
  ];
  
  const nouns = [
    'voice', 'whisper', 'echo', 'murmur', 'breath', 'sigh',
    'dream', 'thought', 'memory', 'moment', 'fragment', 'particle',
    'wave', 'ripple', 'pulse', 'signal', 'frequency', 'vibration',
    'star', 'moon', 'comet', 'nebula', 'galaxy', 'cosmos'
  ];
  
  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  return `${randomItem(adjectives)}-${randomItem(nouns)}-${Math.floor(Math.random() * 1000)}`;
}