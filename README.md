# heynow

**heynow** is a beautifully crafted ephemeral voice note application built on the Nostr protocol. It creates a cosmic voicemail system where voices float briefly in digital space before fading away.

## Core Concept

- **Ephemeral Voice Communication**: Users can record and share short voice notes that appear as floating orbs on a black background
- **Cosmic Theme**: The app has a space-like aesthetic with floating, glowing orbs representing voice notes
- **No Persistence**: Each page refresh creates a new identity - private keys are never persisted, making each session truly ephemeral
- **10-Minute Window**: Voice notes only display for the last 10 minutes, creating a sense of temporal presence

## Technical Architecture

### Technology Stack

- **Frontend**: React 18.x with TypeScript
- **Styling**: TailwindCSS 3.x with custom animations
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **State Management**: TanStack Query (React Query)
- **Nostr Integration**: Nostrify framework
- **Routing**: React Router DOM

### Key Features

1. **Auto-Generated Identities**
   - Generates a new Nostr keypair for each session
   - Creates cosmic-themed usernames (e.g., "ethereal-nebula-742")
   - No login required - completely anonymous

2. **Voice Recording**
   - Uses MediaRecorder API with polyfill for Safari support
   - Records audio and uploads to Blossom servers
   - Publishes as Nostr kind 1069 events

3. **Visual Design**
   - Voice notes appear as colored floating orbs
   - Own notes appear green, others get random vibrant colors
   - Smooth animations: floating, breathing, pulsing effects
   - Hover interactions trigger audio playback
   - Minimalist black background creates focus

4. **Nostr Integration**
   - Connects to multiple relays (damus, nostr.band, nos.lol, etc.)
   - Uses NPool for relay management
   - Queries for kind 1069 events (voice notes)
   - Auto-refreshes every 10 seconds

5. **Audio Storage**
   - Uses Blossom protocol for decentralized file storage
   - Uploads to blossom.primal.net
   - Returns URLs that are embedded in Nostr events

## User Experience

- **Immediate Use**: No signup, just open and start recording
- **Visual Feedback**: Orbs glow and pulse when playing
- **Spatial Audio**: Voice notes positioned randomly across the screen
- **Temporal**: Only shows recent voices (last 10 minutes)
- **Anonymous**: Each session is a new identity

## Architecture Highlights

- **Component-Based**: Clean separation of concerns
- **Custom Hooks**: Reusable logic for Nostr operations
- **Type Safety**: Full TypeScript implementation
- **Performance**: Query caching, position caching, lazy audio loading
- **Responsive**: Works on desktop and mobile (with HTTPS requirement for recording)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run development server with HTTPS (required for audio recording on iOS)
npm run dev:https

# Build for production
npm run build

# Run tests and build
npm run ci
```

## Deployment

The app can be deployed to any static hosting service:

```bash
# Build and deploy to Surge
npm run deploy
```

## Note

This is a creative exploration of ephemeral, anonymous communication using the Nostr protocol. Each voice exists briefly in the cosmos before fading into silence.
