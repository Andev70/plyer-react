# Plyer-React

A beautiful, responsive, and feature-rich React/Next.js video player component.

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://www.npmjs.com/package/plyer-react)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- ⚛️ **React-First**: Designed as a hook-based functional component.
- 🎨 **Modern UI**: Dark theme with glassmorphism effects.
- 📱 **Responsive**: Works across all device types.
- 📡 **Adaptive Streaming**: Built-in support for HLS (`hls.js`) and DASH (`dashjs`).
- ⚡ **Buffering Loader**: Real-time loading feedback.
- 📥 **Buffered Data**: Visualization of loaded video segments in the timeline.
- ⏩ **Playback Speed**: Control from 0.5x to 2x.
- 🖼️ **Picture-in-Picture & Fullscreen**: Native browser support.
- 🖱️ **Smart Controls**: Auto-hides on inactivity.

## Installation

```bash
npm install plyer-react hls.js dashjs
```

## Usage

```jsx
import Plyer from 'plyer-react';
import 'plyer-react/dist/style.css';

function App() {
  return (
    <div style={{ width: '800px' }}>
      <Plyer 
        src="https://example.com/video.m3u8" 
        poster="https://example.com/poster.jpg"
      />
    </div>
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | string | The URL of the video source (MP4, HLS, or DASH). |
| `sources` | array | Optional array of quality sources: `[{ label: '720p', src: '...' }]`. |
| `poster` | string | URL of the video poster image. |

## License

MIT © [Andev70](https://github.com/Andev70)
