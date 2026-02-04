# Google Meet Mute Helper

A Chrome extension for people who use push-to-talk apps (like [Mic Drop](https://getmicdrop.com/), [Shush](https://mizage.com/shush/), or similar) with Google Meet.

## The Problem

When you use a push-to-talk app to mute your system audio, Google Meet:
1. Shows an annoying "Microphone muted by system" popup
2. Eventually mutes you at the Meet level, defeating the purpose of using push-to-talk

This extension fixes both issues.

## What It Does

- **Hides the popup** - The "Microphone muted by system" dialog is automatically hidden
- **Auto-unmutes** - If Meet tries to mute you, the extension clicks the unmute button automatically

This lets you use your push-to-talk app as your sole mute mechanism without Meet interfering.

## Installation

1. Download or clone this repository
2. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`, etc.)
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

## Compatibility

- **Google Meet** (`meet.google.com`)
- **Chrome-based browsers** (Chrome, Edge, Brave, Arc, Dia, etc.)
- **Any push-to-talk app** that mutes system audio (Mic Drop, Shush, etc.)

## How It Works

The extension uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to watch for:
- New DOM elements matching the popup pattern (hides them)
- Changes to the mic button's `data-is-muted` attribute (clicks unmute if Meet mutes you)

## Troubleshooting

**The popup still appears briefly:**
The observer fires on DOM mutations, so there may be a frame or two before it's hidden. This is normal.

**Meet keeps muting me:**
Check the browser console for `[Google Meet Mute Helper]` logs to verify the extension is running. If Meet is winning a "mute war," open an issue.

**The extension stopped working after a Meet update:**
Google changes their DOM structure periodically. Open an issue with the new DOM structure and I'll update the selectors.

## License

MIT
